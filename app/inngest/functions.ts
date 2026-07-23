import { inngest } from '@/app/lib/inngest';
import { CampaignJobService } from '@/app/services/CampaignJobService';
import { JobListingService } from '@/app/services/JobListingService';
import { processJobEvaluation } from './evaluationHelpers';

export const evaluateJobs = inngest.createFunction(
  { id: 'evaluate-jobs-job', triggers: [{ event: 'app/evaluate.jobs' }] },
  async ({ event, step, logger }) => {
    const { campaignId } = event.data;

    logger.info({ campaignId }, 'Starting evaluateJobs function batch');

    // 1. Fetch next batch of unevaluated jobs (max 20 per execution step to stay well under Vercel timeout limits)
    const { batch, totalUnevaluated } = await step.run('fetch-unevaluated-batch', async () => {
      await CampaignJobService.updateCampaign(campaignId, { status: 'EVALUATING' });
      const jobs = await JobListingService.getUnevaluatedJobs(campaignId);
      const batch = jobs.slice(0, 20);
      return {
        batch: JSON.parse(JSON.stringify(batch)),
        totalUnevaluated: jobs.length,
      };
    });

    if (!batch || batch.length === 0) {
      logger.info('All jobs evaluated. Marking campaign as COMPLETED');
      await step.run('complete-campaign-empty', async () => {
        const allJobs = await JobListingService.getJobsBycampaign(campaignId);
        const qualifiedCount = allJobs.filter((j: any) => j.isQualified).length;
        await CampaignJobService.updateCampaign(campaignId, {
          status: 'COMPLETED',
          qualifiedJobs: qualifiedCount,
          totalJobs: allJobs.length,
        });
      });
      return { message: 'All jobs evaluated successfully' };
    }

    // 2. Evaluate batch of jobs concurrently in parallel chunks of 5
    await step.run('process-batch-chunk', async () => {
      const concurrencyLimit = 5;
      for (let i = 0; i < batch.length; i += concurrencyLimit) {
        const chunk = batch.slice(i, i + concurrencyLimit);
        await Promise.all(
          chunk.map((job: any) =>
            processJobEvaluation(job, logger).catch((err) => {
              logger.error({ err: err.message, jobId: job._id }, 'Job evaluation error');
            })
          )
        );
      }
    });

    const remainingCount = totalUnevaluated - batch.length;

    // 3. If there are still unevaluated jobs remaining, queue the next batch event recursively
    if (remainingCount > 0) {
      await step.run('enqueue-next-batch', async () => {
        logger.info({ remainingCount }, 'Enqueuing next evaluation batch event');
        await inngest.send({
          name: 'app/evaluate.jobs',
          data: { campaignId },
        });
      });
    } else {
      await step.run('complete-campaign-finished', async () => {
        const allJobs = await JobListingService.getJobsBycampaign(campaignId);
        const qualifiedCount = allJobs.filter((j: any) => j.isQualified).length;
        await CampaignJobService.updateCampaign(campaignId, {
          status: 'COMPLETED',
          qualifiedJobs: qualifiedCount,
          totalJobs: allJobs.length,
        });
      });
    }

    return { processedBatch: batch.length, remaining: Math.max(0, remainingCount) };
  }
);

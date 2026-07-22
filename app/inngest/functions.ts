import { inngest } from '@/app/lib/inngest';
import { CampaignJobService } from '@/app/services/CampaignJobService';
import { JobListingService } from '@/app/services/JobListingService';
import { processJobEvaluation } from './evaluationHelpers';

export const evaluateJobs = inngest.createFunction(
  { id: 'evaluate-jobs-job', triggers: [{ event: 'app/evaluate.jobs' }] },
  async ({ event, step, logger }) => {
    const { campaignId } = event.data;

    logger.info({ campaignId }, 'Starting evaluateJobs function');

    // 1. Fetch unevaluated jobs
    const jobsToEvaluate = await step.run('fetch-jobs', async () => {
      await CampaignJobService.updateCampaign(campaignId, { status: 'EVALUATING' });
      const jobs = await JobListingService.getUnevaluatedJobs(campaignId);
      logger.info({ count: jobs.length }, 'Found unevaluated jobs');
      return JSON.parse(JSON.stringify(jobs));
    });

    if (!jobsToEvaluate || jobsToEvaluate.length === 0) {
      logger.info('No jobs to evaluate');
      await CampaignJobService.updateCampaign(campaignId, { status: 'COMPLETED' });
      return { message: 'No jobs to evaluate' };
    }

    // 2. Evaluate each job with Gemini
    let qualifiedCount = 0;
    for (const job of jobsToEvaluate) {
      const isQualified = await step.run(`evaluate-job-${job._id}`, async () => {
        return await processJobEvaluation(job, logger);
      });

      if (isQualified) qualifiedCount++;

      // Respect Gemini rate limits
      await step.sleep(`sleep-${job._id}`, '2s');
    }

    // 3. Mark campaign as completed, update qualified count
    await step.run('complete-campaign', async () => {
      logger.info({ qualifiedCount }, 'Marking campaign as COMPLETED');
      await CampaignJobService.updateCampaign(campaignId, {
        status: 'COMPLETED',
        qualifiedJobs: qualifiedCount,
        totalJobs: jobsToEvaluate.length,
      });
    });

    logger.info({ processed: jobsToEvaluate.length, qualifiedCount }, 'Evaluation job complete');
    return { message: 'Evaluated successfully', processed: jobsToEvaluate.length, qualified: qualifiedCount };
  }
);

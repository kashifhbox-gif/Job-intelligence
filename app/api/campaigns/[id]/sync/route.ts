import { NextResponse } from 'next/server';
import { CampaignJobService } from '@/app/services/CampaignJobService';
import { SettingsService } from '@/app/services/SettingsService';
import { ApifyJobsService } from '@/app/services/ApifyJobsService';
import { JobListingService } from '@/app/services/JobListingService';
import { inngest } from '@/app/lib/inngest';
import { processJobEvaluation } from '@/app/inngest/evaluationHelpers';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { campaign } = await CampaignJobService.getCampaignDetails(id);

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (!campaign.apifyRunId) {
      return NextResponse.json({ error: 'No Apify run ID associated with this campaign' }, { status: 400 });
    }

    const adminConfig = await SettingsService.getAdminConfig();
    const apifyToken = adminConfig?.apifyApiKey || process.env.APIFY_API_TOKEN;
    if (!apifyToken) throw new Error('Apify API Token is not configured');

    const apifyService = new ApifyJobsService(apifyToken);
    
    // Check Apify run status first to avoid fetching dataset items on every request
    const run = await apifyService.getRun(campaign.apifyRunId);
    if (!run) {
      return NextResponse.json({ error: 'Apify run not found' }, { status: 404 });
    }

    const apifyStatus = run.status;

    // If still running or queueing, return status
    if (['RUNNING', 'READY', 'STARTING'].includes(apifyStatus)) {
      return NextResponse.json({ success: true, apifyStatus, status: campaign.status });
    }

    // If the run failed, update campaign status to FAILED
    if (['FAILED', 'ABORTED', 'TIMED_OUT'].includes(apifyStatus)) {
      if (campaign.status === 'SCRAPING') {
        await CampaignJobService.updateCampaign(id, { status: 'FAILED' });
      }
      return NextResponse.json({ success: true, apifyStatus, status: 'FAILED' });
    }

    // Fetch dataset items
    const dataset = await apifyService.getDatasetItems(campaign.apifyRunId);
    const items = dataset.items || [];

    if (items.length > 0 && campaign.status === 'SCRAPING') {
      const saved = await JobListingService.saveScrapedJobs(id, items, campaign.source);

      await CampaignJobService.updateCampaign(id, {
        status: 'SCRAPED',
        totalJobs: saved,
      });

      try {
        await inngest.send({
          name: 'app/evaluate.jobs',
          data: { campaignId: id },
        });
      } catch (e) {
        console.warn('Inngest send warning:', e);
      }
    }

    // Auto-evaluate unevaluated jobs in inline batch
    const unevaluated = await JobListingService.getUnevaluatedJobs(id);
    if (unevaluated.length > 0) {
      await CampaignJobService.updateCampaign(id, { status: 'EVALUATING' });
      const logger = {
        info: (obj: any, msg?: string) => console.log('🤖 Sync AI Eval:', msg || obj),
        error: (obj: any, msg?: string) => console.error('❌ Sync AI Eval Error:', msg || obj),
      };

      const batch = unevaluated.slice(0, 10);
      for (const job of batch) {
        try {
          await processJobEvaluation(job, logger);
        } catch (e) {
          /* ignore */
        }
      }

      const remaining = unevaluated.length - batch.length;
      const nextStatus = remaining <= 0 ? 'EVALUATED' : 'EVALUATING';
      await CampaignJobService.updateCampaign(id, { status: nextStatus });
      return NextResponse.json({ success: true, apifyStatus, status: nextStatus, evaluatedBatch: batch.length, remaining });
    }

    return NextResponse.json({ success: true, itemsCount: items.length, status: campaign.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

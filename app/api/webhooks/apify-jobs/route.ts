import { NextResponse } from 'next/server';
import { SettingsService } from '@/app/services/SettingsService';
import { ApifyJobsService } from '@/app/services/ApifyJobsService';
import { CampaignJobService } from '@/app/services/CampaignJobService';
import { JobListingService } from '@/app/services/JobListingService';
import { inngest } from '@/app/lib/inngest';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
    }

    const payload = await req.json();
    const runId = payload.eventData?.actorRunId;

    if (!runId) {
      return NextResponse.json({ error: 'Missing actorRunId in webhook payload' }, { status: 400 });
    }

    const eventType = payload.eventType;

    // Fetch campaign to know the source
    const { campaign } = await CampaignJobService.getCampaignDetails(campaignId);

    // Handle failed runs
    if (['ACTOR.RUN.FAILED', 'ACTOR.RUN.ABORTED', 'ACTOR.RUN.TIMED_OUT'].includes(eventType)) {
      await CampaignJobService.updateCampaign(campaignId, {
        status: 'FAILED',
        apifyRunId: runId,
      });
      return NextResponse.json({ success: true, message: `Handled failed event: ${eventType}` });
    }

    // Fetch Apify token
    const adminConfig = await SettingsService.getAdminConfig();
    const apifyToken = adminConfig?.apifyApiKey || process.env.APIFY_API_TOKEN;
    if (!apifyToken) throw new Error('Apify API Token is not configured');

    const apifyService = new ApifyJobsService(apifyToken);

    // Fetch dataset results
    const dataset = await apifyService.getDatasetItems(runId);
    const items = dataset.items;

    // Save items with source-aware mapping
    const saved = await JobListingService.saveScrapedJobs(campaignId, items, campaign.source);

    // Update campaign status
    await CampaignJobService.updateCampaign(campaignId, {
      status: 'SCRAPED',
      totalJobs: saved,
      apifyRunId: runId,
    });

    // Trigger AI evaluation
    await inngest.send({
      name: 'app/evaluate.jobs',
      data: { campaignId },
    });

    return NextResponse.json({ success: true, saved });
  } catch (error: any) {
    console.error('Apify Jobs Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

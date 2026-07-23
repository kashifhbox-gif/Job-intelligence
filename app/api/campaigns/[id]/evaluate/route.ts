import { NextResponse } from 'next/server';
import { CampaignJobService } from '@/app/services/CampaignJobService';
import { JobListingService } from '@/app/services/JobListingService';
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

    // Fetch all unevaluated jobs for this campaign
    const unevaluated = await JobListingService.getUnevaluatedJobs(id);

    if (unevaluated.length === 0) {
      await CampaignJobService.updateCampaign(id, { status: 'EVALUATED' });
      return NextResponse.json({
        success: true,
        evaluatedCount: 0,
        remainingCount: 0,
        status: 'EVALUATED',
        message: 'All jobs have already been evaluated.',
      });
    }

    await CampaignJobService.updateCampaign(id, { status: 'EVALUATING' });

    // Dummy logger for processJobEvaluation
    const logger = {
      info: (obj: any, msg?: string) => console.log('🤖 AI Eval:', msg || obj),
      error: (obj: any, msg?: string) => console.error('❌ AI Eval Error:', msg || obj),
    };

    // Evaluate up to 15 jobs per request batch to prevent serverless timeout
    const batchSize = 15;
    const batch = unevaluated.slice(0, batchSize);

    let evaluatedCount = 0;
    for (const job of batch) {
      try {
        await processJobEvaluation(job, logger);
        evaluatedCount++;
      } catch (e: any) {
        console.error(`Failed to evaluate job ${job._id}:`, e?.message);
      }
    }

    const remainingCount = unevaluated.length - evaluatedCount;
    const finalStatus = remainingCount === 0 ? 'EVALUATED' : 'EVALUATING';

    await CampaignJobService.updateCampaign(id, { status: finalStatus });

    return NextResponse.json({
      success: true,
      evaluatedCount,
      remainingCount,
      status: finalStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { CampaignJobService } from '@/app/services/CampaignJobService';
import { SettingsService } from '@/app/services/SettingsService';
import { ApifyJobsService } from '@/app/services/ApifyJobsService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const source = searchParams.get('source') || 'all';

    const result = await CampaignJobService.getCampaignsPaginated(page, limit, source);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, source, keyword, filters } = body;

    if (!name || !source || !keyword) {
      return NextResponse.json({ error: 'name, source, and keyword are required' }, { status: 400 });
    }

    // Create campaign record
    const campaign = await CampaignJobService.createCampaign({ name, source, keyword, filters });
    const campaignId = campaign._id.toString();

    // Build webhook URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const webhookUrl = `${appUrl}/api/webhooks/apify-jobs?campaignId=${campaignId}`;

    // Fetch Apify token
    const adminConfig = await SettingsService.getAdminConfig();
    const apifyToken = adminConfig?.apifyApiKey || process.env.APIFY_API_TOKEN;
    if (!apifyToken) {
      await CampaignJobService.updateCampaign(campaignId, { status: 'FAILED' });
      return NextResponse.json({ error: 'Apify API Token not configured. Add it in Settings.' }, { status: 400 });
    }

    const apifyService = new ApifyJobsService(apifyToken);

    // Dispatch correct actor based on source
    let run: any;

    switch (source) {
      case 'dice':
        run = await apifyService.startDiceScraper(
          keyword,
          filters?.location || 'Remote',
          filters?.posted_date || '24h',
          filters?.results_wanted || 20,
          webhookUrl,
          filters?.maxPages
        );
        break;

      case 'upwork':
        run = await apifyService.startUpworkScraper(keyword, filters?.maxResults || 50, webhookUrl, {
          jobType: filters?.jobType,
          experienceLevel: filters?.experienceLevel,
          budgetMin: filters?.budgetMin,
          budgetMax: filters?.budgetMax,
          hourlyMin: filters?.hourlyMin,
          hourlyMax: filters?.hourlyMax,
          sort: filters?.sort,
        });
        break;

      case 'freelancer':
        run = await apifyService.startFreelancerScraper(keyword, filters?.limit || 100, webhookUrl, {
          skills: filters?.skills,
          sort: filters?.sort,
          fixed_budget_min: filters?.fixed_budget_min,
          fixed_budget_max: filters?.fixed_budget_max,
          hourly_rate_min: filters?.hourly_rate_min,
          hourly_rate_max: filters?.hourly_rate_max,
        });
        break;

      case 'linkedin':
        if (!filters?.searchUrl) {
          return NextResponse.json({ error: 'LinkedIn search URL is required' }, { status: 400 });
        }
        run = await apifyService.startLinkedInJobsScraper(
          filters.searchUrl,
          filters?.count || 100,
          webhookUrl,
          {
            scrapeCompany: filters?.scrapeCompany,
            splitByLocation: filters?.splitByLocation,
          }
        );
        break;

      default:
        return NextResponse.json({ error: `Unknown source: ${source}` }, { status: 400 });
    }

    await CampaignJobService.updateCampaign(campaignId, {
      status: 'SCRAPING',
      apifyRunId: run.id,
    });

    return NextResponse.json({ success: true, campaignId, apifyRunId: run.id });
  } catch (error: any) {
    console.error('Create Campaign Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

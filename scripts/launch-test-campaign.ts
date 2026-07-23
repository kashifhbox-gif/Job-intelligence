import dotenv from 'dotenv';
dotenv.config();

import connectToDatabase from '../app/lib/db';
import Campaign from '../app/models/Campaign';
import { ApifyJobsService } from '../app/services/ApifyJobsService';

async function launchLiveCampaign() {
  console.log('🚀 Launching live test campaign via Apify API...');

  await connectToDatabase();

  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) {
    console.error('❌ APIFY_API_TOKEN is missing in .env');
    process.exit(1);
  }

  // Create campaign record
  const campaign = await Campaign.create({
    name: 'Live Validation — React & Next.js Developers',
    source: 'upwork',
    keyword: 'Next.js React',
    status: 'PENDING',
    filters: {
      maxResults: 10,
      jobType: 'HOURLY',
      sort: 'recency',
    },
  });

  const campaignId = campaign._id.toString();
  console.log(`✅ Campaign created in MongoDB! ID: ${campaignId}`);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const webhookUrl = `${appUrl}/api/webhooks/apify-jobs?campaignId=${campaignId}`;

  const apifyService = new ApifyJobsService(apifyToken);

  try {
    console.log(`📡 Dispatching Upwork scraper actor with webhook URL: ${webhookUrl}`);
    const run = await apifyService.startUpworkScraper('Next.js React', 10, webhookUrl, {
      jobType: 'HOURLY',
      sort: 'recency',
    });

    console.log(`✅ Apify Actor Run Started! Run ID: ${run.id}`);
    console.log(`   Status: ${run.status}`);

    await Campaign.findByIdAndUpdate(campaignId, {
      status: 'SCRAPING',
      apifyRunId: run.id,
    });

    console.log(`\n🎉 Campaign is now active and SCRAPING!`);
    console.log(`   View status at: http://localhost:3000/campaigns/${campaignId}`);
  } catch (error: any) {
    console.error('❌ Failed to launch Apify actor:', error.message);
    await Campaign.findByIdAndUpdate(campaignId, { status: 'FAILED' });
  } finally {
    process.exit(0);
  }
}

launchLiveCampaign();

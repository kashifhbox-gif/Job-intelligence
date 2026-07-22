import dotenv from 'dotenv';
dotenv.config();

import connectToDatabase from '../app/lib/db';
import Campaign from '../app/models/Campaign';
import { ApifyJobsService } from '../app/services/ApifyJobsService';
import { JobListingService } from '../app/services/JobListingService';
import { inngest } from '../app/lib/inngest';

async function pollCampaignResults() {
  await connectToDatabase();

  const campaignId = process.argv[2];
  if (!campaignId) {
    console.error('Usage: npx tsx scripts/poll-campaign-results.ts <campaignId>');
    process.exit(1);
  }

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    console.error(`❌ Campaign ${campaignId} not found`);
    process.exit(1);
  }

  console.log(`🔍 Polling live campaign: "${campaign.name}" (${campaign.source})`);
  console.log(`   Apify Run ID: ${campaign.apifyRunId}`);

  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) {
    console.error('❌ APIFY_API_TOKEN is missing');
    process.exit(1);
  }

  const apifyService = new ApifyJobsService(apifyToken);

  console.log('⏳ Waiting for Apify scraper run to finish...');
  let finished = false;
  let attempts = 0;

  while (!finished && attempts < 30) {
    attempts++;
    await new Promise(r => setTimeout(r, 4000));
    try {
      const items = await apifyService.getDatasetItems(campaign.apifyRunId!);
      console.log(`   Attempt ${attempts}: Retrieved ${items.items.length} dataset items from Apify.`);

      if (items.items.length > 0) {
        finished = true;
        console.log(`\n📥 Saving ${items.items.length} scraped jobs to database...`);
        const saved = await JobListingService.saveScrapedJobs(campaignId, items.items, campaign.source);
        console.log(`✅ Saved ${saved} listings to MongoDB!`);

        await Campaign.findByIdAndUpdate(campaignId, {
          status: 'SCRAPED',
          totalJobs: saved,
        });

        console.log('🚀 Triggering Inngest evaluation job...');
        await inngest.send({
          name: 'app/evaluate.jobs',
          data: { campaignId },
        });

        console.log('✅ Webhook/poll pipeline complete!');
      }
    } catch (e: any) {
      console.log(`   Attempt ${attempts}: Scraping in progress... (${e.message})`);
    }
  }

  process.exit(0);
}

pollCampaignResults();

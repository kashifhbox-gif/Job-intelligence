import dotenv from 'dotenv';
dotenv.config();

import connectToDatabase from '../app/lib/db';
import Campaign, { JobSource } from '../app/models/Campaign';
import JobListing from '../app/models/JobListing';
import { ApifyJobsService } from '../app/services/ApifyJobsService';
import { JobListingService } from '../app/services/JobListingService';
import { CampaignJobService } from '../app/services/CampaignJobService';
import { ApifyClient } from 'apify-client';

async function testLiveApifyActorsAndDatabase() {
  console.log('🚀 Testing Live Apify Actors & Storing Scraped Campaigns in Database...\n');

  await connectToDatabase();

  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    console.error('❌ APIFY_API_TOKEN is missing in .env file!');
    process.exit(1);
  }

  const apifyService = new ApifyJobsService(token);
  const client = new ApifyClient({ token });

  const webhookBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sacrifice-palm-compost.ngrok-free.dev';
  console.log(`🌐 Public Webhook Domain: ${webhookBaseUrl}\n`);

  const tests: {
    source: JobSource;
    name: string;
    keyword: string;
    startRun: (webhookUrl: string) => Promise<any>;
  }[] = [
    {
      source: 'dice',
      name: 'Test Live Dice Campaign',
      keyword: 'React Developer',
      startRun: (webhookUrl) =>
        apifyService.startDiceScraper('React Developer', 'Remote', '24h', 5, webhookUrl),
    },
    {
      source: 'upwork',
      name: 'Test Live Upwork Campaign',
      keyword: 'Next.js Developer',
      startRun: (webhookUrl) =>
        apifyService.startUpworkScraper('Next.js Developer', 5, webhookUrl),
    },
    {
      source: 'freelancer',
      name: 'Test Live Freelancer Campaign',
      keyword: 'React Node',
      startRun: (webhookUrl) =>
        apifyService.startFreelancerScraper('React Node', 5, webhookUrl),
    },
    {
      source: 'linkedin',
      name: 'Test Live LinkedIn Campaign',
      keyword: 'Software Engineer (United States)',
      startRun: (webhookUrl) =>
        apifyService.startLinkedInJobsScraper(
          'https://www.linkedin.com/jobs/search?keywords=Software+Engineer&location=United+States&geoId=103644278&f_TPR=r86400&f_WT=2&position=1&pageNum=0',
          10,
          webhookUrl
        ),
    },
  ];

  const results: any[] = [];

  for (const test of tests) {
    console.log(`==================================================`);
    console.log(`📦 Testing Platform: [${test.source.toUpperCase()}]`);
    console.log(`   Campaign Name: "${test.name}"`);

    // 1. Create Campaign Record in DB
    const campaign = await CampaignJobService.createCampaign({
      name: test.name,
      source: test.source,
      keyword: test.keyword,
      filters: { isLiveTest: true },
    });
    const campaignId = campaign._id.toString();
    console.log(`   Saved Campaign in DB with ID: ${campaignId}`);

    const webhookUrl = `${webhookBaseUrl}/api/webhooks/apify-jobs?campaignId=${campaignId}`;

    // 2. Start Apify Actor
    try {
      console.log(`   Starting Apify Actor run...`);
      const run = await test.startRun(webhookUrl);
      console.log(`   Actor Run Started! Run ID: ${run.id} | Status: ${run.status}`);

      // Update Campaign with run ID
      await CampaignJobService.updateCampaign(campaignId, {
        status: 'SCRAPING',
        apifyRunId: run.id,
      });

      // 3. Poll Apify for Run Completion
      console.log(`   Waiting for Apify run ${run.id} to finish...`);
      let runStatus = run.status;
      let attempts = 0;
      while (!['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(runStatus) && attempts < 40) {
        await new Promise((r) => setTimeout(r, 5000));
        const currentRun = await client.run(run.id).get();
        runStatus = currentRun?.status || 'UNKNOWN';
        attempts++;
        process.stdout.write(`.`);
      }
      console.log(`\n   Run finished with status: ${runStatus}`);

      if (runStatus === 'SUCCEEDED') {
        // 4. Fetch Dataset Items from Apify
        console.log(`   Fetching scraped dataset items from Apify...`);
        const datasetItems = await apifyService.getDatasetItems(run.id);
        const items = datasetItems.items || [];
        console.log(`   Retrieved ${items.length} raw dataset item(s) from Apify.`);

        // 5. Save items into Database using JobListingService
        const savedCount = await JobListingService.saveScrapedJobs(campaignId, items, test.source);
        console.log(`   Successfully mapped and saved ${savedCount} job listing(s) into MongoDB!`);

        // 6. Update Campaign Status
        await CampaignJobService.updateCampaign(campaignId, {
          status: 'SCRAPED',
          totalJobs: savedCount,
        });

        // 7. Verify jobs in Database
        const dbJobs = await JobListing.find({ campaignId }).lean();
        results.push({
          source: test.source,
          campaignId,
          runId: run.id,
          scrapedItems: items.length,
          dbSavedJobs: dbJobs.length,
          sampleTitle: dbJobs[0]?.title || 'N/A',
          sampleCompany: dbJobs[0]?.company || 'N/A',
        });
      } else {
        console.error(`   ❌ Run failed or timed out with status: ${runStatus}`);
        await CampaignJobService.updateCampaign(campaignId, { status: 'FAILED' });
        results.push({
          source: test.source,
          campaignId,
          runId: run.id,
          error: `Run finished with status ${runStatus}`,
        });
      }
    } catch (err: any) {
      console.error(`   ❌ Error during ${test.source} test:`, err.message);
      results.push({
        source: test.source,
        campaignId,
        error: err.message,
      });
    }
  }

  console.log('\n==================================================');
  console.log('📊 FINAL TEST RESULTS SUMMARY:');
  console.table(results);
  console.log('==================================================\n');

  process.exit(0);
}

testLiveApifyActorsAndDatabase();

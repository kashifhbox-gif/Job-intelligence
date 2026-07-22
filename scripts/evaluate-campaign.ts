import dotenv from 'dotenv';
dotenv.config();

import connectToDatabase from '../app/lib/db';
import JobListing from '../app/models/JobListing';
import Campaign from '../app/models/Campaign';
import { processJobEvaluation } from '../app/inngest/evaluationHelpers';

async function evaluateLiveCampaignJobs() {
  await connectToDatabase();

  const campaignId = process.argv[2] || '6a6102b45b607c13c0e50f0e';
  console.log(`🤖 Starting AI Evaluation for live campaign ID: ${campaignId}`);

  const jobs = await JobListing.find({ campaignId, score: { $exists: false } }).lean();
  console.log(`📋 Found ${jobs.length} unevaluated live job listings.`);

  let qualified = 0;
  const logger = {
    info: (...args: any[]) => console.log('  [INFO]', ...args),
    error: (...args: any[]) => console.error('  [ERROR]', ...args),
  };

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(`\n--------------------------------------------------`);
    console.log(`[${i + 1}/${jobs.length}] Evaluating: "${job.title}"`);
    const isQual = await processJobEvaluation(job, logger);
    if (isQual) qualified++;
    await new Promise(r => setTimeout(r, 1500));
  }

  await Campaign.findByIdAndUpdate(campaignId, {
    status: 'COMPLETED',
    qualifiedJobs: qualified,
  });

  console.log(`\n==================================================`);
  console.log(`🎉 LIVE CAMPAIGN EVALUATION COMPLETED!`);
  console.log(`   - Total Scraped Jobs: ${jobs.length}`);
  console.log(`   - Qualified Jobs (Score >= 7): ${qualified}`);
  console.log(`   - View live dashboard at: http://localhost:3001/campaigns/${campaignId}`);
  console.log(`==================================================`);

  process.exit(0);
}

evaluateLiveCampaignJobs();

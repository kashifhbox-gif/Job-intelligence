import dotenv from 'dotenv';
dotenv.config();

import connectToDatabase from '../app/lib/db';
import Campaign from '../app/models/Campaign';
import JobListing from '../app/models/JobListing';
import { JobListingService } from '../app/services/JobListingService';
import { CampaignJobService } from '../app/services/CampaignJobService';

async function testScraperMappersAndDatabase() {
  console.log('🧪 Testing Job Listing Normalization Mappers & Persistence...');

  await connectToDatabase();

  // Create temporary test campaign
  const campaign = await Campaign.create({
    name: 'Test Multi-Platform Verification Campaign',
    source: 'upwork',
    keyword: 'react node test',
    status: 'SCRAPING',
    filters: { test: true },
  });

  const campaignId = campaign._id.toString();
  console.log(`✅ Created test campaign ID: ${campaignId}`);

  // Sample raw output from Dice actor
  const diceSampleItems = [
    {
      id: 'DICE_1001',
      title: 'Senior Frontend Developer - React / Next.js',
      company: 'Cloud Scale Inc',
      location: 'New York, NY (Remote)',
      description_text: 'Building high throughput web portals with Next.js and TypeScript.',
      detailsPageUrl: 'https://www.dice.com/job/detail/DICE_1001',
      posted: '2026-07-22',
      employmentType: 'Full-time',
      salary: '$150,000 - $170,000',
      workSetting: 'Remote',
    },
  ];

  // Sample raw output from Upwork actor
  const upworkSampleItems = [
    {
      jobId: 'UPWORK_2001',
      title: 'Expert Full-Stack Architect Needed for Web App',
      clientCountry: 'United States',
      clientTotalSpent: 45000,
      clientPaymentVerified: true,
      clientRating: 4.9,
      totalApplicants: 12,
      description: 'Looking for expert freelancer to design frontend and backend.',
      portalUrl: 'https://www.upwork.com/jobs/~01abc123def',
      publishTime: '2026-07-22T10:00:00Z',
      jobType: 'HOURLY',
      hourlyBudgetMin: 50,
      hourlyBudgetMax: 100,
      skills: [{ name: 'Next.js' }, { name: 'MongoDB' }, { name: 'Inngest' }],
    },
  ];

  // Sample raw output from Freelancer actor
  const freelancerSampleItems = [
    {
      id: 'FREELANCER_3001',
      title: 'Develop Real-time Web Scraper Interface',
      description: 'Need a developer to parse JSON dataset from webhooks.',
      url: 'https://www.freelancer.com/projects/3001',
      minBudget: '$250',
      maxBudget: '$750',
      bidCount: 8,
      skills: [{ name: 'Node.js' }, { name: 'Web Scraping' }],
    },
  ];

  // Sample raw output from LinkedIn Jobs actor
  const linkedInSampleItems = [
    {
      id: 'LINKEDIN_4001',
      title: 'AI Solutions Engineer',
      companyName: 'Meta Enterprise',
      location: 'San Francisco, CA',
      descriptionText: 'Lead development of multi-agent LLM systems.',
      link: 'https://www.linkedin.com/jobs/view/4001',
      postedAt: '2026-07-22',
      employmentType: 'Contract',
      salaryInfo: ['$80.00', '$110.00'],
      seniorityLevel: 'Senior',
      industries: 'Software & Technology',
      jobPosterName: 'Jane Smith',
      jobPosterTitle: 'Engineering Recruiter',
      companyEmployeesCount: 50000,
      applicantsCount: '45',
    },
  ];

  try {
    console.log('\n📥 Saving mock Dice listings...');
    const diceCount = await JobListingService.saveScrapedJobs(campaignId, diceSampleItems, 'dice');
    console.log(`   Saved ${diceCount} Dice listing(s).`);

    console.log('\n📥 Saving mock Upwork listings...');
    const upworkCount = await JobListingService.saveScrapedJobs(campaignId, upworkSampleItems, 'upwork');
    console.log(`   Saved ${upworkCount} Upwork listing(s).`);

    console.log('\n📥 Saving mock Freelancer listings...');
    const freelancerCount = await JobListingService.saveScrapedJobs(campaignId, freelancerSampleItems, 'freelancer');
    console.log(`   Saved ${freelancerCount} Freelancer listing(s).`);

    console.log('\n📥 Saving mock LinkedIn listings...');
    const linkedInCount = await JobListingService.saveScrapedJobs(campaignId, linkedInSampleItems, 'linkedin');
    console.log(`   Saved ${linkedInCount} LinkedIn listing(s).`);

    // Verify stored records
    const storedJobs = await JobListing.find({ campaignId }).lean();
    console.log(`\n📋 Verified ${storedJobs.length} listings saved to database:`);
    storedJobs.forEach((j) => {
      console.log(`   - [${j.source.toUpperCase()}] ${j.title} | ExtID: ${j.externalId} | Salary: ${j.salary || 'N/A'}`);
    });

    // Test Campaign details retrieval
    const campaignDetails = await CampaignJobService.getCampaignDetails(campaignId);
    console.log(`\n📊 Campaign Stats Aggregation Test:`);
    console.log(`   - Total Jobs: ${campaignDetails.stats.globalTotalJobs}`);
    console.log(`   - Evaluated: ${campaignDetails.stats.evaluatedJobs}`);
    console.log(`   - Qualified: ${campaignDetails.stats.qualifiedJobs}`);

    // Cleanup test data
    console.log('\n🧹 Cleaning up test campaign & listings...');
    await CampaignJobService.deleteCampaign(campaignId);
    console.log('✅ Cleanup complete!');

    console.log('\n✅ Scraper mapper & persistence test passed successfully.');
  } catch (error: any) {
    console.error('❌ Scraper verification test failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testScraperMappersAndDatabase();

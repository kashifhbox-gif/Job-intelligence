import connectToDatabase from '@/app/lib/db';
import JobListing from '@/app/models/JobListing';
import type { JobSource } from '@/app/models/Campaign';

export class JobListingService {
  static async getUnevaluatedJobs(campaignId: string) {
    await connectToDatabase();
    return await JobListing.find({
      campaignId,
      score: { $exists: false },
    }).lean();
  }

  static async getJobsBycampaign(campaignId: string) {
    await connectToDatabase();
    return await JobListing.find({ campaignId }).lean();
  }

  static async getJobDetail(jobId: string) {
    await connectToDatabase();
    const job = await JobListing.findById(jobId)
      .populate('campaignId', 'name source keyword status')
      .lean();
    if (!job) throw new Error('Job listing not found');
    return job;
  }

  static async updateJob(jobId: string, updates: any) {
    await connectToDatabase();
    return await JobListing.findByIdAndUpdate(jobId, updates, { returnDocument: 'after' });
  }

  static async deleteJob(jobId: string) {
    await connectToDatabase();
    const job = await JobListing.findByIdAndDelete(jobId);
    if (!job) throw new Error('Job listing not found');
    return { success: true };
  }

  /**
   * Source-aware mapper — transforms raw Apify output into unified JobListing documents
   */
  static async saveScrapedJobs(campaignId: string, items: any[], source: JobSource): Promise<number> {
    await connectToDatabase();

    const mapped = items.map((item: any) => {
      switch (source) {
        case 'dice':
          return mapDiceItem(campaignId, item);
        case 'upwork':
          return mapUpworkItem(campaignId, item);
        case 'freelancer':
          return mapFreelancerItem(campaignId, item);
        case 'linkedin':
          return mapLinkedInItem(campaignId, item);
        default:
          return null;
      }
    }).filter(Boolean);

    if (mapped.length === 0) return 0;

    try {
      await JobListing.insertMany(mapped, { ordered: false });
    } catch (e: any) {
      if (e.code !== 11000) {
        console.error('Error inserting job listings:', e);
      }
    }

    return mapped.length;
  }
}

// ─── Per-Source Mappers ───────────────────────────────────────────────────────

function mapDiceItem(campaignId: string, item: any) {
  return {
    campaignId,
    source: 'dice' as JobSource,
    externalId: item.id || item.jobId || item.dice_id || String(Math.random()),
    title: item.title || '',
    company: item.company || item.companyName || '',
    location: item.location || '',
    description: item.description_text || item.summary || '',
    url: item.url || item.detailsPageUrl || '',
    postedAt: item.posted || item.updated || '',
    employmentType: item.employmentType || '',
    salary: item.salary || '',
    workSetting: item.workSetting || '',
    skills: [],
  };
}

function mapUpworkItem(campaignId: string, item: any) {
  const skills = (item.skills || []).map((s: any) =>
    typeof s === 'string' ? s : s.name || ''
  ).filter(Boolean);

  let salary = '';
  if (item.jobType === 'HOURLY' && (item.hourlyBudgetMin || item.hourlyBudgetMax)) {
    salary = `$${item.hourlyBudgetMin || 0}–$${item.hourlyBudgetMax || '?'}/hr`;
  } else if (item.budgetAmount) {
    salary = `$${item.budgetAmount} fixed`;
  }

  return {
    campaignId,
    source: 'upwork' as JobSource,
    externalId: item.jobId || item.id || String(Math.random()),
    title: item.title || '',
    company: item.clientCountry ? `Client from ${item.clientCountry}` : 'Upwork Client',
    location: item.clientCountry || 'Remote',
    description: item.description || '',
    url: item.url || item.portalUrl || '',
    postedAt: item.publishTime || item.createTime || '',
    employmentType: item.jobType || '',
    salary,
    skills,
    clientCountry: item.clientCountry || '',
    clientTotalSpent: item.clientTotalSpent,
    clientPaymentVerified: item.clientPaymentVerified,
    clientRating: item.clientRating,
    totalApplicants: item.totalApplicants,
    budgetMin: item.hourlyBudgetMin || item.budgetAmount,
    budgetMax: item.hourlyBudgetMax,
    jobType: item.jobType || '',
  };
}

function mapFreelancerItem(campaignId: string, item: any) {
  const skills = (item.skills || []).map((s: any) =>
    typeof s === 'string' ? s : s.name || ''
  ).filter(Boolean);

  const salary = item.budgetRange || item.minBudget
    ? `${item.minBudget || '?'} – ${item.maxBudget || '?'}`
    : '';

  return {
    campaignId,
    source: 'freelancer' as JobSource,
    externalId: String(item.id || Math.random()),
    title: item.title || '',
    company: 'Freelancer Client',
    location: 'Remote',
    description: item.description || '',
    url: item.url || '',
    postedAt: item.timeLeft || '',
    employmentType: 'Fixed / Hourly',
    salary,
    skills,
    budgetMin: parseFloat(String(item.minBudget || '').replace(/[^0-9.]/g, '')) || undefined,
    budgetMax: parseFloat(String(item.maxBudget || '').replace(/[^0-9.]/g, '')) || undefined,
    totalApplicants: item.bidCount,
  };
}

function mapLinkedInItem(campaignId: string, item: any) {
  const salaryInfo = Array.isArray(item.salaryInfo) ? item.salaryInfo.join(' – ') : '';

  return {
    campaignId,
    source: 'linkedin' as JobSource,
    externalId: String(item.id || Math.random()),
    title: item.title || '',
    company: item.companyName || '',
    location: item.location || '',
    description: item.descriptionText || '',
    url: item.link || item.applyUrl || '',
    postedAt: item.postedAt || '',
    employmentType: item.employmentType || '',
    salary: salaryInfo,
    skills: [],
    seniorityLevel: item.seniorityLevel || '',
    industries: item.industries || '',
    jobPosterName: item.jobPosterName || '',
    jobPosterTitle: item.jobPosterTitle || '',
    jobPosterProfileUrl: item.jobPosterProfileUrl || '',
    companyLinkedinUrl: item.companyLinkedinUrl || '',
    companyLogo: item.companyLogo || '',
    companyEmployeesCount: item.companyEmployeesCount,
    totalApplicants: item.applicantsCount ? parseInt(String(item.applicantsCount)) : undefined,
    applyUrl: item.applyUrl || '',
  };
}

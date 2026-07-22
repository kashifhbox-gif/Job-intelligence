import connectToDatabase from '@/app/lib/db';
import Campaign from '@/app/models/Campaign';
import JobListing from '@/app/models/JobListing';

export class CampaignJobService {
  static async getCampaignsPaginated(page: number = 1, limit: number = 20, source?: string) {
    await connectToDatabase();
    const skip = (page - 1) * limit;

    const query: any = {};
    if (source && source !== 'all') query.source = source;

    const [campaigns, totalCount] = await Promise.all([
      Campaign.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Campaign.countDocuments(query),
    ]);

    const withStats = await Promise.all(
      campaigns.map(async (c) => {
        const totalJobs = await JobListing.countDocuments({ campaignId: c._id });
        const qualifiedJobs = await JobListing.countDocuments({ campaignId: c._id, isQualified: true });
        const evaluatedJobs = await JobListing.countDocuments({ campaignId: c._id, score: { $exists: true } });
        return { ...c, stats: { totalJobs, qualifiedJobs, evaluatedJobs } };
      })
    );

    return {
      campaigns: withStats,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async getCampaignDetails(
    campaignId: string,
    page: number = 1,
    limit: number = 20,
    filter: string = 'ALL',
    searchQuery: string = ''
  ) {
    await connectToDatabase();
    const campaign = await Campaign.findById(campaignId).lean();
    if (!campaign) throw new Error('Campaign not found');

    const skip = (page - 1) * limit;

    const query: any = { campaignId };
    if (filter === 'QUALIFIED') query.isQualified = true;
    if (filter === 'REJECTED') query.isQualified = false;
    if (filter === 'PENDING') query.score = { $exists: false };
    if (searchQuery) {
      const q = new RegExp(searchQuery, 'i');
      query.$or = [{ title: q }, { company: q }, { description: q }];
    }

    const [jobs, totalCount] = await Promise.all([
      JobListing.find(query).sort({ score: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      JobListing.countDocuments(query),
    ]);

    const stats = {
      totalJobs: totalCount,
      globalTotalJobs: await JobListing.countDocuments({ campaignId }),
      qualifiedJobs: await JobListing.countDocuments({ campaignId, isQualified: true }),
      evaluatedJobs: await JobListing.countDocuments({ campaignId, score: { $exists: true } }),
    };

    return {
      campaign,
      jobs,
      stats,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async createCampaign(data: {
    name: string;
    source: string;
    keyword: string;
    filters?: any;
  }) {
    await connectToDatabase();
    return await Campaign.create({
      name: data.name,
      source: data.source,
      keyword: data.keyword,
      status: 'PENDING',
      totalJobs: 0,
      qualifiedJobs: 0,
      filters: data.filters || {},
    });
  }

  static async updateCampaign(campaignId: string, updates: any) {
    await connectToDatabase();
    return await Campaign.findByIdAndUpdate(campaignId, updates, { returnDocument: 'after' });
  }

  static async deleteCampaign(campaignId: string) {
    await connectToDatabase();
    const campaign = await Campaign.findByIdAndDelete(campaignId);
    if (!campaign) throw new Error('Campaign not found');
    await JobListing.deleteMany({ campaignId });
    return { success: true };
  }

  static async getDashboardStats() {
    await connectToDatabase();
    const [totalCampaigns, totalJobs, qualifiedJobs, recentCampaigns] = await Promise.all([
      Campaign.countDocuments(),
      JobListing.countDocuments(),
      JobListing.countDocuments({ isQualified: true }),
      Campaign.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return { totalCampaigns, totalJobs, qualifiedJobs, recentCampaigns };
  }
}

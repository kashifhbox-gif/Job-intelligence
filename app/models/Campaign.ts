import mongoose, { Schema, Document } from 'mongoose';

export type JobSource = 'dice' | 'upwork' | 'freelancer' | 'linkedin';

export interface ICampaign extends Document {
  name: string;
  source: JobSource;
  keyword: string;
  apifyRunId?: string;
  status: 'PENDING' | 'SCRAPING' | 'SCRAPED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';
  totalJobs: number;
  qualifiedJobs: number;
  filters: {
    // Dice
    location?: string;
    posted_date?: string;
    results_wanted?: number;
    maxPages?: number;
    // Upwork
    jobType?: string;
    experienceLevel?: string;
    budgetMin?: number;
    budgetMax?: number;
    hourlyMin?: number;
    hourlyMax?: number;
    maxResults?: number;
    sort?: string;
    // Freelancer
    skills?: string[];
    fixed_budget_min?: number;
    fixed_budget_max?: number;
    hourly_rate_min?: number;
    hourly_rate_max?: number;
    limit?: number;
    // LinkedIn Jobs
    searchUrl?: string;
    scrapeCompany?: boolean;
    count?: number;
    splitByLocation?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    source: {
      type: String,
      enum: ['dice', 'upwork', 'freelancer', 'linkedin'],
      required: true,
    },
    keyword: { type: String, required: true },
    apifyRunId: { type: String, required: false },
    status: {
      type: String,
      enum: ['PENDING', 'SCRAPING', 'SCRAPED', 'EVALUATING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    totalJobs: { type: Number, default: 0 },
    qualifiedJobs: { type: Number, default: 0 },
    filters: {
      location: { type: String },
      posted_date: { type: String },
      results_wanted: { type: Number },
      maxPages: { type: Number },
      jobType: { type: String },
      experienceLevel: { type: String },
      budgetMin: { type: Number },
      budgetMax: { type: Number },
      hourlyMin: { type: Number },
      hourlyMax: { type: Number },
      maxResults: { type: Number },
      sort: { type: String },
      skills: [{ type: String }],
      fixed_budget_min: { type: Number },
      fixed_budget_max: { type: Number },
      hourly_rate_min: { type: Number },
      hourly_rate_max: { type: Number },
      limit: { type: Number },
      searchUrl: { type: String },
      scrapeCompany: { type: Boolean },
      count: { type: Number },
      splitByLocation: { type: Boolean },
    },
  },
  { timestamps: true }
);

CampaignSchema.index({ createdAt: -1 });
CampaignSchema.index({ source: 1, status: 1 });

export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);

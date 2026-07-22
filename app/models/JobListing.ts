import mongoose, { Schema, Document } from 'mongoose';
import type { JobSource } from './Campaign';

export interface IJobListing extends Document {
  campaignId: mongoose.Types.ObjectId;
  source: JobSource;

  // Universal fields
  externalId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  postedAt?: string;
  employmentType?: string;

  // Optional — source-dependent
  salary?: string;
  workSetting?: string;
  skills: string[];

  // Upwork client intel
  clientCountry?: string;
  clientTotalSpent?: number;
  clientPaymentVerified?: boolean;
  clientRating?: number;
  totalApplicants?: number;
  budgetMin?: number;
  budgetMax?: number;
  jobType?: string;

  // LinkedIn extras
  seniorityLevel?: string;
  industries?: string;
  jobPosterName?: string;
  jobPosterTitle?: string;
  jobPosterProfileUrl?: string;
  companyLinkedinUrl?: string;
  companyLogo?: string;
  companyEmployeesCount?: number;
  applyUrl?: string;

  // AI evaluation
  score?: number;
  aiReasoning?: string;
  outreachHook?: string;
  isQualified?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const JobListingSchema: Schema = new Schema(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    source: {
      type: String,
      enum: ['dice', 'upwork', 'freelancer', 'linkedin'],
      required: true,
    },

    externalId: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, default: '' },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    url: { type: String, default: '' },
    postedAt: { type: String },
    employmentType: { type: String },

    salary: { type: String },
    workSetting: { type: String },
    skills: [{ type: String }],

    clientCountry: { type: String },
    clientTotalSpent: { type: Number },
    clientPaymentVerified: { type: Boolean },
    clientRating: { type: Number },
    totalApplicants: { type: Number },
    budgetMin: { type: Number },
    budgetMax: { type: Number },
    jobType: { type: String },

    seniorityLevel: { type: String },
    industries: { type: String },
    jobPosterName: { type: String },
    jobPosterTitle: { type: String },
    jobPosterProfileUrl: { type: String },
    companyLinkedinUrl: { type: String },
    companyLogo: { type: String },
    companyEmployeesCount: { type: Number },
    applyUrl: { type: String },

    score: { type: Number },
    aiReasoning: { type: String },
    outreachHook: { type: String },
    isQualified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

JobListingSchema.index({ campaignId: 1 });
JobListingSchema.index({ isQualified: 1, score: -1 });
JobListingSchema.index({ campaignId: 1, externalId: 1 }, { unique: true });

export default mongoose.models.JobListing || mongoose.model<IJobListing>('JobListing', JobListingSchema);

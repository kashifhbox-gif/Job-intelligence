'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase, CheckCircle2, Clock, ExternalLink, Loader2, MapPin, Star, XCircle } from 'lucide-react';

const SCORE_COLOR = (s: number) =>
  s >= 9 ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
  : s >= 7 ? 'text-lime-400 border-lime-500/40 bg-lime-500/10'
  : s >= 5 ? 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10'
  : 'text-red-400 border-red-500/40 bg-red-500/10';

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  dice:       { label: 'Dice',          color: 'text-orange-400', bg: 'bg-orange-500/10 border border-orange-500/20' },
  upwork:     { label: 'Upwork',        color: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20' },
  freelancer: { label: 'Freelancer',    color: 'text-blue-400',   bg: 'bg-blue-500/10 border border-blue-500/20' },
  linkedin:   { label: 'LinkedIn Jobs', color: 'text-sky-400',    bg: 'bg-sky-500/10 border border-sky-500/20' },
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/jobs/${id}`).then(r => r.json()).then(d => { setJob(d.job); setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  if (!job) return <div className="p-8 text-red-400">Job not found</div>;

  const campaign = job.campaignId as any;
  const src = SOURCE_CONFIG[job.source] || SOURCE_CONFIG.dice;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href={campaign ? `/campaigns/${campaign._id}` : '/campaigns'} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Campaign
      </Link>

      {/* Title header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${src.bg} ${src.color}`}>{src.label}</span>
          {job.isQualified
            ? <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Qualified</span>
            : job.score !== undefined
              ? <span className="flex items-center gap-1 text-xs text-red-400"><XCircle className="w-3.5 h-3.5" /> Rejected</span>
              : null
          }
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{job.title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-400">
          {job.company && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.company}</span>}
          {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>}
          {job.salary && <span className="text-emerald-400 font-medium">{job.salary}</span>}
          {job.postedAt && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(job.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {job.employmentType && <span>{job.employmentType}</span>}
        </div>
      </div>

      {/* AI Score + Reasoning */}
      {job.score !== undefined && (
        <div className={`border rounded-2xl p-5 mb-6 ${SCORE_COLOR(job.score)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span className="text-lg font-bold">{job.score}/10</span>
              <span className="text-sm opacity-70">AI Score</span>
            </div>
          </div>
          {job.aiReasoning && <p className="text-sm opacity-80 mb-3">{job.aiReasoning}</p>}
          {job.outreachHook && (
            <div className="bg-black/20 rounded-lg p-3 text-xs opacity-80">
              <p className="font-semibold mb-1">💬 Outreach Hook</p>
              <p className="italic">"{job.outreachHook}"</p>
            </div>
          )}
        </div>
      )}

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Skills Required</h3>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((s: string) => (
              <span key={s} className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Source-specific intel */}
      {job.source === 'upwork' && (
        <div className="mb-5 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 grid grid-cols-2 gap-3">
          <h3 className="text-xs text-neutral-500 uppercase tracking-wider col-span-2 mb-1">Client Intel</h3>
          {job.clientCountry && <div><p className="text-xs text-neutral-500">Country</p><p className="text-sm text-white">{job.clientCountry}</p></div>}
          {job.clientTotalSpent !== undefined && <div><p className="text-xs text-neutral-500">Total Spent</p><p className="text-sm text-emerald-400">${job.clientTotalSpent?.toLocaleString()}</p></div>}
          {job.clientPaymentVerified !== undefined && <div><p className="text-xs text-neutral-500">Payment Verified</p><p className="text-sm text-white">{job.clientPaymentVerified ? '✅ Yes' : '❌ No'}</p></div>}
          {job.clientRating && <div><p className="text-xs text-neutral-500">Rating</p><p className="text-sm text-white">{job.clientRating}/5</p></div>}
          {job.totalApplicants && <div><p className="text-xs text-neutral-500">Applicants</p><p className="text-sm text-white">{job.totalApplicants}</p></div>}
        </div>
      )}

      {job.source === 'linkedin' && (
        <div className="mb-5 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 grid grid-cols-2 gap-3">
          <h3 className="text-xs text-neutral-500 uppercase tracking-wider col-span-2 mb-1">Posting Details</h3>
          {job.seniorityLevel && <div><p className="text-xs text-neutral-500">Seniority</p><p className="text-sm text-white">{job.seniorityLevel}</p></div>}
          {job.industries && <div><p className="text-xs text-neutral-500">Industry</p><p className="text-sm text-white">{job.industries}</p></div>}
          {job.companyEmployeesCount && <div><p className="text-xs text-neutral-500">Company Size</p><p className="text-sm text-white">{job.companyEmployeesCount.toLocaleString()} employees</p></div>}
          {job.totalApplicants && <div><p className="text-xs text-neutral-500">Applicants</p><p className="text-sm text-white">{job.totalApplicants}</p></div>}
          {job.jobPosterName && <div><p className="text-xs text-neutral-500">Posted By</p><p className="text-sm text-white">{job.jobPosterName}</p>{job.jobPosterTitle && <p className="text-xs text-neutral-500">{job.jobPosterTitle}</p>}</div>}
        </div>
      )}

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Job Description</h3>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
          {job.description || 'No description available.'}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> View Original Posting
          </a>
        )}
        {job.applyUrl && job.applyUrl !== job.url && (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white rounded-xl text-sm hover:bg-white/5 transition-colors"
          >
            Apply Now
          </a>
        )}
      </div>
    </div>
  );
}

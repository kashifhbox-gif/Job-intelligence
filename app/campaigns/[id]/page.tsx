'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Download, ExternalLink, Loader2, Search, Star, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  dice:       { label: 'Dice',          color: 'text-orange-400', bg: 'bg-orange-500/10 border border-orange-500/20' },
  upwork:     { label: 'Upwork',        color: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20' },
  freelancer: { label: 'Freelancer',    color: 'text-blue-400',   bg: 'bg-blue-500/10 border border-blue-500/20' },
  linkedin:   { label: 'LinkedIn Jobs', color: 'text-sky-400',    bg: 'bg-sky-500/10 border border-sky-500/20' },
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-neutral-400', SCRAPING: 'text-blue-400', SCRAPED: 'text-yellow-400',
  EVALUATING: 'text-violet-400', COMPLETED: 'text-emerald-400', FAILED: 'text-red-400',
};

const SCORE_COLOR = (s: number) =>
  s >= 9 ? 'text-emerald-400' : s >= 7 ? 'text-lime-400' : s >= 5 ? 'text-yellow-400' : 'text-red-400';

type Filter = 'ALL' | 'QUALIFIED' | 'REJECTED' | 'PENDING';

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteCampaign, setDeleteCampaign] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [filter, debouncedSearch]);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', filter, searchQuery: debouncedSearch });
      const res = await fetch(`/api/campaigns/${id}?${params}`);
      const d = await res.json();
      setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, page, filter, debouncedSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-poll when active
  useEffect(() => {
    if (!data?.campaign?.status) return;
    if (['COMPLETED', 'FAILED'].includes(data.campaign.status)) return;
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
  }, [data?.campaign?.status, fetchData]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  if (!data) return <div className="p-8 text-red-400">Campaign not found</div>;

  const { campaign, jobs, stats, pagination } = data;
  const src = SOURCE_CONFIG[campaign.source] || SOURCE_CONFIG.dice;
  const isProcessing = ['SCRAPING', 'EVALUATING'].includes(campaign.status);
  const evalProgress = stats.globalTotalJobs > 0 ? Math.round((stats.evaluatedJobs / stats.globalTotalJobs) * 100) : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <Link href="/campaigns" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Campaigns
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${src.bg} ${src.color}`}>{src.label}</span>
            <span className={`text-sm font-medium flex items-center gap-1.5 ${STATUS_COLORS[campaign.status]}`}>
              {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {campaign.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">{campaign.name}</h1>
          <p className="text-sm text-neutral-500 mt-0.5 truncate max-w-lg">{campaign.keyword}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/export?campaignId=${id}`}
            className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-xl text-sm text-neutral-300 hover:bg-white/5 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <button
            onClick={() => setDeleteCampaign(true)}
            className="px-3 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Jobs Scraped', value: stats.globalTotalJobs },
          { label: 'Evaluated', value: `${stats.evaluatedJobs} / ${stats.globalTotalJobs}` },
          { label: 'Qualified', value: stats.qualifiedJobs },
          { label: 'AI Progress', value: `${evalProgress}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
            {label === 'AI Progress' && (
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${evalProgress}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filter + search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl p-1">
          {(['ALL', 'QUALIFIED', 'REJECTED', 'PENDING'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or company..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {jobs.length === 0 ? (
          <div className="py-16 text-center">
            {isProcessing
              ? <div className="flex flex-col items-center gap-3"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /><p className="text-neutral-400 text-sm">Collecting jobs... this may take a few minutes</p></div>
              : <p className="text-neutral-500 text-sm">No jobs found for this filter.</p>
            }
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-500 uppercase bg-black/30 border-b border-white/[0.06]">
                  <tr>
                    <th className="px-5 py-3">Job</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Salary</th>
                    <th className="px-5 py-3">Posted</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Score</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {jobs.map((job: any) => (
                    <tr
                      key={job._id}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                      onClick={() => router.push(`/jobs/${job._id}`)}
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-white">{job.title}</p>
                        <p className="text-xs text-neutral-500">{job.company}</p>
                      </td>
                      <td className="px-5 py-3 text-neutral-400 text-xs">{job.location || '—'}</td>
                      <td className="px-5 py-3 text-neutral-300 text-xs">{job.salary || '—'}</td>
                      <td className="px-5 py-3 text-neutral-400 text-xs">
                        {job.postedAt 
                          ? (isNaN(new Date(job.postedAt).getTime()) 
                              ? String(job.postedAt) 
                              : new Date(job.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })) 
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-neutral-400 text-xs">{job.employmentType || '—'}</td>
                      <td className="px-5 py-3">
                        {job.score !== undefined ? (
                          <div className="flex items-center gap-1.5">
                            <Star className={`w-3.5 h-3.5 ${SCORE_COLOR(job.score)}`} />
                            <span className={`font-semibold ${SCORE_COLOR(job.score)}`}>{job.score}/10</span>
                          </div>
                        ) : (
                          <span className="text-neutral-600 text-xs">Pending</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end items-center gap-2">
                          {job.url && (
                            <a href={job.url} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button onClick={() => setDeleteJobId(job._id)} className="text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex justify-end items-center gap-2 px-5 py-3 border-t border-white/[0.06]">
                <span className="text-xs text-neutral-500">Page {pagination.page} / {pagination.totalPages}</span>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-1.5 rounded-lg border border-white/10 text-white disabled:opacity-30 hover:bg-white/5 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages} className="p-1.5 rounded-lg border border-white/10 text-white disabled:opacity-30 hover:bg-white/5 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete campaign modal */}
      <ConfirmModal
        isOpen={deleteCampaign}
        title="Delete Campaign"
        message={`Delete "${campaign.name}" and all ${stats.globalTotalJobs} job listings?`}
        confirmText="Delete"
        onConfirm={async () => {
          await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
          router.push('/campaigns');
        }}
        onCancel={() => setDeleteCampaign(false)}
      />

      {/* Delete job modal */}
      <ConfirmModal
        isOpen={!!deleteJobId}
        title="Delete Job Listing"
        message="Remove this job listing from the campaign?"
        confirmText="Delete"
        onConfirm={async () => {
          if (deleteJobId) {
            await fetch(`/api/jobs/${deleteJobId}`, { method: 'DELETE' });
            setDeleteJobId(null);
            fetchData();
          }
        }}
        onCancel={() => setDeleteJobId(null)}
      />
    </div>
  );
}

'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, Loader2, Plus, TrendingUp, Zap, Trash2, ArrowRight } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

const PLATFORM_CONFIG: Record<string, { name: string; title: string; color: string; bg: string; border: string; dot: string }> = {
  upwork: {
    name: 'Upwork',
    title: 'Upwork Intelligence',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  freelancer: {
    name: 'Freelancer',
    title: 'Freelancer Intelligence',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
  },
  dice: {
    name: 'Dice',
    title: 'Dice Intelligence',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    dot: 'bg-orange-500',
  },
  linkedin: {
    name: 'LinkedIn Jobs',
    title: 'LinkedIn Jobs Intelligence',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    dot: 'bg-sky-500',
  },
};

export default function PlatformDashboardPage({ params }: { params: Promise<{ platform: string }> }) {
  const resolvedParams = use(params);
  const platformKey = resolvedParams.platform.toLowerCase();
  const config = PLATFORM_CONFIG[platformKey] || {
    name: platformKey.toUpperCase(),
    title: `${platformKey.toUpperCase()} Intelligence`,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    dot: 'bg-indigo-500',
  };

  const [data, setData] = useState<{
    totalCampaigns: number;
    totalJobs: number;
    qualifiedJobs: number;
    campaigns: any[];
    recentQualifiedJobs: any[];
  }>({
    totalCampaigns: 0,
    totalJobs: 0,
    qualifiedJobs: 0,
    campaigns: [],
    recentQualifiedJobs: [],
  });

  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPlatformData = async () => {
    try {
      const res = await fetch(`/api/platforms/${platformKey}`);
      const json = await res.json();
      setData({
        totalCampaigns: json.totalCampaigns || 0,
        totalJobs: json.totalJobs || 0,
        qualifiedJobs: json.qualifiedJobs || 0,
        campaigns: json.campaigns || [],
        recentQualifiedJobs: json.recentQualifiedJobs || [],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPlatformData();
    const timer = setInterval(fetchPlatformData, 6000);
    return () => clearInterval(timer);
  }, [platformKey]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/campaigns/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchPlatformData();
    } catch (e) {
      console.error(e);
    }
  };

  const qualifiedRate = data.totalJobs > 0 ? Math.round((data.qualifiedJobs / data.totalJobs) * 100) : 0;

  const statusColor = (s: string) => {
    if (s === 'COMPLETED') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (s === 'FAILED') return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (s === 'EVALUATING') return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
    if (s === 'SCRAPING') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center`}>
            <span className={`w-3.5 h-3.5 rounded-full ${config.dot}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-white">{config.title}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.color} border ${config.border}`}>
                {config.name}
              </span>
            </div>
            <p className="text-neutral-400 text-sm mt-0.5">Dedicated workspace & job scraper for {config.name}</p>
          </div>
        </div>

        <Link
          href={`/campaigns/new?source=${platformKey}`}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-white/5"
        >
          <Plus className="w-4 h-4" />
          New {config.name} Campaign
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: `${config.name} Campaigns`, value: data.totalCampaigns, icon: Briefcase, color: 'text-indigo-400' },
              { label: 'Scraped Job Listings', value: data.totalJobs, icon: Zap, color: 'text-violet-400' },
              { label: 'Qualification Rate', value: `${qualifiedRate}%`, icon: TrendingUp, color: config.color },
            ].map(({ label, value, icon: Icon, color }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f0f0f] border border-white/15 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-black/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-neutral-400">{label}</p>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-3xl font-extrabold text-white">{value}</p>
              </motion.div>
            ))}
          </div>

          {/* Platform Campaigns List */}
          <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">{config.name} Campaigns</h2>
                <p className="text-xs text-neutral-500">Active and past scraping runs for {config.name}</p>
              </div>
              <span className="text-xs text-neutral-500">{data.campaigns.length} Total</span>
            </div>

            {data.campaigns.length === 0 ? (
              <div className="text-center py-14 border border-dashed border-white/[0.06] rounded-xl">
                <Briefcase className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-400 font-medium text-sm">No {config.name} campaigns created yet</p>
                <Link
                  href={`/campaigns/new?source=${platformKey}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Create {config.name} campaign <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {data.campaigns.map((c) => {
                  const rate = c.stats.totalJobs > 0 ? Math.round((c.stats.qualifiedJobs / c.stats.totalJobs) * 100) : 0;
                  return (
                    <div key={c._id} className="py-4 flex items-center justify-between hover:bg-white/[0.01] px-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${config.dot}`} />
                        <div>
                          <Link href={`/campaigns/${c._id}`} className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors">
                            {c.name}
                          </Link>
                          <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                            <span>Keyword: <strong className="text-neutral-300">{c.keyword}</strong></span>
                            <span>•</span>
                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-neutral-400 font-medium">{c.stats.totalJobs} Jobs Scraped</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">{c.stats.qualifiedJobs} Qualified ({rate}%)</p>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${statusColor(c.status)}`}>
                          {c.status}
                        </span>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/campaigns/${c._id}`}
                            className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => setDeleteId(c._id)}
                            className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Top Qualified Leads */}
          {data.recentQualifiedJobs.length > 0 && (
            <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">Top Qualified Leads from {config.name}</h2>
                  <p className="text-xs text-neutral-500">High scoring job matches found recently</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {data.recentQualifiedJobs.map((job) => (
                  <div key={job._id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-white line-clamp-1">{job.title}</h3>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                        Score: {job.score}/10
                      </span>
                    </div>
                    {job.company && <p className="text-xs text-neutral-400 mb-2">{job.company}</p>}
                    <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{job.evaluationReason || job.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500">{job.location || 'Remote'}</span>
                      <Link href={`/campaigns/${job.campaignId}`} className="text-indigo-400 hover:text-indigo-300 font-medium">
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {deleteId && (
        <ConfirmModal
          isOpen={Boolean(deleteId)}
          title="Delete Campaign"
          message="Are you sure you want to delete this campaign and all its scraped job listings?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

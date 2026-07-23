'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, Loader2, Plus, TrendingUp, Zap, ArrowRight, Activity, Layers } from 'lucide-react';

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  dice:       { label: 'Dice',          color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', dot: 'bg-orange-500' },
  upwork:     { label: 'Upwork',        color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
  freelancer: { label: 'Freelancer',    color: 'text-blue-400',   bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  linkedin:   { label: 'LinkedIn Jobs', color: 'text-sky-400',    bg: 'bg-sky-500/10', border: 'border-sky-500/20', dot: 'bg-sky-500' },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    totalCampaigns: number;
    totalJobs: number;
    qualifiedJobs: number;
    recentCampaigns: any[];
    platformStats: Record<string, { campaigns: number; jobs: number }>;
    lastCampaign: any;
  }>({
    totalCampaigns: 0,
    totalJobs: 0,
    qualifiedJobs: 0,
    recentCampaigns: [],
    platformStats: {},
    lastCampaign: null,
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 6000);
    return () => clearInterval(interval);
  }, []);

  const qualifiedRate = stats.totalJobs > 0
    ? Math.round((stats.qualifiedJobs / stats.totalJobs) * 100)
    : 0;

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
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-neutral-400 text-sm">AI-powered client acquisition & IT staff augmentation pipeline for HBOX Digital</p>
        </div>
        <Link
          href="/campaigns/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-white/5"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
        </div>
      ) : (
        <>
          {/* Top Stats Cards */}
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: 'Total Campaigns', value: stats.totalCampaigns, icon: Briefcase, color: 'text-indigo-400' },
              { label: 'Jobs Scraped', value: stats.totalJobs, icon: Zap, color: 'text-violet-400' },
              { label: 'Qualified Rate', value: `${qualifiedRate}%`, icon: TrendingUp, color: 'text-emerald-400' },
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

          {/* Featured Card: Latest Campaign Progress */}
          {stats.lastCampaign && (() => {
            const evaluated = stats.lastCampaign.stats?.evaluatedJobs || 0;
            const total = stats.lastCampaign.stats?.totalJobs || 0;
            const evalPercent = total > 0 ? Math.min(100, Math.round((evaluated / total) * 100)) : 0;

            return (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-950/40 via-[#0f0f0f] to-[#0f0f0f] border border-indigo-500/40 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-indigo-950/20 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Latest Campaign Activity</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${statusColor(stats.lastCampaign.status)}`}>
                    {stats.lastCampaign.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{stats.lastCampaign.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <span>Keyword: <strong className="text-white">{stats.lastCampaign.keyword}</strong></span>
                      <span>•</span>
                      <span className="capitalize">{stats.lastCampaign.source} Platform</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{total} Jobs Scraped</p>
                      <p className="text-xs text-emerald-400 font-medium mt-0.5">{stats.lastCampaign.stats?.qualifiedJobs || 0} Qualified Leads</p>
                    </div>
                    <Link
                      href={`/campaigns/${stats.lastCampaign._id}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shadow-indigo-600/30"
                    >
                      <span>View Campaign</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Progress Bar Section */}
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-medium">AI Evaluation Progress</span>
                    <span className="text-neutral-300 font-semibold">
                      {evaluated} / {total} Jobs ({evalPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${evalPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Platforms Workspaces Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-400" />
                <h2 className="text-lg font-semibold text-white">Platform Workspaces</h2>
              </div>
              <span className="text-xs text-neutral-500">4 Active Integrations</span>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => {
                const pStat = stats.platformStats[key] || { campaigns: 0, jobs: 0 };
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0f0f0f] border border-white/15 hover:border-white/30 rounded-2xl p-5 transition-all group shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                        <h3 className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</h3>
                      </div>
                    </div>

                    <div className="space-y-1 mb-4">
                      <p className="text-2xl font-bold text-white">{pStat.jobs} <span className="text-xs font-normal text-neutral-500">Jobs</span></p>
                      <p className="text-xs text-neutral-400">{pStat.campaigns} Campaigns</p>
                    </div>

                    <Link
                      href={`/platforms/${key}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 group-hover:text-white transition-colors"
                    >
                      Open Workspace <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Recent Campaigns Table */}
          <div className="bg-[#0f0f0f] border border-white/15 rounded-2xl overflow-hidden shadow-lg shadow-black/50">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <div>
                <h2 className="text-lg font-semibold text-white">Recent Campaigns</h2>
                <p className="text-xs text-neutral-500">Latest scraping runs across all platforms</p>
              </div>
              <Link
                href="/campaigns"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View All Campaigns →
              </Link>
            </div>

            {stats.recentCampaigns.length === 0 ? (
              <div className="py-12 text-center text-neutral-500">
                <p className="text-sm">No campaigns created yet.</p>
                <Link href="/campaigns/new" className="mt-2 text-indigo-400 text-xs hover:underline inline-block">
                  Create your first campaign →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {stats.recentCampaigns.map((c: any) => {
                  const cfg = SOURCE_CONFIG[c.source] || SOURCE_CONFIG.dice;
                  return (
                    <Link
                      key={c._id}
                      href={`/campaigns/${c._id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                        <span className="text-sm text-white font-medium">{c.name}</span>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-xs text-neutral-400">{c.totalJobs || 0} jobs</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${statusColor(c.status)}`}>
                          {c.status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

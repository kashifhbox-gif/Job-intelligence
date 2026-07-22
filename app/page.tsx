'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, Loader2, Plus, TrendingUp, Zap } from 'lucide-react';

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  dice:       { label: 'Dice',         color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  upwork:     { label: 'Upwork',       color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  freelancer: { label: 'Freelancer',   color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  linkedin:   { label: 'LinkedIn Jobs', color: 'text-sky-400',   bg: 'bg-sky-500/10 border-sky-500/20' },
};

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalCampaigns: 0, totalJobs: 0, qualifiedJobs: 0, recentCampaigns: [] as any[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const qualifiedRate = stats.totalJobs > 0
    ? Math.round((stats.qualifiedJobs / stats.totalJobs) * 100)
    : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-neutral-500 text-sm">AI-powered job intelligence across 4 platforms</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Campaigns', value: stats.totalCampaigns, icon: Briefcase, color: 'text-indigo-400' },
              { label: 'Jobs Scraped', value: stats.totalJobs, icon: Zap, color: 'text-violet-400' },
              { label: 'Qualified Rate', value: `${qualifiedRate}%`, icon: TrendingUp, color: 'text-emerald-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-neutral-400">{label}</p>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-3xl font-bold text-white">{value}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent campaigns */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="font-semibold text-white">Recent Campaigns</h2>
              <Link
                href="/campaigns/new"
                className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Campaign
              </Link>
            </div>
            {stats.recentCampaigns.length === 0 ? (
              <div className="py-12 text-center text-neutral-500">
                <p>No campaigns yet.</p>
                <Link href="/campaigns/new" className="mt-2 text-indigo-400 text-sm hover:underline block">Create your first campaign →</Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {stats.recentCampaigns.map((c: any) => {
                  const src = SOURCE_CONFIG[c.source] || SOURCE_CONFIG.dice;
                  const statusColor = c.status === 'COMPLETED' ? 'text-emerald-400' : c.status === 'FAILED' ? 'text-red-400' : 'text-yellow-400';
                  return (
                    <Link key={c._id} href={`/campaigns/${c._id}`} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${src.bg} ${src.color}`}>{src.label}</span>
                        <span className="text-sm text-white font-medium">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <span>{c.totalJobs || 0} jobs</span>
                        <span className={`font-medium ${statusColor}`}>{c.status}</span>
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

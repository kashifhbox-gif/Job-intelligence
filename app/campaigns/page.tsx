'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  dice:       { label: 'Dice',          color: 'text-orange-400', bg: 'bg-orange-500/10 border border-orange-500/20', dot: 'bg-orange-500' },
  upwork:     { label: 'Upwork',        color: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20', dot: 'bg-emerald-500' },
  freelancer: { label: 'Freelancer',    color: 'text-blue-400',   bg: 'bg-blue-500/10 border border-blue-500/20',     dot: 'bg-blue-500' },
  linkedin:   { label: 'LinkedIn Jobs', color: 'text-sky-400',    bg: 'bg-sky-500/10 border border-sky-500/20',       dot: 'bg-sky-500' },
};

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`/api/campaigns?page=${page}&limit=20&source=${source}`);
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [source]);
  useEffect(() => { fetchCampaigns(); const t = setInterval(fetchCampaigns, 6000); return () => clearInterval(t); }, [page, source]);

  const statusColor = (s: string) => {
    if (s === 'COMPLETED') return 'text-emerald-400';
    if (s === 'FAILED') return 'text-red-400';
    if (s === 'EVALUATING') return 'text-violet-400';
    if (s === 'SCRAPING') return 'text-blue-400';
    return 'text-neutral-400';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-sm text-neutral-500 mt-1">All job scraping campaigns across all sources</p>
        </div>
        <Link
          href="/campaigns/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* Source filter */}
      <div className="flex items-center gap-2 mb-6">
        {['all', 'dice', 'upwork', 'freelancer', 'linkedin'].map(s => (
          <button
            key={s}
            onClick={() => setSource(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              source === s
                ? 'bg-white/10 border-white/20 text-white'
                : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {s === 'all' ? 'All Sources' : s === 'linkedin' ? 'LinkedIn Jobs' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <Briefcase className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400 font-medium">No campaigns yet</p>
          <Link href="/campaigns/new" className="mt-3 text-indigo-400 text-sm hover:underline block">Create your first campaign →</Link>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase bg-black/30 border-b border-white/[0.06]">
                <tr>
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Jobs</th>
                  <th className="px-5 py-3 font-medium">Qualified</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {campaigns.map((c) => {
                  const src = SOURCE_CONFIG[c.source] || SOURCE_CONFIG.dice;
                  const isProcessing = ['SCRAPING', 'EVALUATING'].includes(c.status);
                  return (
                    <tr
                      key={c._id}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                      onClick={() => router.push(`/campaigns/${c._id}`)}
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{c.name}</p>
                        <p className="text-xs text-neutral-500 truncate max-w-[180px]">{c.keyword}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${src.bg} ${src.color}`}>{src.label}</span>
                      </td>
                      <td className="px-5 py-4 text-neutral-300">{c.stats?.totalJobs || c.totalJobs || 0}</td>
                      <td className="px-5 py-4">
                        <span className="text-emerald-400 font-medium">{c.stats?.qualifiedJobs || c.qualifiedJobs || 0}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 font-medium ${statusColor(c.status)}`}>
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-neutral-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDeleteId(c._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-white/[0.06]">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-xs rounded border border-white/10 text-white disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-xs rounded border border-white/10 text-white disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Campaign"
        message="This will permanently delete the campaign and all its job listings."
        confirmText="Delete"
        onConfirm={async () => {
          if (deleteId) {
            await fetch(`/api/campaigns/${deleteId}`, { method: 'DELETE' });
            setDeleteId(null);
            fetchCampaigns();
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

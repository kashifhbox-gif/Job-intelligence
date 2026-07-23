'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Cpu, CreditCard, Database, Loader2, RefreshCw, Zap } from 'lucide-react';

interface UsageData {
  apify: {
    username: string;
    email: string;
    planName: string;
    monthlyLimitUsd: number;
    usedUsd: number;
    remainingUsd: number;
    usagePercent: number;
  } | null;
  gemini: {
    configured: boolean;
    model: string;
  };
  apifyError?: string;
}

export default function ApiUsageCard() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/settings/usage');
      const json = await res.json();
      setData(json);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsage();
  };

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
        <span className="text-xs text-neutral-400 ml-2">Loading live API usage stats...</span>
      </div>
    );
  }

  const apify = data?.apify;
  const gemini = data?.gemini;

  return (
    <div className="bg-[#0f0f0f] border border-white/15 rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Live API Quota & Usage Monitor</h3>
            <p className="text-[11px] text-neutral-500">Real-time credit balance and API consumption</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs text-neutral-300 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Apify Live Usage Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold text-white">Apify Scraper Credits</span>
            {apify?.planName && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase">
                {apify.planName} PLAN
              </span>
            )}
          </div>
          {apify?.email && (
            <span className="text-[11px] text-neutral-500 font-mono">{apify.email}</span>
          )}
        </div>

        {apify ? (
          <div className="space-y-3">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-neutral-400">Monthly Usage Progress</span>
                <span className="font-mono font-bold text-white">
                  ${apify.usedUsd.toFixed(2)} / ${apify.monthlyLimitUsd.toFixed(2)} USD ({apify.usagePercent}%)
                </span>
              </div>
              <div className="w-full bg-white/5 border border-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    apify.usagePercent > 80 ? 'bg-red-500' : apify.usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(3, apify.usagePercent)}%` }}
                />
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase font-medium">Used Credits</span>
                <p className="text-base font-bold text-neutral-200">${apify.usedUsd.toFixed(2)}</p>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase font-medium">Remaining Balance</span>
                <p className="text-base font-bold text-emerald-400">${apify.remainingUsd.toFixed(2)}</p>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase font-medium">Monthly Limit</span>
                <p className="text-base font-bold text-white">${apify.monthlyLimitUsd.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl">
            ⚠️ {data?.apifyError || 'Apify API Token not configured or invalid.'}
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.08]" />

      {/* Gemini AI Status Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold text-white">Gemini AI Engine</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
            gemini?.configured ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}>
            {gemini?.configured ? 'Connected ✅' : 'Missing Key ❌'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase font-medium">Active Model</span>
            <p className="text-xs font-mono font-bold text-violet-300 truncate">{gemini?.model || 'gemini-2.5-flash'}</p>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase font-medium">Pricing Tier</span>
            <p className="text-xs font-bold text-neutral-300">Free Tier / Pay-As-You-Go</p>
          </div>
        </div>
      </div>
    </div>
  );
}

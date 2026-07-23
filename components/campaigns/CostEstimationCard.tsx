'use client';

import React from 'react';
import { Calculator, Cpu, Database, Sparkles } from 'lucide-react';

interface Props {
  source: 'dice' | 'upwork' | 'freelancer' | 'linkedin';
  itemCount: number;
}

const SCRAPER_RATES: Record<string, { name: string; ratePer1k: number; actor: string }> = {
  dice: { name: 'Dice Job Scraper', ratePer1k: 1.00, actor: 'shahidirfan/dice-job-scraper' },
  upwork: { name: 'Upwork Scraper', ratePer1k: 1.00, actor: 'blackfalcondata/upwork-scraper' },
  freelancer: { name: 'Freelancer Jobs Scraper', ratePer1k: 4.00, actor: 'ahmed_jasarevic/freelancer-jobs-scraper' },
  linkedin: { name: 'LinkedIn Jobs Scraper', ratePer1k: 1.00, actor: 'curious_coder/linkedin-jobs-scraper' },
};

// Gemini 3.5 Flash-Lite (or 2.5 Flash-Lite) Pricing per 1M tokens
const GEMINI_PRICING = {
  modelName: 'Gemini 3.5 Flash-Lite',
  inputPricePerM: 0.30,   // $0.30 per 1M input tokens
  outputPricePerM: 2.50,  // $2.50 per 1M output tokens
  avgInputTokensPerJob: 600,   // ~600 tokens input per job context
  avgOutputTokensPerJob: 150,  // ~150 tokens output response per job
};

export default function CostEstimationCard({ source, itemCount }: Props) {
  const scraper = SCRAPER_RATES[source] || SCRAPER_RATES.dice;
  const count = itemCount || 20;

  // 1. Scraping Cost (Apify Actor)
  const apifyScrapeCost = (count / 1000) * scraper.ratePer1k;

  // 2. AI Evaluation Cost (Gemini 3.5 Flash-Lite)
  const totalInputTokens = count * GEMINI_PRICING.avgInputTokensPerJob;
  const totalOutputTokens = count * GEMINI_PRICING.avgOutputTokensPerJob;

  const aiInputCost = (totalInputTokens / 1_000_000) * GEMINI_PRICING.inputPricePerM;
  const aiOutputCost = (totalOutputTokens / 1_000_000) * GEMINI_PRICING.outputPricePerM;
  const aiTotalCost = aiInputCost + aiOutputCost;

  // Total Estimated Cost
  const totalEstimatedCost = apifyScrapeCost + aiTotalCost;

  return (
    <div className="bg-[#0f0f0f] border border-white/15 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Live Campaign Cost Estimation</h3>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-neutral-400 block">Est. Total Cost</span>
          <span className="text-xl font-extrabold text-emerald-400">
            ${totalEstimatedCost < 0.01 ? totalEstimatedCost.toFixed(4) : totalEstimatedCost.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">USD</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        {/* Apify Scraping Cost */}
        <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <Database className="w-3.5 h-3.5 text-orange-400" />
              <span>Apify Scraper ({source.toUpperCase()})</span>
            </div>
            <span className="font-bold text-white">${apifyScrapeCost.toFixed(4)}</span>
          </div>
          <p className="text-[11px] text-neutral-500">
            {count} results @ ${scraper.ratePer1k.toFixed(2)} / 1,000 results
          </p>
        </div>

        {/* Gemini AI Evaluation Cost */}
        <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span>Gemini 3.5 Flash-Lite</span>
            </div>
            <span className="font-bold text-white">${aiTotalCost.toFixed(4)}</span>
          </div>
          <p className="text-[11px] text-neutral-500">
            ~{totalInputTokens.toLocaleString()} in / ~{totalOutputTokens.toLocaleString()} out tokens
          </p>
        </div>
      </div>
    </div>
  );
}

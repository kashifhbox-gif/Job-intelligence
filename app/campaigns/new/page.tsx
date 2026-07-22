'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';

type Source = 'dice' | 'upwork' | 'freelancer' | 'linkedin';

const SOURCES: { id: Source; label: string; color: string; activeClass: string }[] = [
  { id: 'dice',       label: 'Dice Jobs',     color: 'text-orange-400', activeClass: 'border-orange-500 bg-orange-500/10' },
  { id: 'upwork',     label: 'Upwork',        color: 'text-emerald-400', activeClass: 'border-emerald-500 bg-emerald-500/10' },
  { id: 'freelancer', label: 'Freelancer',    color: 'text-blue-400',   activeClass: 'border-blue-500 bg-blue-500/10' },
  { id: 'linkedin',   label: 'LinkedIn Jobs', color: 'text-sky-400',    activeClass: 'border-sky-500 bg-sky-500/10' },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [source, setSource] = useState<Source>('dice');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Shared fields
  const [name, setName] = useState('');
  const [keyword, setKeyword] = useState('');

  // Dice
  const [diceLocation, setDiceLocation] = useState('Remote');
  const [dicePostedDate, setDicePostedDate] = useState('24h');
  const [diceResultsWanted, setDiceResultsWanted] = useState(20);

  // Upwork
  const [upworkJobType, setUpworkJobType] = useState('');
  const [upworkExperience, setUpworkExperience] = useState('');
  const [upworkBudgetMin, setUpworkBudgetMin] = useState('');
  const [upworkBudgetMax, setUpworkBudgetMax] = useState('');
  const [upworkHourlyMin, setUpworkHourlyMin] = useState('');
  const [upworkHourlyMax, setUpworkHourlyMax] = useState('');
  const [upworkMaxResults, setUpworkMaxResults] = useState(50);

  // Freelancer
  const [flSkillInput, setFlSkillInput] = useState('');
  const [flSkills, setFlSkills] = useState<string[]>([]);
  const [flBudgetMin, setFlBudgetMin] = useState('');
  const [flBudgetMax, setFlBudgetMax] = useState('');
  const [flSort, setFlSort] = useState('date_desc');
  const [flLimit, setFlLimit] = useState(100);

  // LinkedIn
  const [liSearchUrl, setLiSearchUrl] = useState('');
  const [liCount, setLiCount] = useState(100);
  const [liScrapeCompany, setLiScrapeCompany] = useState(false);
  const [liSplitByLocation, setLiSplitByLocation] = useState(false);

  const addSkill = () => {
    const trimmed = flSkillInput.trim();
    if (trimmed && !flSkills.includes(trimmed)) {
      setFlSkills([...flSkills, trimmed]);
      setFlSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Campaign name is required'); return; }
    if (source !== 'linkedin' && !keyword.trim()) { setError('Keyword is required'); return; }
    if (source === 'linkedin' && !liSearchUrl.trim()) { setError('LinkedIn search URL is required'); return; }

    setSubmitting(true);
    try {
      const filters: any = {};
      const kw = source === 'linkedin' ? (liSearchUrl || 'LinkedIn Jobs') : keyword;

      if (source === 'dice') {
        filters.location = diceLocation;
        filters.posted_date = dicePostedDate;
        filters.results_wanted = diceResultsWanted;
      } else if (source === 'upwork') {
        if (upworkJobType) filters.jobType = upworkJobType;
        if (upworkExperience) filters.experienceLevel = upworkExperience;
        if (upworkBudgetMin) filters.budgetMin = Number(upworkBudgetMin);
        if (upworkBudgetMax) filters.budgetMax = Number(upworkBudgetMax);
        if (upworkHourlyMin) filters.hourlyMin = Number(upworkHourlyMin);
        if (upworkHourlyMax) filters.hourlyMax = Number(upworkHourlyMax);
        filters.maxResults = upworkMaxResults;
      } else if (source === 'freelancer') {
        if (flSkills.length) filters.skills = flSkills;
        if (flBudgetMin) filters.fixed_budget_min = Number(flBudgetMin);
        if (flBudgetMax) filters.fixed_budget_max = Number(flBudgetMax);
        filters.sort = flSort;
        filters.limit = flLimit;
      } else if (source === 'linkedin') {
        filters.searchUrl = liSearchUrl;
        filters.count = liCount;
        filters.scrapeCompany = liScrapeCompany;
        filters.splitByLocation = liSplitByLocation;
      }

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, source, keyword: kw, filters }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create campaign'); return; }
      router.push(`/campaigns/${data.campaignId}`);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors";
  const labelClass = "block text-xs text-neutral-400 mb-1";
  const selectClass = "w-full px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors";

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/campaigns" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </Link>

      <h1 className="text-2xl font-bold text-white mb-6">New Campaign</h1>

      {/* Source selector */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {SOURCES.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSource(s.id)}
            className={`py-3 rounded-xl border text-sm font-medium transition-all ${
              source === s.id ? `${s.activeClass} ${s.color}` : 'border-white/10 text-neutral-400 hover:border-white/20 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Shared: Campaign name */}
        <div>
          <label className={labelClass}>Campaign Name *</label>
          <input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Remote React Jobs – July 2026" />
        </div>

        {/* ── DICE ── */}
        {source === 'dice' && (
          <>
            <div>
              <label className={labelClass}>Keyword *</label>
              <input className={inputClass} value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. react developer" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Location</label>
                <input className={inputClass} value={diceLocation} onChange={e => setDiceLocation(e.target.value)} placeholder="Remote" />
              </div>
              <div>
                <label className={labelClass}>Posted Date</label>
                <select className={selectClass} value={dicePostedDate} onChange={e => setDicePostedDate(e.target.value)}>
                  <option value="24h">Last 24 hours</option>
                  <option value="3d">Last 3 days</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="all">All time</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Results Wanted: {diceResultsWanted}</label>
              <input type="range" min={10} max={250} step={10} value={diceResultsWanted} onChange={e => setDiceResultsWanted(Number(e.target.value))} className="w-full accent-orange-500" />
            </div>
          </>
        )}

        {/* ── UPWORK ── */}
        {source === 'upwork' && (
          <>
            <div>
              <label className={labelClass}>Search Query *</label>
              <input className={inputClass} value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. next.js developer" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Job Type</label>
                <select className={selectClass} value={upworkJobType} onChange={e => setUpworkJobType(e.target.value)}>
                  <option value="">Any</option>
                  <option value="HOURLY">Hourly</option>
                  <option value="FIXED">Fixed</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Experience Level</label>
                <select className={selectClass} value={upworkExperience} onChange={e => setUpworkExperience(e.target.value)}>
                  <option value="">Any</option>
                  <option value="EntryLevel">Entry Level</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="ExpertLevel">Expert</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Budget Min ($)</label>
                <input type="number" className={inputClass} value={upworkBudgetMin} onChange={e => setUpworkBudgetMin(e.target.value)} placeholder="500" />
              </div>
              <div>
                <label className={labelClass}>Budget Max ($)</label>
                <input type="number" className={inputClass} value={upworkBudgetMax} onChange={e => setUpworkBudgetMax(e.target.value)} placeholder="5000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Hourly Rate Min ($/hr)</label>
                <input type="number" className={inputClass} value={upworkHourlyMin} onChange={e => setUpworkHourlyMin(e.target.value)} placeholder="25" />
              </div>
              <div>
                <label className={labelClass}>Hourly Rate Max ($/hr)</label>
                <input type="number" className={inputClass} value={upworkHourlyMax} onChange={e => setUpworkHourlyMax(e.target.value)} placeholder="150" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Max Results: {upworkMaxResults}</label>
              <input type="range" min={10} max={200} step={10} value={upworkMaxResults} onChange={e => setUpworkMaxResults(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
          </>
        )}

        {/* ── FREELANCER ── */}
        {source === 'freelancer' && (
          <>
            <div>
              <label className={labelClass}>Search Query *</label>
              <input className={inputClass} value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. react node backend" />
            </div>
            <div>
              <label className={labelClass}>Skills (optional)</label>
              <div className="flex gap-2 mb-2">
                <input className={inputClass} value={flSkillInput} onChange={e => setFlSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}} placeholder="Type a skill and press Enter" />
                <button type="button" onClick={addSkill} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              {flSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {flSkills.map(s => (
                    <span key={s} className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs">
                      {s}
                      <button type="button" onClick={() => setFlSkills(flSkills.filter(sk => sk !== s))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Budget Min ($)</label>
                <input type="number" className={inputClass} value={flBudgetMin} onChange={e => setFlBudgetMin(e.target.value)} placeholder="500" />
              </div>
              <div>
                <label className={labelClass}>Budget Max ($)</label>
                <input type="number" className={inputClass} value={flBudgetMax} onChange={e => setFlBudgetMax(e.target.value)} placeholder="5000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Sort By</label>
                <select className={selectClass} value={flSort} onChange={e => setFlSort(e.target.value)}>
                  <option value="date_desc">Newest first</option>
                  <option value="price_desc">Highest budget</option>
                  <option value="bid_asc">Least bids</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Limit: {flLimit}</label>
                <input type="range" min={10} max={500} step={10} value={flLimit} onChange={e => setFlLimit(Number(e.target.value))} className="w-full mt-3 accent-blue-500" />
              </div>
            </div>
          </>
        )}

        {/* ── LINKEDIN JOBS ── */}
        {source === 'linkedin' && (
          <>
            <div className="p-3 bg-sky-500/5 border border-sky-500/20 rounded-lg text-xs text-sky-400">
              💡 Go to <a href="https://www.linkedin.com/jobs/search" target="_blank" rel="noreferrer" className="underline">LinkedIn Jobs</a>, set your filters (role, location, date posted, remote, etc.), then copy the full URL from the address bar and paste it below.
            </div>
            <div>
              <label className={labelClass}>LinkedIn Jobs Search URL *</label>
              <input className={inputClass} value={liSearchUrl} onChange={e => setLiSearchUrl(e.target.value)} placeholder="https://www.linkedin.com/jobs/search/?keywords=react&location=Remote..." />
            </div>
            <div>
              <label className={labelClass}>Max Jobs to Collect: {liCount}</label>
              <input type="range" min={25} max={500} step={25} value={liCount} onChange={e => setLiCount(Number(e.target.value))} className="w-full accent-sky-500" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
                <input type="checkbox" className="rounded" checked={liScrapeCompany} onChange={e => setLiScrapeCompany(e.target.checked)} />
                Scrape company details (slower)
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
                <input type="checkbox" className="rounded" checked={liSplitByLocation} onChange={e => setLiSplitByLocation(e.target.checked)} />
                Split by location (bypass 1000 limit)
              </label>
            </div>
          </>
        )}

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/campaigns" className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-white/5 text-center transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting...</> : 'Launch Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}

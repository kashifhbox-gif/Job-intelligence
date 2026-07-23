'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import DiceForm from '@/components/campaigns/DiceForm';
import UpworkForm from '@/components/campaigns/UpworkForm';
import FreelancerForm from '@/components/campaigns/FreelancerForm';
import LinkedInForm from '@/components/campaigns/LinkedInForm';
import CostEstimationCard from '@/components/campaigns/CostEstimationCard';

type Source = 'dice' | 'upwork' | 'freelancer' | 'linkedin';

const SOURCES: { id: Source; label: string; color: string; activeClass: string }[] = [
  { id: 'dice',       label: 'Dice Jobs',     color: 'text-orange-400', activeClass: 'border-orange-500 bg-orange-500/10' },
  { id: 'upwork',     label: 'Upwork',        color: 'text-emerald-400', activeClass: 'border-emerald-500 bg-emerald-500/10' },
  { id: 'freelancer', label: 'Freelancer',    color: 'text-blue-400',   activeClass: 'border-blue-500 bg-blue-500/10' },
  { id: 'linkedin',   label: 'LinkedIn Jobs', color: 'text-sky-400',    activeClass: 'border-sky-500 bg-sky-500/10' },
];

function NewCampaignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramSource = searchParams.get('source') as Source | null;
  const initialSource: Source = paramSource && ['dice', 'upwork', 'freelancer', 'linkedin'].includes(paramSource) ? paramSource : 'dice';

  const [source, setSource] = useState<Source>(initialSource);

  useEffect(() => {
    const s = searchParams.get('source') as Source | null;
    if (s && ['dice', 'upwork', 'freelancer', 'linkedin'].includes(s)) {
      setSource(s);
    }
  }, [searchParams]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Shared
  const [name, setName] = useState('');
  const [keyword, setKeyword] = useState('');

  // Dice state
  const [diceLocation, setDiceLocation] = useState('Remote');
  const [dicePostedDate, setDicePostedDate] = useState('24h');
  const [diceResultsWanted, setDiceResultsWanted] = useState(20);

  // Upwork state
  const [upworkJobType, setUpworkJobType] = useState('');
  const [upworkExperience, setUpworkExperience] = useState('');
  const [upworkBudgetMin, setUpworkBudgetMin] = useState('');
  const [upworkBudgetMax, setUpworkBudgetMax] = useState('');
  const [upworkHourlyMin, setUpworkHourlyMin] = useState('');
  const [upworkHourlyMax, setUpworkHourlyMax] = useState('');
  const [upworkMaxResults, setUpworkMaxResults] = useState(50);

  // Freelancer state
  const [flSkills, setFlSkills] = useState<string[]>([]);
  const [flBudgetMin, setFlBudgetMin] = useState('');
  const [flBudgetMax, setFlBudgetMax] = useState('');
  const [flSort, setFlSort] = useState('date_desc');
  const [flLimit, setFlLimit] = useState(100);

  // LinkedIn state
  const [liMode, setLiMode] = useState<'builder' | 'custom'>('builder');
  const [liKeyword, setLiKeyword] = useState('');
  const [liLocation, setLiLocation] = useState('United States');
  const [liWorkTypes, setLiWorkTypes] = useState<string[]>(['2']); // Remote by default
  const [liDatePosted, setLiDatePosted] = useState('r86400'); // 24h by default
  const [liExperienceLevels, setLiExperienceLevels] = useState<string[]>([]);
  const [liJobTypes, setLiJobTypes] = useState<string[]>([]);
  const [liCompanyIds, setLiCompanyIds] = useState('');
  const [liSearchUrl, setLiSearchUrl] = useState('');
  const [liCount, setLiCount] = useState(150);
  const [liScrapeCompany, setLiScrapeCompany] = useState(false);
  const [liSplitByLocation, setLiSplitByLocation] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    setKeyword(val);
    setLiKeyword(val);
  };

  const constructLinkedInUrl = () => {
    const params = new URLSearchParams();
    const effectiveKw = liKeyword.trim() || name.trim();
    if (effectiveKw) params.append('keywords', effectiveKw);
    if (liLocation.trim()) params.append('location', liLocation.trim());

    if (liLocation.trim().toLowerCase().includes('united states') || liLocation.trim().toLowerCase() === 'us') {
      params.append('geoId', '103644278');
    }

    if (liDatePosted) params.append('f_TPR', liDatePosted);
    if (liWorkTypes.length > 0) params.append('f_WT', liWorkTypes.join(','));
    if (liExperienceLevels.length > 0) params.append('f_E', liExperienceLevels.join(','));
    if (liJobTypes.length > 0) params.append('f_JT', liJobTypes.join(','));
    if (liCompanyIds.trim()) {
      const cleanIds = liCompanyIds.split(',').map(c => c.trim()).filter(Boolean).join(',');
      if (cleanIds) params.append('f_C', cleanIds);
    }

    params.append('position', '1');
    params.append('pageNum', '0');

    return `https://www.linkedin.com/jobs/search?${params.toString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const effectiveKw = (source === 'linkedin' ? (liKeyword.trim() || name.trim()) : (keyword.trim() || name.trim()));
    if (!name.trim()) { setError('Campaign Name / Search Query is required'); return; }
    if (source !== 'linkedin' && !effectiveKw) { setError('Search query is required'); return; }

    let finalLiUrl = '';
    let finalKw = effectiveKw;

    if (source === 'linkedin') {
      if (liMode === 'builder') {
        if (!effectiveKw && !liCompanyIds.trim()) {
          setError('Please enter a campaign name/search query or company ID for LinkedIn');
          return;
        }
        finalLiUrl = constructLinkedInUrl();
        finalKw = effectiveKw ? `${effectiveKw} (${liLocation})` : `LinkedIn Jobs (${liLocation})`;
      } else {
        if (!liSearchUrl.trim()) {
          setError('LinkedIn search URL is required');
          return;
        }
        finalLiUrl = liSearchUrl.trim();
        finalKw = 'LinkedIn Custom URL Search';
      }
    }

    setSubmitting(true);
    try {
      const filters: any = {};
      const kw = source === 'linkedin' ? finalKw : effectiveKw;

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
        filters.searchUrl = finalLiUrl;
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

  const backUrl = source ? `/campaigns?source=${source}` : '/campaigns';

  const getItemCount = () => {
    if (source === 'dice') return diceResultsWanted;
    if (source === 'upwork') return upworkMaxResults;
    if (source === 'freelancer') return flLimit;
    if (source === 'linkedin') return liCount;
    return 50;
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href={backUrl} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </Link>

      <h1 className="text-2xl font-bold text-white mb-6">New Campaign</h1>

      {/* Source Selector */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {SOURCES.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSource(s.id)}
            className={`py-3 rounded-xl border text-sm font-medium transition-all ${
              source === s.id
                ? `${s.activeClass} ${s.color}`
                : 'border-white/10 text-neutral-400 hover:border-white/20 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campaign Name (Shared - Auto syncs as Search Query) */}
        <div>
          <label className={labelClass}>Campaign Name / Search Query *</label>
          <input
            className={inputClass}
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="e.g. React Developer, Node.js Engineer, Mobile App Developer"
          />
          <p className="text-[11px] text-neutral-500 mt-1">
            This name is automatically used as the search query to scrape jobs.
          </p>
        </div>

        {/* Form Components */}
        {source === 'dice' && (
          <DiceForm
            keyword={keyword}
            setKeyword={setKeyword}
            location={diceLocation}
            setLocation={setDiceLocation}
            postedDate={dicePostedDate}
            setPostedDate={setDicePostedDate}
            resultsWanted={diceResultsWanted}
            setResultsWanted={setDiceResultsWanted}
          />
        )}

        {source === 'upwork' && (
          <UpworkForm
            keyword={keyword}
            setKeyword={setKeyword}
            jobType={upworkJobType}
            setJobType={setUpworkJobType}
            experience={upworkExperience}
            setExperience={setUpworkExperience}
            budgetMin={upworkBudgetMin}
            setBudgetMin={setUpworkBudgetMin}
            budgetMax={upworkBudgetMax}
            setBudgetMax={setUpworkBudgetMax}
            hourlyMin={upworkHourlyMin}
            setHourlyMin={setUpworkHourlyMin}
            hourlyMax={upworkHourlyMax}
            setHourlyMax={setUpworkHourlyMax}
            maxResults={upworkMaxResults}
            setMaxResults={setUpworkMaxResults}
          />
        )}

        {source === 'freelancer' && (
          <FreelancerForm
            keyword={keyword}
            setKeyword={setKeyword}
            skills={flSkills}
            setSkills={setFlSkills}
            budgetMin={flBudgetMin}
            setBudgetMin={setFlBudgetMin}
            budgetMax={flBudgetMax}
            setBudgetMax={setFlBudgetMax}
            sort={flSort}
            setSort={setFlSort}
            limit={flLimit}
            setLimit={setFlLimit}
          />
        )}

        {source === 'linkedin' && (
          <LinkedInForm
            mode={liMode}
            setMode={setLiMode}
            keyword={liKeyword}
            setKeyword={setLiKeyword}
            location={liLocation}
            setLocation={setLiLocation}
            workTypes={liWorkTypes}
            setWorkTypes={setLiWorkTypes}
            datePosted={liDatePosted}
            setDatePosted={setLiDatePosted}
            experienceLevels={liExperienceLevels}
            setExperienceLevels={setLiExperienceLevels}
            jobTypes={liJobTypes}
            setJobTypes={setLiJobTypes}
            companyIds={liCompanyIds}
            setCompanyIds={setLiCompanyIds}
            searchUrl={liSearchUrl}
            setSearchUrl={setLiSearchUrl}
            count={liCount}
            setCount={setLiCount}
            scrapeCompany={liScrapeCompany}
            setScrapeCompany={setLiScrapeCompany}
            splitByLocation={liSplitByLocation}
            setSplitByLocation={setLiSplitByLocation}
            constructedUrl={constructLinkedInUrl()}
          />
        )}

        {/* Live Cost Estimation Card */}
        <CostEstimationCard source={source} itemCount={getItemCount()} />

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href={backUrl}
            className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-white/5 text-center transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Starting...
              </>
            ) : (
              'Launch Campaign'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <NewCampaignContent />
    </Suspense>
  );
}

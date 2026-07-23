'use client';

interface LinkedInFormProps {
  mode: 'builder' | 'custom';
  setMode: (val: 'builder' | 'custom') => void;
  keyword: string;
  setKeyword: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  workTypes: string[];
  setWorkTypes: (val: string[]) => void;
  datePosted: string;
  setDatePosted: (val: string) => void;
  experienceLevels: string[];
  setExperienceLevels: (val: string[]) => void;
  jobTypes: string[];
  setJobTypes: (val: string[]) => void;
  companyIds: string;
  setCompanyIds: (val: string) => void;
  searchUrl: string;
  setSearchUrl: (val: string) => void;
  count: number;
  setCount: (val: number) => void;
  scrapeCompany: boolean;
  setScrapeCompany: (val: boolean) => void;
  splitByLocation: boolean;
  setSplitByLocation: (val: boolean) => void;
  constructedUrl: string;
}

const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors";
const labelClass = "block text-xs text-neutral-400 mb-1";
const selectClass = "w-full px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors";

export default function LinkedInForm({
  mode,
  setMode,
  keyword,
  setKeyword,
  location,
  setLocation,
  workTypes,
  setWorkTypes,
  datePosted,
  setDatePosted,
  experienceLevels,
  setExperienceLevels,
  jobTypes,
  setJobTypes,
  companyIds,
  setCompanyIds,
  searchUrl,
  setSearchUrl,
  count,
  setCount,
  scrapeCompany,
  setScrapeCompany,
  splitByLocation,
  setSplitByLocation,
  constructedUrl,
}: LinkedInFormProps) {
  const toggleArrayItem = (list: string[], item: string, setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-tab toggle */}
      <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl text-xs font-medium">
        <button
          type="button"
          onClick={() => setMode('builder')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            mode === 'builder'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          ⚡ Filter Builder (Recommended)
        </button>
        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            mode === 'custom'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          🔗 Custom LinkedIn URL
        </button>
      </div>

      {mode === 'builder' ? (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Location (Default: United States)</label>
            <input
              className={inputClass}
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="United States"
            />
          </div>

          {/* Work Type */}
          <div>
            <label className={labelClass}>Work Type / Workplace</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: '2', label: 'Remote' },
                { id: '1', label: 'On-site' },
                { id: '3', label: 'Hybrid' },
              ].map(wt => {
                const active = workTypes.includes(wt.id);
                return (
                  <button
                    key={wt.id}
                    type="button"
                    onClick={() => toggleArrayItem(workTypes, wt.id, setWorkTypes)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      active
                        ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    {wt.label} {active && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Posted & Company IDs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date Posted</label>
              <select
                className={selectClass}
                value={datePosted}
                onChange={e => setDatePosted(e.target.value)}
              >
                <option value="r86400">Past 24 hours</option>
                <option value="r604800">Past week</option>
                <option value="r2592000">Past month</option>
                <option value="">Any time</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Company IDs (Optional)</label>
              <input
                className={inputClass}
                value={companyIds}
                onChange={e => setCompanyIds(e.target.value)}
                placeholder="e.g. 27130504, 1124131"
              />
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className={labelClass}>Experience Level (Optional)</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: '1', label: 'Internship' },
                { id: '2', label: 'Entry Level' },
                { id: '3', label: 'Associate' },
                { id: '4', label: 'Mid-Senior' },
                { id: '5', label: 'Director' },
                { id: '6', label: 'Executive' },
              ].map(exp => {
                const active = experienceLevels.includes(exp.id);
                return (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => toggleArrayItem(experienceLevels, exp.id, setExperienceLevels)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                      active
                        ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    {exp.label} {active && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Type */}
          <div>
            <label className={labelClass}>Job Type (Optional)</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'F', label: 'Full-time' },
                { id: 'C', label: 'Contract' },
                { id: 'P', label: 'Part-time' },
                { id: 'T', label: 'Temporary' },
                { id: 'I', label: 'Internship' },
              ].map(jt => {
                const active = jobTypes.includes(jt.id);
                return (
                  <button
                    key={jt.id}
                    type="button"
                    onClick={() => toggleArrayItem(jobTypes, jt.id, setJobTypes)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                      active
                        ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    {jt.label} {active && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generated URL Live Preview */}
          <div className="p-3 bg-sky-500/5 border border-sky-500/20 rounded-lg text-xs text-sky-400 font-mono break-all">
            <span className="text-neutral-400 font-sans block mb-1 font-semibold">
              Generated LinkedIn Search URL:
            </span>
            {constructedUrl}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-sky-500/5 border border-sky-500/20 rounded-lg text-xs text-sky-400">
            💡 Paste the full LinkedIn Jobs search URL directly from your browser.
          </div>
          <div>
            <label className={labelClass}>LinkedIn Jobs Search URL *</label>
            <input
              className={inputClass}
              value={searchUrl}
              onChange={e => setSearchUrl(e.target.value)}
              placeholder="https://www.linkedin.com/jobs/search/?keywords=react&location=United%20States..."
            />
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>Max Jobs to Collect: {count}</label>
        <input
          type="range"
          min={25}
          max={1000}
          step={25}
          value={count}
          onChange={e => setCount(Number(e.target.value))}
          className="w-full accent-sky-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
          <input
            type="checkbox"
            className="rounded"
            checked={scrapeCompany}
            onChange={e => setScrapeCompany(e.target.checked)}
          />
          Scrape company details (slower)
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
          <input
            type="checkbox"
            className="rounded"
            checked={splitByLocation}
            onChange={e => setSplitByLocation(e.target.checked)}
          />
          Split by location (bypass 1000 limit)
        </label>
      </div>
    </div>
  );
}

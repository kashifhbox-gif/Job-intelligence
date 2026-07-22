'use client';

interface UpworkFormProps {
  keyword: string;
  setKeyword: (val: string) => void;
  jobType: string;
  setJobType: (val: string) => void;
  experience: string;
  setExperience: (val: string) => void;
  budgetMin: string;
  setBudgetMin: (val: string) => void;
  budgetMax: string;
  setBudgetMax: (val: string) => void;
  hourlyMin: string;
  setHourlyMin: (val: string) => void;
  hourlyMax: string;
  setHourlyMax: (val: string) => void;
  maxResults: number;
  setMaxResults: (val: number) => void;
}

const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors";
const labelClass = "block text-xs text-neutral-400 mb-1";
const selectClass = "w-full px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors";

export default function UpworkForm({
  keyword,
  setKeyword,
  jobType,
  setJobType,
  experience,
  setExperience,
  budgetMin,
  setBudgetMin,
  budgetMax,
  setBudgetMax,
  hourlyMin,
  setHourlyMin,
  hourlyMax,
  setHourlyMax,
  maxResults,
  setMaxResults,
}: UpworkFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Search Query *</label>
        <input
          className={inputClass}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="e.g. next.js developer"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Job Type</label>
          <select
            className={selectClass}
            value={jobType}
            onChange={e => setJobType(e.target.value)}
          >
            <option value="">Any</option>
            <option value="HOURLY">Hourly</option>
            <option value="FIXED">Fixed</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Experience Level</label>
          <select
            className={selectClass}
            value={experience}
            onChange={e => setExperience(e.target.value)}
          >
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
          <input
            type="number"
            className={inputClass}
            value={budgetMin}
            onChange={e => setBudgetMin(e.target.value)}
            placeholder="500"
          />
        </div>
        <div>
          <label className={labelClass}>Budget Max ($)</label>
          <input
            type="number"
            className={inputClass}
            value={budgetMax}
            onChange={e => setBudgetMax(e.target.value)}
            placeholder="5000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Hourly Rate Min ($/hr)</label>
          <input
            type="number"
            className={inputClass}
            value={hourlyMin}
            onChange={e => setHourlyMin(e.target.value)}
            placeholder="25"
          />
        </div>
        <div>
          <label className={labelClass}>Hourly Rate Max ($/hr)</label>
          <input
            type="number"
            className={inputClass}
            value={hourlyMax}
            onChange={e => setHourlyMax(e.target.value)}
            placeholder="150"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Max Results: {maxResults}</label>
        <input
          type="range"
          min={10}
          max={200}
          step={10}
          value={maxResults}
          onChange={e => setMaxResults(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>
    </div>
  );
}

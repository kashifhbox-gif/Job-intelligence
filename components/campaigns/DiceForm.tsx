'use client';

interface DiceFormProps {
  keyword: string;
  setKeyword: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  postedDate: string;
  setPostedDate: (val: string) => void;
  resultsWanted: number;
  setResultsWanted: (val: number) => void;
}

const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors";
const labelClass = "block text-xs text-neutral-400 mb-1";
const selectClass = "w-full px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors";

export default function DiceForm({
  keyword,
  setKeyword,
  location,
  setLocation,
  postedDate,
  setPostedDate,
  resultsWanted,
  setResultsWanted,
}: DiceFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Location</label>
          <input
            className={inputClass}
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Remote"
          />
        </div>
        <div>
          <label className={labelClass}>Posted Date</label>
          <select
            className={selectClass}
            value={postedDate}
            onChange={e => setPostedDate(e.target.value)}
          >
            <option value="24h">Last 24 hours</option>
            <option value="3d">Last 3 days</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Results Wanted: {resultsWanted}</label>
        <input
          type="range"
          min={10}
          max={1000}
          step={25}
          value={resultsWanted}
          onChange={e => setResultsWanted(Number(e.target.value))}
          className="w-full accent-orange-500"
        />
      </div>
    </div>
  );
}

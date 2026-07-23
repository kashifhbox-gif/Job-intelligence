'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface FreelancerFormProps {
  keyword: string;
  setKeyword: (val: string) => void;
  skills: string[];
  setSkills: (val: string[]) => void;
  budgetMin: string;
  setBudgetMin: (val: string) => void;
  budgetMax: string;
  setBudgetMax: (val: string) => void;
  sort: string;
  setSort: (val: string) => void;
  limit: number;
  setLimit: (val: number) => void;
}

const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors";
const labelClass = "block text-xs text-neutral-400 mb-1";
const selectClass = "w-full px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors";

export default function FreelancerForm({
  keyword,
  setKeyword,
  skills,
  setSkills,
  budgetMin,
  setBudgetMin,
  budgetMax,
  setBudgetMax,
  sort,
  setSort,
  limit,
  setLimit,
}: FreelancerFormProps) {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Skills (optional)</label>
        <div className="flex gap-2 mb-2">
          <input
            className={inputClass}
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Type a skill and press Enter"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.map(s => (
              <span
                key={s}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs"
              >
                {s}
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter(sk => sk !== s))}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
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
          <label className={labelClass}>Sort By</label>
          <select
            className={selectClass}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="date_desc">Newest first</option>
            <option value="price_desc">Highest budget</option>
            <option value="bid_asc">Least bids</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Limit: {limit}</label>
          <input
            type="range"
            min={10}
            max={1000}
            step={25}
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="w-full mt-3 accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

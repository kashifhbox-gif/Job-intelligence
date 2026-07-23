'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';

import { DEFAULT_QUALIFICATION_CRITERIA } from '@/app/services/AiJobService';

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apifyApiKey, setApifyApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.5-flash-lite');
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setApifyApiKey(d.apifyApiKey || '');
      setGeminiApiKey(d.geminiApiKey || '');
      setGeminiModel(d.geminiModel || 'gemini-3.5-flash-lite');
      setAiPrompt(d.aiPrompt || DEFAULT_QUALIFICATION_CRITERIA);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    setSuccess(false);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apifyApiKey, geminiApiKey, geminiModel, aiPrompt }),
    });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const resetCriteria = () => {
    setAiPrompt(DEFAULT_QUALIFICATION_CRITERIA);
  };

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono";
  const labelClass = "block text-sm font-medium text-neutral-300 mb-1.5";
  const selectClass = "w-full px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500";

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Configure API keys and AI lead qualification criteria</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="space-y-6">
          {/* API Keys */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-white text-sm uppercase tracking-wide text-neutral-400">API Keys</h2>
            <div>
              <label className={labelClass}>Apify API Token</label>
              <input type="password" className={inputClass} value={apifyApiKey} onChange={e => setApifyApiKey(e.target.value)} placeholder="apify_api_..." />
              <p className="text-xs text-neutral-600 mt-1">Used to run Dice, Upwork, Freelancer, and LinkedIn Jobs scrapers</p>
            </div>
            <div>
              <label className={labelClass}>Gemini API Key</label>
              <input type="password" className={inputClass} value={geminiApiKey} onChange={e => setGeminiApiKey(e.target.value)} placeholder="AIza..." />
              <p className="text-xs text-neutral-600 mt-1">Used for AI job scoring and outreach hook generation</p>
            </div>
          </div>

          {/* AI Model & Qualification Criteria */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-white text-sm uppercase tracking-wide text-neutral-400">AI Model & Lead Qualification</h2>
            <div>
              <label className={labelClass}>Gemini Model</label>
              <select className={selectClass} value={geminiModel} onChange={e => setGeminiModel(e.target.value)}>
                {GEMINI_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-neutral-300">Lead Qualification Criteria</label>
                <button
                  type="button"
                  onClick={resetCriteria}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Reset to Default Criteria
                </button>
              </div>
              <textarea
                className={`${inputClass} h-52 resize-none leading-relaxed font-sans text-sm`}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Specify your lead qualification rules (target tech stack, client requirements, rate expectations, red flags)..."
              />
              <p className="text-xs text-neutral-600 mt-1">Define what makes a job posting a qualified lead for your business. Applied across all campaign evaluations.</p>
            </div>
          </div>

          {success && (
            <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">
              ✓ Settings saved successfully
            </div>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
}

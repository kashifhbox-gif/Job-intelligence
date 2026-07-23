import { GoogleGenAI } from '@google/genai';

export const DEFAULT_QUALIFICATION_CRITERIA = `HBOX LLC Staff Augmentation & Software Engineering Lead Qualification Criteria:

- Score 9–10 (Prime Contract / Perfect Match):
  * Clear need for IT Staff Augmentation, dedicated developers, full-stack engineers, mobile app developers, or AI/ML specialists.
  * Budget is strong (Hourly >= $40/hr, or Fixed Budget >= $2,000+).
  * Modern tech stack matching HBOX core capabilities: React, Next.js, Node.js, TypeScript, Python, AI/LLMs, React Native, Flutter, AWS, Cloud/DevOps.
  * Long-term contract potential, retainer opportunity, or dedicated agency team requirement.

- Score 7–8 (Strong Opportunity):
  * Relevant software development or staff augmentation requirement with modern tech stack.
  * Moderate budget or newer hiring client with clear project scope.

- Score 4–6 (Low Priority / Marginal):
  * Legacy tech stack (e.g. legacy PHP, WordPress theme tweaks, basic HTML/CSS fixes), vague job scope, or sub-market budget.

- Score 0–3 (Disqualified / Reject):
  * Non-technical roles (data entry, virtual assistant, copywriting), physical/on-site local jobs with no remote flexibility, micro-tasks (<$500 budget), or spam postings.`;

export class AiJobService {
  private ai: GoogleGenAI;
  private modelName: string;
  private basePrompt: string;

  constructor(apiKey: string, modelName: string, basePrompt?: string) {
    if (!apiKey) throw new Error('Gemini API Key is not configured. Please add it in Settings.');
    this.ai = new GoogleGenAI({ apiKey });
    this.modelName = modelName || 'gemini-2.5-flash';
    this.basePrompt = basePrompt || DEFAULT_QUALIFICATION_CRITERIA;
  }

  async evaluateJob(job: {
    title: string;
    company: string;
    description: string;
    salary?: string;
    skills?: string[];
    source: string;
  }) {
    const context = `
Source: ${job.source}
Title: ${job.title}
Company: ${job.company}
${job.salary ? `Salary/Budget: ${job.salary}` : ''}
${job.skills?.length ? `Skills Listed: ${job.skills.join(', ')}` : ''}

Description:
${job.description?.slice(0, 3000)}
    `.trim();

    const criteria = this.basePrompt?.trim() || DEFAULT_QUALIFICATION_CRITERIA;

    const prompt = `
You are an expert Lead Opportunity Analyst for a software staff augmentation agency (HBox LLC).
Evaluate the following job listing according to these Lead Qualification Criteria:

--- LEAD QUALIFICATION CRITERIA ---
${criteria}
--- END CRITERIA ---

Instructions:
1. Score the opportunity strictly from 0 to 10 based on the criteria above.
2. Return ONLY a valid JSON object with this exact structure:
{
  "score": number,
  "reasoning": "1-2 concise sentences explaining why this job matches or fails the qualification criteria.",
  "outreachHook": "A compelling 1-2 sentence outreach proposal positioning HBOX Digital (HBOX LLC) as an elite US-based IT staff augmentation & software engineering partner (generate ONLY if score >= 7, otherwise empty string \\"\\").",
  "keySkills": ["array of key tech skills required by the listing"]
}

Job Listing:
${context}
    `.trim();

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    let resultText = response.text || '';
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    let result = {
      score: 0,
      reasoning: `Failed to parse AI response. Raw output: ${resultText}`,
      outreachHook: '',
      keySkills: [] as string[]
    };
    try {
      result = JSON.parse(resultText);
    } catch (e) {
      console.error('Gemini JSON parse error:', e, 'Raw:', resultText);
    }

    return result;
  }
}

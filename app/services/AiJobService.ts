import { GoogleGenAI } from '@google/genai';

export const DEFAULT_QUALIFICATION_CRITERIA = `Target Lead Qualification Criteria for HBox LLC Staff Augmentation:

- Score 9–10 (Perfect Match): Clear job scope, good budget/rate, verified client, matches modern technology stack (React, Next.js, Node.js, Python, Mobile, AI/ML, Cloud/DevOps). Client has strong history.
- Score 7–8 (Strong Match): Relevant technology stack and reasonable budget. Client may be newer or budget slightly lower than market average.
- Score 4–6 (Partial Match): Somewhat relevant domain but legacy stack, vague description, or low budget.
- Score 0–3 (Reject / Low Quality): Completely different domain, spam posting, extremely low budget, or unclear requirements.`;

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
  "outreachHook": "A personalized 1-2 sentence outreach opening line to send to the client/hiring manager (generate ONLY if score >= 7, otherwise empty string \\"\\").",
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

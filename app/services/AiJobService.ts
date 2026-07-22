import { GoogleGenAI } from '@google/genai';

const DEFAULT_PROMPT = `
You are a Job Opportunity Analyst for a freelance developer / software agency.
Analyze the following job listing and score it from 0 to 10 based on relevance and opportunity quality:

Scoring Guide:
- 9–10: Perfect match — clear scope, good budget/rate, payment-verified client, matches modern stack (React, Next.js, Node.js, Python, Mobile, AI/ML). Client has strong history.
- 7–8: Strong match — relevant tech stack, reasonable budget. Client may be newer or budget slightly low.
- 4–6: Partial match — somewhat relevant domain but wrong stack, vague description, or very low budget.
- 0–3: Not relevant — completely different domain, spam, extremely low budget, or unclear requirements.

Return ONLY valid JSON with this exact structure:
{ "score": number, "reasoning": "string", "outreachHook": "string", "keySkills": ["string"] }

- "reasoning": 1-2 sentences explaining the score.
- "outreachHook": a short, personalized opening line you would send to the client to start a conversation.
- "keySkills": array of the most important skills required by the listing.
`;

export class AiJobService {
  private ai: GoogleGenAI;
  private modelName: string;
  private basePrompt: string;

  constructor(apiKey: string, modelName: string, basePrompt?: string) {
    if (!apiKey) throw new Error('Gemini API Key is not configured. Please add it in Settings.');
    this.ai = new GoogleGenAI({ apiKey });
    this.modelName = modelName || 'gemini-3.5-flash';
    this.basePrompt = basePrompt || DEFAULT_PROMPT;
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

    const prompt = `
${this.basePrompt}

Job Listing:
${context}
    `;

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
    });

    let resultText = response.text || '';
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    let result = { score: 0, reasoning: 'Failed to parse AI response', outreachHook: '', keySkills: [] as string[] };
    try {
      result = JSON.parse(resultText);
    } catch (e) {
      console.error('Gemini JSON parse error:', e, 'Raw:', resultText);
    }

    return result;
  }
}

import fs from 'fs';
import path from 'path';
import { SettingsService } from '@/app/services/SettingsService';
import { AiJobService } from '@/app/services/AiJobService';
import { JobListingService } from '@/app/services/JobListingService';

export async function processJobEvaluation(job: any, logger: any): Promise<boolean> {
  try {
    const adminConfig = await SettingsService.getAdminConfig();

    let geminiKey = adminConfig?.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      try {
        const envFile = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
        const match = envFile.match(/GEMINI_API_KEY=([^\n\r]+)/);
        if (match) geminiKey = match[1].trim();
      } catch (e) { /* ignore */ }
    }

    if (!geminiKey) {
      throw new Error('Gemini API Key is not configured. Please add it in Settings.');
    }

    const modelName = adminConfig?.geminiModel || 'gemini-2.5-flash';
    const basePrompt = adminConfig?.aiPrompt || undefined;

    const aiService = new AiJobService(geminiKey, modelName, basePrompt);

    logger.info({ jobId: job._id, title: job.title }, 'Sending job to AI for evaluation');

    const result = await aiService.evaluateJob({
      title: job.title,
      company: job.company,
      description: job.description,
      salary: job.salary,
      skills: job.skills,
      source: job.source,
    });

    const score = result.score || 0;
    const isQualified = score >= 7;

    logger.info({ jobId: job._id, score, isQualified }, 'AI evaluation complete');

    await JobListingService.updateJob(job._id, {
      score,
      aiReasoning: result.reasoning || 'No reasoning provided.',
      outreachHook: result.outreachHook || '',
      isQualified,
    });

    return isQualified;
  } catch (error: any) {
    logger.error({ err: error.message, jobId: job._id }, 'Failed to evaluate job');
    return false;
  }
}

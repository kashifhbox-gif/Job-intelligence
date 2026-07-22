import { serve } from 'inngest/next';
import { inngest } from '@/app/lib/inngest';
import { evaluateJobs } from '@/app/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [evaluateJobs],
});

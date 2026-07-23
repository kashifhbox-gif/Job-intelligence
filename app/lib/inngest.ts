import { Inngest } from 'inngest';

const isDev = process.env.NODE_ENV !== 'production';

export const inngest = new Inngest({
  id: 'job-intelligence',
  isDev,
  ...(process.env.INNGEST_EVENT_KEY ? { eventKey: process.env.INNGEST_EVENT_KEY } : {}),
});

import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'job-intelligence',
  eventKey: process.env.INNGEST_EVENT_KEY || 'local-dev-event-key',
});

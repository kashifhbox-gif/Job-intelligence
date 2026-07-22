import dotenv from 'dotenv';
dotenv.config();

import { AiJobService } from '../app/services/AiJobService';

async function testAiEvaluation() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not set in .env');
    process.exit(1);
  }

  console.log('🤖 Testing Gemini AI Job Evaluation Service...');
  const aiService = new AiJobService(apiKey, 'gemini-3.5-flash');

  const testJobs = [
    {
      source: 'upwork',
      title: 'Senior Next.js & React Developer Needed for AI SaaS Dashboard',
      company: 'Client from United States',
      salary: '$3,500 fixed',
      skills: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Gemini API'],
      description: 'We are seeking an experienced full-stack Next.js engineer to build a modern dark-mode AI lead generation dashboard. Must have experience with server actions, Tailwind v4, and MongoDB. Payment verified client with over $100k spent on Upwork.',
    },
    {
      source: 'dice',
      title: 'Full Stack Engineer - Python / React',
      company: 'TechCorp Staffing',
      salary: '$140,000 - $160,000 / year',
      skills: ['Python', 'Django', 'React', 'PostgreSQL'],
      description: 'Looking for a Full Stack Engineer to join our core product team. Work on scalable REST APIs and modern React frontends. Remote position in the US.',
    },
    {
      source: 'freelancer',
      title: 'Fix simple HTML bug on landing page',
      company: 'Freelancer Client',
      salary: '$10 - $30 USD',
      skills: ['HTML', 'CSS'],
      description: 'Need someone to change button color on single page website. Quick job 5 minutes.',
    },
    {
      source: 'linkedin',
      title: 'Staff AI Solutions Architect',
      company: 'Enterprise Meta Partner',
      salary: '$180.00 - $220.00 / hr',
      skills: ['LLMs', 'LangChain', 'Python', 'AWS'],
      description: 'Role responsible for designing enterprise generative AI pipelines. Architect solution design for LLM agents and multi-agent systems using Python and vector databases.',
    },
  ];

  for (const job of testJobs) {
    console.log(`\n--------------------------------------------------`);
    console.log(`📌 Testing [${job.source.toUpperCase()}] Job: ${job.title}`);
    const start = Date.now();
    try {
      const result = await aiService.evaluateJob(job);
      const duration = Date.now() - start;

      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`⭐ Score: ${result.score}/10`);
      console.log(`💡 Reasoning: ${result.reasoning}`);
      console.log(`💬 Hook: "${result.outreachHook}"`);
      console.log(`🛠️  Key Skills: ${JSON.stringify(result.keySkills)}`);

      if (typeof result.score === 'number' && result.reasoning && result.outreachHook) {
        console.log('✅ Evaluation structured JSON response verified!');
      } else {
        console.warn('⚠️  Response structure partially incomplete.');
      }
    } catch (err: any) {
      console.error(`❌ Evaluation failed for ${job.title}:`, err.message);
    }
  }

  console.log('\n✅ AI Evaluation test complete.');
  process.exit(0);
}

testAiEvaluation();

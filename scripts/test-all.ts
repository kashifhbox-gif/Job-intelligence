import dotenv from 'dotenv';
dotenv.config();

import { execSync } from 'child_process';

console.log('🚀 Running Full Job Intelligence Verification Suite...\n');

try {
  console.log('==================================================');
  console.log('1️⃣  DATABASE CONNECTION TEST');
  console.log('==================================================');
  execSync('npx tsx scripts/test-db.ts', { stdio: 'inherit' });

  console.log('\n==================================================');
  console.log('2️⃣  SCRAPER MAPPERS & DB PERSISTENCE TEST');
  console.log('==================================================');
  execSync('npx tsx scripts/test-scrapers.ts', { stdio: 'inherit' });

  console.log('\n==================================================');
  console.log('3️⃣  GEMINI AI EVALUATION TEST');
  console.log('==================================================');
  execSync('npx tsx scripts/test-ai.ts', { stdio: 'inherit' });

  console.log('\n✨ ALL SUITE TESTS PASSED SUCCESSFULLY! 🎉');
} catch (error: any) {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
}

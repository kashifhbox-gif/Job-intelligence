import dotenv from 'dotenv';
dotenv.config();

import connectToDatabase from '../app/lib/db';
import Campaign from '../app/models/Campaign';
import JobListing from '../app/models/JobListing';
import User from '../app/models/User';

async function testDatabase() {
  console.log('🔌 Testing MongoDB Atlas connection to database: job_intelligence...');
  try {
    const conn = await connectToDatabase();
    console.log('✅ Connected successfully to MongoDB!');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);

    // Check collections count
    const campaignCount = await Campaign.countDocuments();
    const jobCount = await JobListing.countDocuments();
    const userCount = await User.countDocuments();

    console.log('\n📊 Collection Statistics:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Campaigns: ${campaignCount}`);
    console.log(`   - Job Listings: ${jobCount}`);

    console.log('\n✅ Database test passed completely.');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testDatabase();

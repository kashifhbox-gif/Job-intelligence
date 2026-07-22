import dotenv from 'dotenv';
dotenv.config();

import connectToDatabase from '../app/lib/db';
import User from '../app/models/User';
import bcrypt from 'bcryptjs';

async function seedUser() {
  console.log('👤 Seeding admin user in database: job_intelligence...');
  try {
    await connectToDatabase();

    const email = 'admin@example.com';
    const password = 'adminpassword123';

    let user = await User.findOne({ email });
    if (user) {
      console.log(`ℹ️ User ${email} already exists.`);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        email,
        password: hashedPassword,
        apifyApiKey: process.env.APIFY_API_TOKEN || '',
        geminiApiKey: process.env.GEMINI_API_KEY || '',
        geminiModel: 'gemini-2.5-flash',
      });
      console.log(`✅ Admin user created successfully!`);
    }

    console.log(`\n🔑 Login Credentials:`);
    console.log(`   - Email: ${email}`);
    console.log(`   - Password: ${password}`);
    console.log(`   - Apify Token: ${user.apifyApiKey ? 'Configured ✅' : 'Missing ❌'}`);
    console.log(`   - Gemini Key: ${user.geminiApiKey ? 'Configured ✅' : 'Missing ❌'}`);
    console.log(`   - Gemini Model: ${user.geminiModel}`);
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedUser();

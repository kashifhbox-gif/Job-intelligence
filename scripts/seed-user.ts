import dotenv from 'dotenv';
dotenv.config();

import connectToDatabase from '../app/lib/db';
import User from '../app/models/User';
import bcrypt from 'bcryptjs';

import { DEFAULT_QUALIFICATION_CRITERIA } from '../app/services/AiJobService';

async function seedUser() {
  try {
    const conn = await connectToDatabase();
    console.log(`👤 Seeding admin user in database: ${conn.connection.name}...`);

    const email = 'admin@example.com';
    const password = 'adminpassword123';

    let user = await User.findOne({ email });
    if (user) {
      console.log(`ℹ️ User ${email} already exists.`);
      let updated = false;
      if (!user.aiPrompt) {
        user.aiPrompt = DEFAULT_QUALIFICATION_CRITERIA;
        updated = true;
      }
      if (user.geminiModel !== 'gemini-2.5-flash') {
        user.geminiModel = 'gemini-2.5-flash';
        updated = true;
      }
      if (user.role !== 'admin') {
        user.role = 'admin';
        updated = true;
      }
      if (updated) {
        await user.save();
        console.log(`✅ Admin user verified & updated (role, default criteria, model).`);
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        email,
        password: hashedPassword,
        apifyApiKey: process.env.APIFY_API_TOKEN || '',
        geminiApiKey: process.env.GEMINI_API_KEY || '',
        geminiModel: 'gemini-3.5-flash-lite',
        aiPrompt: DEFAULT_QUALIFICATION_CRITERIA,
        role: 'admin',
      });
      console.log(`✅ Admin user created successfully!`);
    }

    console.log(`\n🔑 Login Credentials:`);
    console.log(`   - Email: ${email}`);
    console.log(`   - Password: ${password}`);
    console.log(`   - Role: ${user.role}`);
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

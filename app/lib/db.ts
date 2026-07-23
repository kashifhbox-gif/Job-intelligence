import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '@/app/models/User';
import { DEFAULT_QUALIFICATION_CRITERIA } from '@/app/services/AiJobService';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

let isSeederExecuted = false;

async function ensureAdminSeeded() {
  if (isSeederExecuted) return;
  try {
    const email = 'admin@example.com';
    const password = 'adminpassword123';

    let user = await User.findOne({ email });
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        email,
        password: hashedPassword,
        apifyApiKey: process.env.APIFY_API_TOKEN || '',
        geminiApiKey: process.env.GEMINI_API_KEY || '',
        geminiModel: 'gemini-3.5-flash-lite',
        aiPrompt: DEFAULT_QUALIFICATION_CRITERIA,
        role: 'admin',
      });
      console.log(`👤 [Vercel Deployment] Admin user (${email}) seeded automatically!`);
    } else if (user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
      console.log(`👤 [Vercel Deployment] Admin role verified for ${email}`);
    }
    isSeederExecuted = true;
  } catch (err: any) {
    // Non-blocking error log during build/connect
    console.warn(`⚠️ Auto-seeding warning:`, err?.message || err);
  }
}

async function connectToDatabase(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI as string;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.conn) {
    ensureAdminSeeded();
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  ensureAdminSeeded();
  return cached.conn;
}

export default connectToDatabase;

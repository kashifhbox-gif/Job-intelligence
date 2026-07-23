import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/db';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';
import { DEFAULT_QUALIFICATION_CRITERIA } from '@/app/services/AiJobService';

export async function GET() {
  try {
    await connectToDatabase();

    const email = 'admin@example.com';
    const password = 'adminpassword123';
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        password: hashedPassword,
        apifyApiKey: process.env.APIFY_API_TOKEN || '',
        geminiApiKey: process.env.GEMINI_API_KEY || '',
        geminiModel: 'gemini-3.5-flash-lite',
        aiPrompt: DEFAULT_QUALIFICATION_CRITERIA,
        role: 'admin',
      });
      return NextResponse.json({
        success: true,
        action: 'created',
        message: 'Admin user created successfully!',
        credentials: { email, password, role: 'admin' },
      });
    } else {
      user.password = hashedPassword;
      user.role = 'admin';
      if (!user.aiPrompt) user.aiPrompt = DEFAULT_QUALIFICATION_CRITERIA;
      if (!user.geminiModel) user.geminiModel = 'gemini-3.5-flash-lite';
      await user.save();

      return NextResponse.json({
        success: true,
        action: 'reset',
        message: 'Admin user password & role updated successfully!',
        credentials: { email, password, role: 'admin' },
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET();
}

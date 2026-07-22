import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/db';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apifyApiKey = process.env.APIFY_API_TOKEN || '';
    const geminiApiKey = process.env.GEMINI_API_KEY || '';

    await User.create({
      email,
      password: hashedPassword,
      apifyApiKey,
      geminiApiKey,
      geminiModel: 'gemini-2.5-flash',
    });

    return NextResponse.json({ success: true, message: 'User created successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/db';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';
import { SettingsService } from '@/app/services/SettingsService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const settings = await SettingsService.getSettings(session.user.email);
    return NextResponse.json({
      apifyApiKey: settings.apifyApiKey || '',
      geminiApiKey: settings.geminiApiKey || '',
      geminiModel: settings.geminiModel || 'gemini-2.5-flash',
      aiPrompt: settings.aiPrompt || '',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const updated = await SettingsService.updateSettings(session.user.email, body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

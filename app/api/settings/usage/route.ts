import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/db';
import User from '@/app/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    const adminUser = await User.findOne({ role: 'admin' });
    const apifyToken = adminUser?.apifyApiKey || process.env.APIFY_API_TOKEN;
    const geminiKey = adminUser?.geminiApiKey || process.env.GEMINI_API_KEY;

    if (!apifyToken) {
      return NextResponse.json({
        apify: null,
        gemini: {
          configured: Boolean(geminiKey),
          model: adminUser?.geminiModel || 'gemini-2.5-flash',
        },
      });
    }

    // Fetch user me details
    const userRes = await fetch(`https://api.apify.com/v2/users/me?token=${apifyToken}`);
    const userData = await userRes.json();

    if (!userRes.ok || !userData.data) {
      return NextResponse.json({
        apify: null,
        gemini: {
          configured: Boolean(geminiKey),
          model: adminUser?.geminiModel || 'gemini-2.5-flash',
        },
        apifyError: 'Invalid or expired Apify API Token',
      });
    }

    // Fetch monthly usage breakdown
    const usageRes = await fetch(`https://api.apify.com/v2/users/me/usage/monthly?token=${apifyToken}`);
    const usageData = await usageRes.json();

    const planName = userData.data.plan?.id || 'STARTER';
    const monthlyLimit = userData.data.plan?.monthlyUsageCreditsUsd || 29;
    const usedUsd = usageData.data?.totalUsageCreditsUsdAfterVolumeDiscount || 0;
    const remainingUsd = Math.max(0, monthlyLimit - usedUsd);
    const usagePercent = Math.min(100, Math.round((usedUsd / monthlyLimit) * 100));

    return NextResponse.json({
      apify: {
        username: userData.data.username,
        email: userData.data.email,
        planName,
        monthlyLimitUsd: monthlyLimit,
        usedUsd: Number(usedUsd.toFixed(2)),
        remainingUsd: Number(remainingUsd.toFixed(2)),
        usagePercent,
      },
      gemini: {
        configured: Boolean(geminiKey),
        model: adminUser?.geminiModel || 'gemini-2.5-flash',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

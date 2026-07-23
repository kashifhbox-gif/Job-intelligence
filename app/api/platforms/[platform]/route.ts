import { NextResponse } from 'next/server';
import { CampaignJobService } from '@/app/services/CampaignJobService';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;
    const stats = await CampaignJobService.getPlatformDashboardStats(platform.toLowerCase());
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

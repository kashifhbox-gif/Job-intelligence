import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/db';
import JobListing from '@/app/models/JobListing';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
    }

    await connectToDatabase();
    const jobs = await JobListing.find({ campaignId, isQualified: true })
      .sort({ score: -1 })
      .lean();

    const headers = ['title', 'company', 'location', 'salary', 'employmentType', 'score', 'url', 'outreachHook'];
    const rows = jobs.map((j: any) => [
      `"${(j.title || '').replace(/"/g, '""')}"`,
      `"${(j.company || '').replace(/"/g, '""')}"`,
      `"${(j.location || '').replace(/"/g, '""')}"`,
      `"${(j.salary || '').replace(/"/g, '""')}"`,
      `"${(j.employmentType || '').replace(/"/g, '""')}"`,
      j.score || '',
      `"${(j.url || '').replace(/"/g, '""')}"`,
      `"${(j.outreachHook || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="qualified-jobs-${campaignId}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

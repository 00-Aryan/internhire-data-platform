import { NextRequest, NextResponse } from 'next/server';
import { runScorePipeline } from '../../../core/scoring/scorePipeline';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting ETL Pipeline via API...');
    await runScorePipeline();
    console.log('ETL Pipeline finished successfully.');
    
    return NextResponse.json({ message: 'ETL pipeline executed successfully', timestamp: new Date() });
  } catch (error) {
    console.error('ETL Pipeline failed:', error);
    return NextResponse.json({ error: 'ETL pipeline failed to execute' }, { status: 500 });
  }
}

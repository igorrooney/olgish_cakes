import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET(request: NextRequest) {
  try {
    console.warn('🔄 Starting daily backup (documents only)...');

    // Run the daily backup
    const result = execSync('npm run backup:daily', {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe'
    });

    return NextResponse.json({
      success: true,
      type: 'daily',
      message: 'Daily backup completed successfully',
      timestamp: new Date().toISOString(),
      output: result
    });

  } catch (error) {
    console.error('❌ Daily backup failed:', error);

    return NextResponse.json({
      success: false,
      type: 'daily',
      message: 'Daily backup failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also handle POST requests (some cron services use POST)
export async function POST(request: NextRequest) {
  return GET(request);
}

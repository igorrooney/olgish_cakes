import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting monthly backup (full with images)...');

    // Run the monthly backup
    const result = execSync('npm run backup:monthly', {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe'
    });

    return NextResponse.json({
      success: true,
      type: 'monthly',
      message: 'Monthly backup completed successfully',
      timestamp: new Date().toISOString(),
      output: result
    });

  } catch (error) {
    console.error('❌ Monthly backup failed:', error);

    return NextResponse.json({
      success: false,
      type: 'monthly',
      message: 'Monthly backup failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also handle POST requests (some cron services use POST)
export async function POST(request: NextRequest) {
  return GET(request);
}

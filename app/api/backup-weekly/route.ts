import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting weekly backup (full with images)...');

    // Run the weekly backup
    const result = execSync('npm run backup:weekly', {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe'
    });

    return NextResponse.json({
      success: true,
      type: 'weekly',
      message: 'Weekly backup completed successfully',
      timestamp: new Date().toISOString(),
      output: result
    });

  } catch (error) {
    console.error('❌ Weekly backup failed:', error);

    return NextResponse.json({
      success: false,
      type: 'weekly',
      message: 'Weekly backup failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also handle POST requests (some cron services use POST)
export async function POST(request: NextRequest) {
  return GET(request);
}

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Getting backup status...');
    
    const backupDirs = ['daily', 'weekly', 'monthly', 'manual'];
    const status = {
      timestamp: new Date().toISOString(),
      backups: {} as Record<string, any>
    };

    for (const dir of backupDirs) {
      const dirPath = path.join('./backups', dir);
      
      try {
        const files = await fs.readdir(dirPath);
        const backupFiles = files.filter(f => f.includes('sanity-backup-'));
        const reportFiles = files.filter(f => f.includes('backup-report-'));
        
        // Get latest backup info
        let latestBackup = null;
        if (backupFiles.length > 0) {
          const latestFile = backupFiles
            .map(f => ({ name: f, path: path.join(dirPath, f) }))
            .sort((a, b) => {
              try {
                const aStats = require('fs').statSync(a.path);
                const bStats = require('fs').statSync(b.path);
                return bStats.mtime.getTime() - aStats.mtime.getTime();
              } catch {
                return 0;
              }
            })[0];
          
          if (latestFile) {
            try {
              const stats = require('fs').statSync(latestFile.path);
              latestBackup = {
                name: latestFile.name,
                size: Math.round(stats.size / 1024), // KB
                created: stats.mtime.toISOString()
              };
            } catch (error) {
              latestBackup = { name: latestFile.name };
            }
          }
        }

        status.backups[dir] = {
          totalBackups: backupFiles.length,
          totalReports: reportFiles.length,
          latestBackup
        };
        
      } catch (error) {
        status.backups[dir] = {
          totalBackups: 0,
          totalReports: 0,
          error: 'Directory not found or inaccessible'
        };
      }
    }

    return NextResponse.json(status);

  } catch (error) {
    console.error('❌ Failed to get backup status:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to get backup status',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

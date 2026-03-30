import cron from 'node-cron';
import * as fs from 'fs';
import * as path from 'path';
import { runScorePipeline } from './scorePipeline';

console.log('🚀 Scheduler Service Started');
console.log('📅 Schedule: Every 5 minutes (*/5 * * * *)');

// Run immediately on start
void (async () => {
  console.log('▶️  Running initial pipeline execution...');
  try {
    await runScorePipeline();
    console.log(' Initial execution completed.');
  } catch (error) {
    console.error('❌ Initial execution failed:', error);
  }
})();

cron.schedule('*/5 * * * *', async () => {
  console.log('\n⏰ Triggering scheduled scoring pipeline...');
  try {
    await runScorePipeline();
    console.log(' Scheduled run completed successfully.');
  } catch (error) {
    console.error('❌ Scheduled run failed:', error);
  }
});

// Log Cleanup Job: Runs every day at midnight (00:00)
cron.schedule('0 0 * * *', () => {
  console.log('🧹 Running log retention cleanup...');
  const LOG_DIR = path.join(process.cwd(), 'logs');
  const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  if (fs.existsSync(LOG_DIR)) {
    try {
      const files = fs.readdirSync(LOG_DIR);
      const now = Date.now();

      for (const file of files) {
        if (!file.endsWith('.log')) continue;
        
        const filePath = path.join(LOG_DIR, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtimeMs > RETENTION_MS) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted old log file: ${file}`);
        }
      }
    } catch (error) {
      console.error('❌ Log cleanup failed:', error);
    }
  }
});
import * as fs from 'fs';
import * as path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

// Simple file logger
export function log(message: string, level: 'INFO' | 'ERROR' = 'INFO') {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] ${message}`;

  // Write to console
  if (level === 'ERROR') console.error(logLine);
  else console.log(logLine);

  // Write to file
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logFile = path.join(LOG_DIR, `etl-pipeline-${dateStr}.log`);
    
    fs.appendFileSync(logFile, logLine + '\n');
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}
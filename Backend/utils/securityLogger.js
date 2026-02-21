import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, '../logs/security.log');

export function logSecurityEvent(event) {
  try {
    const logDir = path.dirname(logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logEntry = `[${new Date().toISOString()}] ${event}\n`;
    fs.appendFileSync(logFile, logEntry);
  } catch (err) {
    console.error('Failed to write security log:', err.message);
  }
}

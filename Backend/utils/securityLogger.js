const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../logs/security.log');

function logSecurityEvent(event) {
  const logEntry = `[${new Date().toISOString()}] ${event}\n`;
  fs.appendFileSync(logFile, logEntry);
}

module.exports = { logSecurityEvent };

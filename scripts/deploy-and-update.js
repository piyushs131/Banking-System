#!/usr/bin/env node
/**
 * Deploys TransactionValidator contract to Ganache and updates Backend/.env with CONTRACT_ADDRESS
 * Run after Ganache is already running on port 8545
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log('Deploying TransactionValidator to Ganache...');
  const output = execSync('npx hardhat run scripts/deploy.js --network ganache', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024
  });
  console.log(output);
  
  const match = output.match(/Contract deployed to:\s*(0x[a-fA-F0-9]{40})/);
  if (match) {
    const addr = match[1];
    const envPath = path.join(__dirname, '..', 'Backend', '.env');
    let env = fs.readFileSync(envPath, 'utf8');
    if (env.includes('CONTRACT_ADDRESS=')) {
      env = env.replace(/CONTRACT_ADDRESS=.*/m, `CONTRACT_ADDRESS=${addr}`);
    } else {
      env += `\nCONTRACT_ADDRESS=${addr}\n`;
    }
    fs.writeFileSync(envPath, env);
    console.log(`Updated Backend/.env with CONTRACT_ADDRESS=${addr}`);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

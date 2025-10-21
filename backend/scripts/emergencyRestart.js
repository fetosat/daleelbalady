#!/usr/bin/env node

/**
 * Emergency Server Restart Script
 * إعادة تشغيل طارئة للخادم مع فحص شامل
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function checkFileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkRequiredFiles() {
  console.log('🔍 Checking required files...');
  
  const requiredFiles = [
    'server.js',
    'lib/db.js',
    'middleware/auth.js',
    'middleware/roleCheck.js',
    'middleware/databaseCheck.js',
    'utils/errorHandler.js',
    'utils/dbHealthCheck.js'
  ];
  
  for (const file of requiredFiles) {
    const exists = await checkFileExists(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    if (!exists && file !== 'middleware/roleCheck.js') {
      console.error(`❌ Critical file missing: ${file}`);
      return false;
    }
  }
  
  return true;
}

async function stopServer() {
  console.log('🛑 Stopping PM2 server...');
  try {
    await execAsync('pm2 stop server');
    console.log('✅ Server stopped');
    return true;
  } catch (error) {
    console.error('❌ Failed to stop server:', error.message);
    return false;
  }
}

async function startServer() {
  console.log('🚀 Starting PM2 server...');
  try {
    await execAsync('pm2 start server');
    console.log('✅ Server start command executed');
    return true;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    return false;
  }
}

async function waitForServer(maxAttempts = 10, intervalMs = 3000) {
  console.log('⏳ Waiting for server to respond...');
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        timeout: 2000
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Server is responding:', data.status);
        return true;
      }
    } catch (error) {
      console.log(`⏳ Attempt ${i + 1}/${maxAttempts}: Server not ready yet...`);
    }
    
    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  console.error('❌ Server failed to respond after maximum attempts');
  return false;
}

async function showLogs() {
  console.log('📋 Recent server logs:');
  try {
    const { stdout } = await execAsync('pm2 logs server --lines 10 --nostream');
    console.log(stdout);
  } catch (error) {
    console.error('❌ Failed to get logs:', error.message);
  }
}

async function main() {
  console.log('🚨 Emergency Server Restart Started\n');
  
  // Check required files
  const filesOk = await checkRequiredFiles();
  if (!filesOk) {
    console.error('💥 Critical files missing. Aborting restart.');
    process.exit(1);
  }
  
  console.log('\n🔄 Proceeding with restart...\n');
  
  // Stop server
  await stopServer();
  
  // Wait a moment
  console.log('⏳ Waiting 2 seconds...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Start server
  const started = await startServer();
  if (!started) {
    console.error('💥 Failed to start server. Check PM2 configuration.');
    process.exit(1);
  }
  
  // Wait for server to be ready
  const ready = await waitForServer();
  if (!ready) {
    console.error('💥 Server started but not responding. Checking logs...\n');
    await showLogs();
    process.exit(1);
  }
  
  console.log('\n🎉 Emergency restart completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Check frontend connectivity');
  console.log('2. Monitor logs: pm2 logs server');
  console.log('3. Run health check: node scripts/checkServerStatus.js');
}

main().catch((error) => {
  console.error('💥 Emergency restart failed:', error);
  process.exit(1);
});

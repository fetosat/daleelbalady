#!/usr/bin/env node

/**
 * Quick Backend Restart Script
 * سكريبت سريع لإعادة تشغيل Backend
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function quickRestart() {
  console.log('🔄 Restarting backend server...');
  
  try {
    // Stop server
    console.log('🛑 Stopping PM2 server...');
    await execAsync('pm2 stop server');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start server
    console.log('🚀 Starting PM2 server...');
    await execAsync('pm2 start server');
    
    console.log('✅ Backend restarted successfully!');
    console.log('📋 Check logs with: pm2 logs server');
    
  } catch (error) {
    console.error('❌ Restart failed:', error.message);
    process.exit(1);
  }
}

quickRestart();

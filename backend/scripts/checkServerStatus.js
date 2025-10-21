#!/usr/bin/env node

/**
 * Server Status Check Script
 * للتحقق السريع من حالة الخادم وقاعدة البيانات
 */

import fetch from 'node-fetch';
import { PrismaClient } from '../generated/prisma/index.js';

const API_URL = process.env.API_URL || 'http://localhost:5000';
const prisma = new PrismaClient();

async function checkAPI() {
  try {
    console.log('🔍 Checking API health...');
    const response = await fetch(`${API_URL}/api/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is healthy:', data.status);
      return true;
    } else {
      console.error('❌ API health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to connect to API:', error.message);
    return false;
  }
}

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database is connected');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function checkSocket() {
  try {
    console.log('🔍 Checking Socket.IO...');
    // Simple check - if server is running, socket should be available
    const response = await fetch(`${API_URL}/socket.io/socket.io.js`);
    
    if (response.ok) {
      console.log('✅ Socket.IO is available');
      return true;
    } else {
      console.log('⚠️ Socket.IO check inconclusive');
      return false;
    }
  } catch (error) {
    console.error('❌ Socket.IO check failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Server Status Check Starting...\n');
  
  const results = {
    api: await checkAPI(),
    database: await checkDatabase(),
    socket: await checkSocket()
  };
  
  console.log('\n📊 Summary:');
  console.log(`API Health: ${results.api ? '✅' : '❌'}`);
  console.log(`Database: ${results.database ? '✅' : '❌'}`);
  console.log(`Socket.IO: ${results.socket ? '✅' : '❌'}`);
  
  const allHealthy = Object.values(results).every(Boolean);
  
  if (allHealthy) {
    console.log('\n🎉 All systems operational!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some systems have issues. Check logs for details.');
    process.exit(1);
  }
}

// Run the check
main().catch((error) => {
  console.error('💥 Status check failed:', error);
  process.exit(1);
});

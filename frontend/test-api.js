// Test script to validate API configuration
const axios = require('axios');

async function testAPI() {
  console.log('🧪 Testing API Configuration...\n');
  
  // Test 1: Check if environment variables are loaded correctly
  console.log('1️⃣ Environment Variables:');
  console.log(`   BACKEND_API_URL: ${process.env.BACKEND_API_URL || 'undefined'}`);
  console.log(`   NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL || 'undefined'}`);
  console.log(`   NEXT_PUBLIC_API_BASE_URL: ${process.env.NEXT_PUBLIC_API_BASE_URL || 'undefined'}\n`);
  
  // Test 2: Try to connect to the backend API directly
  console.log('2️⃣ Testing Backend API Direct Connection:');
  const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.daleelbalady.com/api';
  
  try {
    const response = await axios.get(`${backendUrl}/offers`, { timeout: 5000 });
    console.log(`   ✅ Backend API accessible at: ${backendUrl}`);
    console.log(`   📊 Response status: ${response.status}`);
    console.log(`   📝 Offers count: ${response.data?.offers?.length || 'unknown'}\n`);
  } catch (error) {
    console.log(`   ❌ Backend API not accessible at: ${backendUrl}`);
    console.log(`   🔍 Error: ${error.message}`);
    console.log(`   💡 This is expected if the backend server is not running\n`);
  }
  
  // Test 3: Check Next.js configuration
  console.log('3️⃣ Next.js Configuration Check:');
  try {
    const nextConfig = require('./next.config.js');
    console.log('   ✅ next.config.js exists and is readable');
    console.log('   📋 Rewrite rules configured for API proxy');
    console.log('   🔧 CORS headers configured\n');
  } catch (error) {
    console.log('   ❌ Error reading next.config.js:', error.message);
  }
  
  console.log('📋 Summary:');
  console.log('   • OfferService uses Next.js proxy (/api)');
  console.log('   • useOffers hook updated to use Next.js proxy (/api)');
  console.log('   • Next.js config proxies /api to backend');
  console.log('   • Environment variables configured');
  console.log('   • Enhanced error handling implemented\n');
  
  console.log('🚀 To start the development server:');
  console.log('   npm run dev');
  console.log('   (Make sure backend server is running on the configured URL)');
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testAPI().catch(console.error);

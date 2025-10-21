/**
 * Test script to verify backend API connectivity
 * Run this with: node test-api-connectivity.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPIConnectivity() {
  const baseUrl = 'https://api.daleelbalady.com/api';
  
  console.log('🔍 Testing API connectivity...\n');
  
  // Test 1: Health check
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`https://api.daleelbalady.com/api/health`);
    const healthData = await healthResponse.text();
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${healthData.substring(0, 200)}...`);
  } catch (error) {
    console.error(`   ❌ Health check failed: ${error.message}`);
  }
  
  console.log('');
  
  // Test 2: Categories endpoint
  try {
    console.log('2. Testing categories endpoint...');
    const categoriesResponse = await fetch(`${baseUrl}/advanced-search/categories`);
    const categoriesData = await categoriesResponse.text();
    console.log(`   Status: ${categoriesResponse.status}`);
    console.log(`   Response: ${categoriesData.substring(0, 200)}...`);
    
    if (categoriesResponse.ok) {
      try {
        const json = JSON.parse(categoriesData);
        console.log(`   ✅ Categories found: ${json.categories ? json.categories.length : 'N/A'}`);
      } catch (parseError) {
        console.log(`   ⚠️  Response is not JSON`);
      }
    }
  } catch (error) {
    console.error(`   ❌ Categories endpoint failed: ${error.message}`);
  }
  
  console.log('');
  
  // Test 3: Shop search endpoint (with required parameters)
  try {
    console.log('3. Testing shop search endpoint...');
    const searchResponse = await fetch(`${baseUrl}/shops/search?q=test`);
    const searchData = await searchResponse.text();
    console.log(`   Status: ${searchResponse.status}`);
    console.log(`   Response: ${searchData.substring(0, 200)}...`);
    
    if (searchResponse.ok) {
      try {
        const json = JSON.parse(searchData);
        console.log(`   ✅ Shops found: ${json.shops ? json.shops.length : 'N/A'}`);
      } catch (parseError) {
        console.log(`   ⚠️  Response is not JSON`);
      }
    }
  } catch (error) {
    console.error(`   ❌ Shop search endpoint failed: ${error.message}`);
  }
  
  console.log('\n✅ API connectivity test completed!');
}

testAPIConnectivity().catch(console.error);

/**
 * Test script to verify offers API connectivity
 * Run this with: node test-offers-api.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testOffersAPI() {
  const baseUrl = 'https://api.daleelbalady.com/api';
  
  console.log('🔍 Testing Offers API connectivity...\n');
  
  // Test 1: Basic offers endpoint
  try {
    console.log('1. Testing offers endpoint...');
    const offersResponse = await fetch(`${baseUrl}/offers`);
    const offersData = await offersResponse.text();
    console.log(`   Status: ${offersResponse.status}`);
    console.log(`   Response: ${offersData.substring(0, 300)}...`);
    
    if (offersResponse.ok) {
      try {
        const json = JSON.parse(offersData);
        console.log(`   ✅ Offers found: ${json.offers ? json.offers.length : 'N/A'}`);
        console.log(`   📊 Total offers: ${json.total || 'N/A'}`);
      } catch (parseError) {
        console.log(`   ⚠️  Response is not JSON`);
      }
    }
  } catch (error) {
    console.error(`   ❌ Offers endpoint failed: ${error.message}`);
  }
  
  console.log('');
  
  // Test 2: Featured offers
  try {
    console.log('2. Testing featured offers endpoint...');
    const featuredResponse = await fetch(`${baseUrl}/offers?featured=true`);
    const featuredData = await featuredResponse.text();
    console.log(`   Status: ${featuredResponse.status}`);
    console.log(`   Response: ${featuredData.substring(0, 200)}...`);
    
    if (featuredResponse.ok) {
      try {
        const json = JSON.parse(featuredData);
        console.log(`   ✅ Featured offers found: ${json.offers ? json.offers.length : 'N/A'}`);
      } catch (parseError) {
        console.log(`   ⚠️  Response is not JSON`);
      }
    }
  } catch (error) {
    console.error(`   ❌ Featured offers endpoint failed: ${error.message}`);
  }
  
  console.log('');
  
  // Test 3: Search offers
  try {
    console.log('3. Testing search offers endpoint...');
    const searchResponse = await fetch(`${baseUrl}/offers?search=خصم`);
    const searchData = await searchResponse.text();
    console.log(`   Status: ${searchResponse.status}`);
    console.log(`   Response: ${searchData.substring(0, 200)}...`);
    
    if (searchResponse.ok) {
      try {
        const json = JSON.parse(searchData);
        console.log(`   ✅ Search results: ${json.offers ? json.offers.length : 'N/A'}`);
      } catch (parseError) {
        console.log(`   ⚠️  Response is not JSON`);
      }
    }
  } catch (error) {
    console.error(`   ❌ Search offers endpoint failed: ${error.message}`);
  }
  
  console.log('\n✅ Offers API connectivity test completed!');
}

testOffersAPI().catch(console.error);

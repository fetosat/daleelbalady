import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testAdvancedSearchPerformance() {
  console.log('🧪 Testing advanced search performance...\n');
  
  const tests = [
    {
      name: 'Basic category search (no text)',
      payload: {
        type: 'all',
        category: { categoryId: 'e19beb03-f4c4-41e9-b203-5ff771c746bd' },
        sortBy: 'recommendation',
        page: 1,
        limit: 12
      }
    },
    {
      name: 'Text search with sorting by reviews',
      payload: {
        q: 'doctor',
        type: 'all',
        sortBy: 'reviews',
        page: 1,
        limit: 12
      }
    },
    {
      name: 'Services with rating sort',
      payload: {
        type: 'services',
        sortBy: 'rating',
        page: 1,
        limit: 20
      }
    },
    {
      name: 'Shops with customers sort',
      payload: {
        type: 'shops',
        sortBy: 'customers',
        page: 1,
        limit: 20
      }
    }
  ];
  
  for (const test of tests) {
    console.log(`🔍 Running: ${test.name}`);
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${BASE_URL}/api/advanced-search`, test.payload, {
        timeout: 30000 // 30 seconds
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ Completed in ${duration}ms`);
      console.log(`   Results: ${response.data.shops?.length || 0} shops, ${response.data.services?.length || 0} services, ${response.data.users?.length || 0} users, ${response.data.products?.length || 0} products`);
      console.log(`   Total: ${response.data.pagination?.total || 0} items\n`);
      
      if (duration > 5000) {
        console.warn(`⚠️ Slow response: ${duration}ms (expected < 5000ms)\n`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Failed after ${duration}ms: ${error.message}`);
      if (error.code === 'ECONNABORTED') {
        console.error('   Request timed out - server may be hanging\n');
      } else if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Error: ${error.response.data?.error || 'Unknown error'}\n`);
      }
      console.log('');
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🏁 Performance tests completed');
}

// Run the tests
testAdvancedSearchPerformance().catch(console.error);

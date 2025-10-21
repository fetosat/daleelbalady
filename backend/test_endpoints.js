// Test script for new endpoints
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const PYTHON_API_URL = 'http://localhost:8001';

async function testPythonGeoMulti() {
  try {
    console.log('🧪 Testing Python /geo_multi endpoint...');
    
    const response = await axios.post(`${PYTHON_API_URL}/geo_multi`, {
      entities: {
        services: { enabled: true, limit: 50 },
        shops: { enabled: true, limit: 50 },
        users: { enabled: false, limit: 10 }
      },
      location: {
        lat: 30.0444,
        lon: 31.2357,
        radius: 10
      }
    }, {
      timeout: 10000
    });
    
    console.log('✅ Python /geo_multi response:', {
      status: response.status,
      summary: response.data.summary,
      took_ms: response.data.took_ms
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Python /geo_multi error:', error.message);
    return null;
  }
}

async function testFindPageRoute() {
  try {
    console.log('🧪 Testing Node /api/find endpoint...');
    
    const testQueries = [
      // Basic text search
      {
        name: 'Basic text search',
        params: { query: 'doctor', type: 'all', limit: 10 }
      },
      // Location search
      {
        name: 'Location search',
        params: { 
          query: 'dentist', 
          type: 'services', 
          lat: 30.0444, 
          lon: 31.2357, 
          radius: 5,
          limit: 10 
        }
      },
      // Category filter
      {
        name: 'Category filter',
        params: {
          type: 'shops',
          category: '123e4567-e89b-12d3-a456-426614174000', // dummy UUID
          verified: 'true',
          limit: 5
        }
      }
    ];
    
    for (const test of testQueries) {
      console.log(`\n🔍 Running test: ${test.name}`);
      try {
        const queryString = new URLSearchParams(test.params).toString();
        const response = await axios.get(`${BASE_URL}/api/find?${queryString}`, {
          timeout: 15000
        });
        
        console.log(`✅ ${test.name} response:`, {
          status: response.status,
          searchType: response.data.searchType,
          hasLocationFilter: response.data.hasLocationFilter,
          totalResults: response.data.results?.length || 0,
          totals: response.data.totals
        });
      } catch (error) {
        console.error(`❌ ${test.name} error:`, error.message);
        if (error.response) {
          console.error('Error details:', error.response.data);
        }
      }
    }
  } catch (error) {
    console.error('❌ Find page route test failed:', error.message);
  }
}

async function testAdvancedSearchHanging() {
  try {
    console.log('🧪 Testing advanced search for hanging issues...');
    
    const response = await axios.post(`${BASE_URL}/api/advanced-search`, {
      q: 'doctor',
      type: 'all',
      page: 1,
      limit: 20,
      sortBy: 'recommendation'
    }, {
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Advanced search completed:', {
      status: response.status,
      success: response.data.success,
      shops: response.data.shops?.length || 0,
      services: response.data.services?.length || 0,
      users: response.data.users?.length || 0,
      products: response.data.products?.length || 0,
      pagination: response.data.pagination
    });
    
  } catch (error) {
    console.error('❌ Advanced search test failed:', error.message);
    if (error.code === 'ECONNABORTED') {
      console.error('⚠️ Request timed out - confirms hanging issue');
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting endpoint tests...\n');
  
  // Test Python backend first
  const geoResults = await testPythonGeoMulti();
  
  if (geoResults) {
    console.log('\n📊 Python backend is working correctly\n');
  } else {
    console.log('\n⚠️ Python backend may be down\n');
  }
  
  // Test new find page route
  await testFindPageRoute();
  
  // Test advanced search for hanging issues
  console.log('\n🔧 Testing advanced search stability...');
  await testAdvancedSearchHanging();
  
  console.log('\n🏁 All tests completed');
}

// Run tests
runAllTests().catch(console.error);

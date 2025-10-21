// Test script to debug multi_search endpoint
async function testMultiSearch() {
    const testPayload = {
        entities: {
            services: {
                enabled: true,
                query: "دكتور باطنة internal medicine",
                limit: 10
            }
        }
    };

    console.log('🧪 Testing multi_search endpoint...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    
    try {
        // First test if the API is reachable
        console.log('\n1️⃣ Testing health check...');
        const healthResponse = await fetch('http://72.60.44.41:8000/');
        console.log('Health status:', healthResponse.status);
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('Health data:', healthData);
        }
        
        // Test single search (which we know works)
        console.log('\n2️⃣ Testing single search...');
        const singleResponse = await fetch('http://72.60.44.41:8000/search?query=doctor&limit=5');
        console.log('Single search status:', singleResponse.status);
        if (singleResponse.ok) {
            const singleData = await singleResponse.json();
            console.log('Single search results:', singleData.results.length, 'hits');
        }
        
        // Test multi search
        console.log('\n3️⃣ Testing multi_search...');
        const multiResponse = await fetch('http://72.60.44.41:8000/multi_search', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPayload)
        });
        
        console.log('Multi search status:', multiResponse.status);
        console.log('Response headers:', Object.fromEntries(multiResponse.headers.entries()));
        
        if (multiResponse.ok) {
            const multiData = await multiResponse.json();
            console.log('✅ Multi search SUCCESS!');
            console.log('Results:', JSON.stringify(multiData, null, 2));
        } else {
            const errorText = await multiResponse.text();
            console.log('❌ Multi search FAILED!');
            console.log('Error body:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

// Run the test
testMultiSearch().catch(console.error);

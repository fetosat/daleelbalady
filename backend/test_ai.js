// Test script for AI Magic functionality
import { AI_Magic } from './handler/ai-magic.js';

const testMessage = [
    { 
        role: 'user', 
        parts: [{ text: 'عايز دكتور باطنة' }] 
    }
];

console.log('Testing AI Magic with Arabic medical query...');

AI_Magic(testMessage)
    .then(result => {
        console.log('✅ Test Result:');
        console.log(JSON.stringify(result, null, 2));
        
        // Verify the response structure
        if (result.function === 'multi_entity_search') {
            console.log('\n🔍 Multi-entity search detected');
            console.log('Search type:', result.search_type);
            console.log('Search text:', result.search_text);
            console.log('Entities:', result.entities);
            
            // Check if services are enabled
            if (result.entities?.services_enabled) {
                console.log('✅ Services search is enabled');
            } else {
                console.log('⚠️ Services search is not enabled');
            }
        } else if (result.function === 'reply_to_user') {
            console.log('\n💬 Reply to user detected');
            console.log('Message:', result.message);
        }
    })
    .catch(err => {
        console.error('❌ Test Error:', err);
    });

// Test script to verify AI Magic functionality after fixes
import { AI_Magic } from './handler/ai-magic.js';

async function testAIFunctionality() {
    const testMessages = [
        'عايز دكتور باطنة',
        'hello',
        'أبحث عن صيدلية قريبة',
        'تسلم'
    ];

    console.log('🧪 Testing AI Magic with multiple queries...\n');

    for (let i = 0; i < testMessages.length; i++) {
        const message = testMessages[i];
        console.log(`\n🔍 Test ${i + 1}: "${message}"`);
        console.log('='.repeat(50));

        try {
            const result = await AI_Magic([{
                role: 'user',
                parts: [{ text: message }]
            }]);

            console.log('✅ Result:');
            console.log(JSON.stringify(result, null, 2));

            // Analyze the response
            if (result.function === 'multi_entity_search') {
                console.log('\n📊 Analysis:');
                console.log(`- Search type: ${result.search_type}`);
                console.log(`- Search text: ${result.search_text}`);
                console.log(`- Location required: ${result.location_required}`);
                
                if (result.entities) {
                    const enabledEntities = Object.keys(result.entities)
                        .filter(key => key.includes('_enabled') && result.entities[key])
                        .map(key => key.replace('_enabled', ''));
                    console.log(`- Enabled entities: ${enabledEntities.join(', ')}`);
                    
                    // Check for string vs boolean issues
                    for (const [key, value] of Object.entries(result.entities)) {
                        if (key.includes('_enabled')) {
                            if (typeof value === 'string') {
                                console.log(`⚠️ WARNING: ${key} is string "${value}", expected boolean`);
                            }
                        }
                    }
                }
            } else if (result.function === 'reply_to_user') {
                console.log('\n💬 Reply message:', result.message);
            }

        } catch (error) {
            console.error(`❌ Error testing "${message}":`, error);
        }
    }
}

// Run the test
testAIFunctionality()
    .then(() => {
        console.log('\n🎉 AI functionality test completed!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Test failed:', err);
        process.exit(1);
    });

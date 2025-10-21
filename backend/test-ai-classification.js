// test-ai-classification.js
import { AI_Magic } from "./handler/ai-magic.js";

// Test cases for different search types
const testCases = [
    {
        name: "PERSON Search - Arabic",
        input: "أريد دكتور اسمه محمد أيمن",
        expected: "PERSON"
    },
    {
        name: "SERVICE Search - Arabic", 
        input: "محتاج طبيب أسنان قريب مني",
        expected: "SERVICE"
    },
    {
        name: "SHOP Search - Arabic",
        input: "أين أجد صيدلية العزبي؟",
        expected: "SHOP"
    },
    {
        name: "PRODUCT Search - Arabic",
        input: "عايز أشتري آيفون 15",
        expected: "PRODUCT"
    },
    {
        name: "MIXED Search - Arabic",
        input: "أين أجد آيفون في محل قريب؟",
        expected: "MIXED"
    },
    {
        name: "PERSON Search - English",
        input: "I want a doctor called Mohamed Aymen",
        expected: "PERSON"
    },
    {
        name: "SERVICE Search - English",
        input: "I need a dentist near me",
        expected: "SERVICE"  
    },
    {
        name: "Chat/Reply",
        input: "شكراً ليك",
        expected: "reply_to_user"
    }
];

async function runTest(testCase) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📝 Input: "${testCase.input}"`);
    console.log(`🎯 Expected: ${testCase.expected}`);
    
    try {
        const contents = [
            {
                role: "user",
                parts: [{ text: testCase.input }]
            }
        ];
        
        const result = await AI_Magic(contents);
        
        if (!result) {
            console.log("❌ AI returned null/undefined");
            return false;
        }
        
        console.log(`📊 AI Function: ${result.function}`);
        
        if (result.function === "multi_entity_search") {
            console.log(`🔍 Search Type: ${result.parameters?.search_type}`);
            console.log(`📝 Search Text: ${result.parameters?.search_text?.substring(0, 80)}...`);
            
            if (result.parameters?.entities) {
                const enabledEntities = Object.keys(result.parameters.entities)
                    .filter(key => result.parameters.entities[key]?.enabled);
                console.log(`🎯 Enabled Entities: ${enabledEntities.join(', ')}`);
                
                enabledEntities.forEach(entity => {
                    const entityData = result.parameters.entities[entity];
                    console.log(`   ${entity}: "${entityData.query}"`);
                });
            }
            
            console.log(`📍 Location Required: ${result.parameters?.location_required}`);
            console.log(`📏 Search Radius: ${result.parameters?.search_radius}m`);
            
            // Check if classification matches expectation
            const success = result.parameters?.search_type === testCase.expected;
            console.log(success ? "✅ Classification CORRECT!" : "❌ Classification MISMATCH!");
            return success;
            
        } else if (result.function === "reply_to_user") {
            console.log(`💬 Reply: ${result.parameters?.message}`);
            const success = testCase.expected === "reply_to_user";
            console.log(success ? "✅ Classification CORRECT!" : "❌ Classification MISMATCH!");
            return success;
        } else {
            console.log(`❌ Unexpected function: ${result.function}`);
            return false;
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    console.log("🚀 Starting AI Classification Tests...\n");
    console.log("=" .repeat(60));
    
    let passed = 0;
    let total = testCases.length;
    
    for (const testCase of testCases) {
        const success = await runTest(testCase);
        if (success) passed++;
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log("\n" + "=".repeat(60));
    console.log(`📊 Test Results: ${passed}/${total} passed`);
    console.log(`✅ Success Rate: ${Math.round((passed/total) * 100)}%`);
    
    if (passed === total) {
        console.log("🎉 All tests passed! AI classification is working perfectly!");
    } else {
        console.log("⚠️  Some tests failed. Check the output above for details.");
    }
}

// Run the tests
runAllTests().catch(console.error);

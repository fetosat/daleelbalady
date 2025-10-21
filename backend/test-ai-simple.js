// test-ai-simple.js
import { AI_Magic } from "./handler/ai-magic.js";

async function testAI() {
    console.log("🧪 Testing AI_Magic directly...");
    
    try {
        const contents = [
            {
                role: "user",
                parts: [{ text: "i need a doctor" }]
            }
        ];
        
        console.log("📤 Sending to AI_Magic:", JSON.stringify(contents, null, 2));
        
        const result = await Promise.race([
            AI_Magic(contents),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 15000)
            )
        ]);
        
        console.log("📥 AI_Magic response:", JSON.stringify(result, null, 2));
        
        if (result && result.function) {
            console.log("✅ AI is working! Function:", result.function);
            if (result.parameters) {
                console.log("📋 Parameters:", Object.keys(result.parameters));
            }
        } else {
            console.log("❌ AI response is invalid");
        }
        
    } catch (error) {
        console.error("❌ AI_Magic test failed:", error.message);
        console.error("Stack:", error.stack);
    }
}

testAI();

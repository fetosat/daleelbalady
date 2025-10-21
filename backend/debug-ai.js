// debug-ai.js
import { GoogleGenAI, Type } from "@google/genai";

async function testBasicAI() {
    console.log("🔍 Testing Google Gemini AI...");
    
    try {
        console.log("1️⃣ Creating AI client...");
        const ai = new GoogleGenAI({ apiKey: "AIzaSyAmOovOBrwv6scGkLtPCkdeAvsWVI8KIcI" });
        console.log("✅ AI client created");
        
        console.log("2️⃣ Testing simple request...");
        const simpleResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: [{
                role: "user",
                parts: [{ text: "Hello, respond with just 'Hi'" }]
            }]
        });
        
        console.log("✅ Simple response:", simpleResponse.candidates[0].content.parts[0].text);
        
        console.log("3️⃣ Testing JSON structured response...");
        const jsonResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        function: { type: Type.STRING },
                        message: { type: Type.STRING }
                    }
                }
            },
            contents: [{
                role: "user", 
                parts: [{ text: "i need a doctor" }]
            }]
        });
        
        const jsonText = jsonResponse.candidates[0].content.parts[0].text;
        console.log("✅ JSON response raw:", jsonText);
        
        try {
            const parsed = JSON.parse(jsonText);
            console.log("✅ JSON parsed:", parsed);
        } catch (parseError) {
            console.error("❌ JSON parse error:", parseError.message);
        }
        
    } catch (error) {
        console.error("❌ AI test failed:", error.message);
        console.error("Full error:", error);
    }
}

testBasicAI();

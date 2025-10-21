// handler/ai-magic-simple.js - Simplified AI for debugging
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAmOovOBrwv6scGkLtPCkdeAvsWVI8KIcI" });

export const AI_Magic_Simple = async (userMessage) => {
    console.log("🤖 AI_Magic_Simple called with:", userMessage?.substring(0, 50));
    
    try {
        // Much simpler prompt for testing
        const response = await Promise.race([
            ai.models.generateContent({
                model: "gemini-1.5-flash",  // Use stable model
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        required: ["function"],
                        properties: {
                            function: { type: Type.STRING },
                            query: { type: Type.STRING },
                            message: { type: Type.STRING }
                        }
                    }
                },
                contents: [{
                    role: "user",
                    parts: [{ 
                        text: `Classify this request: "${userMessage}". 
                        
If user wants to find a service/doctor/shop/product, respond with:
{"function": "search", "query": "optimized search terms"}

If user is just chatting/greeting, respond with:  
{"function": "reply", "message": "your friendly reply"}

Examples:
- "i need a doctor" → {"function": "search", "query": "doctor medical healthcare"}
- "hello" → {"function": "reply", "message": "Hello! How can I help you?"}` 
                    }]
                }]
            }),
            // 10 second timeout
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('AI timeout')), 10000)
            )
        ]);

        const rawText = response.candidates[0]?.content?.parts[0]?.text;
        console.log("🤖 AI raw response:", rawText);
        
        if (!rawText) {
            throw new Error("No response from AI");
        }

        const parsed = JSON.parse(rawText);
        console.log("🤖 AI parsed response:", parsed);
        
        return parsed;
        
    } catch (error) {
        console.error("🤖 AI_Magic_Simple error:", error.message);
        
        // Fallback logic based on keywords
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('doctor') || lowerMessage.includes('dentist') || 
            lowerMessage.includes('طبيب') || lowerMessage.includes('دكتور')) {
            return {
                function: "search",
                query: `${userMessage} doctor medical healthcare طبيب دكتور`
            };
        }
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || 
            lowerMessage.includes('مرحبا') || lowerMessage.includes('سلام')) {
            return {
                function: "reply",
                message: "Hello! How can I help you find services in your area?"
            };
        }
        
        // Default to search
        return {
            function: "search", 
            query: userMessage
        };
    }
};

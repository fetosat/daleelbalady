// handler/handle_ai_simple.js - Simplified version for debugging
import { AI_Magic_Simple } from "./ai-magic-simple.js";
import { PrismaClient } from "../generated/prisma/client.js";

export const handle_ai_simple = async (socket, ai, msg) => {
    console.log("🚀 handle_ai_simple called with:", typeof msg);
    
    // Extract message text
    let messageText;
    if (typeof msg === 'string') {
        messageText = msg;
    } else if (msg && typeof msg === 'object') {
        messageText = msg.message || JSON.stringify(msg);
    } else {
        messageText = String(msg);
    }
    
    console.log("📝 Message text:", messageText);
    
    try {
        // Call simplified AI
        console.log("🤖 Calling AI_Magic_Simple...");
        const aiResponse = await Promise.race([
            AI_Magic_Simple(messageText),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Handler timeout')), 15000)
            )
        ]);
        
        console.log("🤖 AI response:", aiResponse);
        
        if (aiResponse.function === "reply") {
            // Simple reply
            console.log("💬 Sending simple reply");
            socket.emit("ai_message", {
                function: "reply_to_user",
                parameters: { message: aiResponse.message }
            });
        } 
        else if (aiResponse.function === "search") {
            // Simple search using existing vector search
            console.log("🔍 Performing simple search for:", aiResponse.query);
            
            try {
                const searchUrl = `http://72.60.44.41:8000/search?query=${encodeURIComponent(aiResponse.query)}&limit=5`;
                console.log("🔍 Calling search API:", searchUrl);
                
                const searchRes = await fetch(searchUrl).then(res => res.json());
                console.log("🔍 Search results:", searchRes?.results?.length || 0, "items");
                
                if (searchRes?.results?.length > 0) {
                    // Get full service data
                    const prisma = new PrismaClient();
                    const services = await prisma.service.findMany({
                        where: {
                            id: { in: searchRes.results.slice(0, 3).map(r => r.id) }
                        },
                        select: {
                            id: true,
                            translation: true,
                            phone: true,
                            city: true,
                            price: true,
                            reviews: true
                        }
                    });
                    
                    console.log("🔍 Found", services.length, "services");
                    
                    // Send results
                    socket.emit("search_results", {
                        results: services,
                        query: aiResponse.query
                    });
                } else {
                    socket.emit("ai_message", {
                        function: "reply_to_user", 
                        parameters: { message: "Sorry, I couldn't find any results for that search." }
                    });
                }
                
            } catch (searchError) {
                console.error("🔍 Search error:", searchError.message);
                socket.emit("ai_message", {
                    function: "reply_to_user",
                    parameters: { message: "Search service is temporarily unavailable." }
                });
            }
        }
        else {
            // Unknown function
            console.log("❓ Unknown function:", aiResponse.function);
            socket.emit("ai_message", {
                function: "reply_to_user",
                parameters: { message: "I didn't understand that. Can you try rephrasing?" }
            });
        }
        
    } catch (error) {
        console.error("❌ handle_ai_simple error:", error.message);
        socket.emit("ai_message", {
            function: "reply_to_user",
            parameters: { message: "Sorry, I'm having trouble processing that request." }
        });
    }
};

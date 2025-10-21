

import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export const AI_Magic = async (contents) => {
  console.log("🤖 AI_Magic called with", contents.length, "messages");

  const model = "gemini-2.5-flash";  // Use more stable model
  const config = {
    thinkingConfig: {
      thinkingBudget: -1,
    },
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      required: ["function", "message", "search_type", "search_text", "location_required", "entities"],
      properties: {
        function: {
          type: Type.STRING,
          enum: ["reply_to_user", "multi_entity_search"],
        },
        message: {
          type: Type.STRING,
        },
        search_type: {
          type: Type.STRING,
          enum: ["SERVICE", "PERSON", "SHOP", "PRODUCT", "MIXED"],
        },
        search_text: {
          type: Type.STRING,
        },
        location_required: {
          type: Type.BOOLEAN,
        },
        entities: {
          type: Type.OBJECT,
          required: ["users_enabled", "users_query", "services_enabled", "services_query"],
          properties: {
            users_enabled: {
              type: Type.STRING,
            },
            users_query: {
              type: Type.STRING,
            },
            services_enabled: {
              type: Type.BOOLEAN,
            },
            services_query: {
              type: Type.STRING,
            },
            shops_enabled: {
              type: Type.BOOLEAN,
            },
            shops_query: {
              type: Type.STRING,
            },
            products_enabled: {
              type: Type.BOOLEAN,
            },
            products_query: {
              type: Type.STRING,
            },
          },
        },
      },
    },
    systemInstruction: [
      {
        text: `You are Daleel Balady "دليل بلدي", an AI assistant for finding people, services, shops, and products.

IMPORTANT: Always respond with valid, well-formed JSON. No extra text or explanations.

FUNCTIONS:
1. "reply_to_user" - for greetings, thanks, or general conversation
   Format: {"function": "reply_to_user", "message": "your response"}

2. "multi_entity_search" - for any search request
   Format: {
     "function": "multi_entity_search",
     "search_type": "SERVICE",
     "search_text": "doctor باطنة internal medicine",
     "location_required": true,
     "entities": {
       "services_enabled": true,
       "services_query": "doctor internal medicine باطنة"
     }
   }

SEARCH TYPES:
- SERVICE: Medical services, clinics, treatments
- PERSON: Finding specific individuals
- SHOP: Stores, businesses, establishments
- PRODUCT: Physical items, medicines, goods
- MIXED: Multiple entity types

ENTITIES (enable only what's needed):
- services_enabled/services_query: Medical services, treatments
- users_enabled/users_query: Individual doctors, providers
- shops_enabled/shops_query: Pharmacies, clinics, stores
- products_enabled/products_query: Medicines, medical supplies

EXAMPLES:
User: "hello" → {"function": "reply_to_user", "message": "مرحباً! كيف يمكنني مساعدتك؟"}

User: "عايز دكتور باطنة" → {
  "function": "multi_entity_search",
  "search_type": "SERVICE",
  "search_text": "دكتور باطنة internal medicine doctor",
  "location_required": true,
  "entities": {
    "services_enabled": true,
    "services_query": "دكتور باطنة internal medicine"
  }
}`,
      }
    ],
  };

  // Only valid roles: 'user', 'model'.
  const allContents = [...contents];

  const response = await ai.models.generateContent({
    model,
    config,
    contents: allContents,
  });

  try {
    const txt = response.candidates[0].content.parts[0].text;
    console.log("Raw AI response length:", txt?.length || 0);
    console.log("Raw AI response:", txt);

    // Truncate response if too long (indicates infinite loop)
    const truncatedTxt = txt?.length > 5000 ? txt.substring(0, 5000) + '...' : txt;

    let parsed;
    try {
      parsed = JSON.parse(truncatedTxt);
    } catch (parseError) {
      console.error("JSON Parse Error. Attempting to fix malformed JSON...");
      // Try to extract valid JSON from the beginning of the response
      const jsonMatch = truncatedTxt.match(/^\{[^}]*"function"[^}]*\}/s);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
          console.log("✅ Recovered from malformed JSON");
        } catch (e) {
          console.error("Failed to recover JSON");
          return {
            function: "reply_to_user",
            message: "عذراً، حدث خطأ في معالجة طلبك. حاول مرة أخرى."
          };
        }
      } else {
        return {
          function: "reply_to_user",
          message: "عذراً، حدث خطأ في معالجة طلبك. حاول مرة أخرى."
        };
      }
    }

    // Validate the parsed response
    if (!parsed?.function) {
      console.error("Invalid AI response: missing function field");
      return {
        function: "reply_to_user",
        message: "عذراً، حدث خطأ في معالجة طلبك. حاول مرة أخرى."
      };
    }

    // Log for debugging
    console.log("AI Classification:", {
      function: parsed.function,
      search_type: parsed.search_type,
      entities: parsed.entities ? Object.keys(parsed.entities).filter(k => parsed.entities[k]) : []
    });

    return parsed;
  } catch (e) {
    console.error("AI_Magic error:", e);
    console.error("Raw response preview:", response.candidates[0]?.content?.parts[0]?.text?.substring(0, 500));
    return {
      function: "reply_to_user",
      message: "عذراً، حدث خطأ في معالجة طلبك. حاول مرة أخرى."
    };
  }
};

// handler/ai-roles.js
export const SYSTEM_PROMPT = `
You are Daleel Balady "دليل بلدي", an AI assistant that helps users find jobs, services, and professionals in their city.
Always respond ONLY with valid JSON (no extra text). The JSON must be an object with:
{
  "function": "<reply_to_user|query_category>",
  "parameters": { ... }
}
Keep replies short, friendly, and Arabic-first if user speaks Arabic.

If user asks for a service/job lookup, call function "query_category" with parameters:
{ "query": "...", "category": "...", "sub_category": "...", "city": "...", "limit": 5 }
after that the backend will send the raw search results to the frontend for display in cards.
then you will call "reply_to_user" to summarize the results in a friendly way.

If user just wants chit-chat or confirmation, use "reply_to_user" with:
{ "message": "..." }

If the user's location is required and not provided, you may call "query_category" without city, and the server will request location from the frontend.
`;

export const FUNCTIONS = [
  {
    name: "reply_to_user",
    description: "Send a friendly conversational reply back to the user.",
    parameters: {
      type: "object",
      properties: {
        message: { type: "string" }
      },
      required: ["message"]
    }
  },
  {
    name: "query_category",
    description: "Search for services/jobs using the search API with filters.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        category: { type: "string" },
        sub_category: { type: "string" },
        city: { type: "string" },
        limit: { type: "integer" }
      },
      required: ["query"]
    }
  }
];

export function generate_function_reply(output = {}, action = "default_action") {
    return {
        role: "model", // ✅ must be model, not user
        parts: [
            {
                text: JSON.stringify({
                    functionResponse: {
                        name: action,
                        response: {
                            output: output,
                        },
                    },
                }),
            },
        ],
    };
}

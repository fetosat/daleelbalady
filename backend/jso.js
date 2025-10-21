// save as copyChunks.js
import fs from "fs";
import path from "path";
import readline from "readline";
import { GoogleGenAI, Type } from "@google/genai";

const raw = fs.readFileSync("./vesito/gharbia.json", "utf-8");
const data = JSON.parse(raw);
const MODEL = "gemini-2.5-pro";

console.log(`✅ Loaded ${data.length} items from gharbia.json`);

let index = 0;
const chunkSize = 100;

// ---------- GEMINI SETUP ----------
const ai = new GoogleGenAI({
  apiKey: "AIzaSyCNdVSxfaXj5xrvW0EBht5dSkeRtZHd5Dc",
});

const config = {
  thinkingConfig: {
    thinkingBudget: -1,
  },
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    required: ["entries"],
    properties: {
      entries: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["user", "shop", "service"],
          properties: {
            user: {
              type: Type.OBJECT,
              required: ["name", "phone", "role"],
              properties: {
                id: {
                  type: Type.STRING,
                },
                name: {
                  type: Type.STRING,
                },
                email: {
                  type: Type.STRING,
                },
                phone: {
                  type: Type.STRING,
                },
                role: {
                  type: Type.STRING,
                  enum: ["CUSTOMER", "PROVIDER", "SHOP_OWNER"],
                },
              },
            },
            shop: {
              type: Type.OBJECT,
              required: ["name", "phone", "address_en"],
              properties: {
                id: {
                  type: Type.STRING,
                },
                name: {
                  type: Type.STRING,
                },
                description: {
                  type: Type.STRING,
                },
                phone: {
                  type: Type.STRING,
                },
                city: {
                  type: Type.STRING,
                },
                address_ar: {
                  type: Type.STRING,
                },
                address_en: {
                  type: Type.STRING,
                },
                tags: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                },
              },
            },
            service: {
              type: Type.OBJECT,
              required: ["name_en", "description_en", "category_id", "embeddingText"],
              properties: {
                id: {
                  type: Type.STRING,
                },
                name_ar: {
                  type: Type.STRING,
                },
                name_en: {
                  type: Type.STRING,
                },
                description_ar: {
                  type: Type.STRING,
                },
                description_en: {
                  type: Type.STRING,
                },
                phone: {
                  type: Type.STRING,
                },
                category_id: {
                  type: Type.STRING,
                },
                tags: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                },
                price: {
                  type: Type.NUMBER,
                },
                embeddingText: {
                  type: Type.STRING,
                  description: "AI-generated detailed keyword-rich description combining all available info for semantic search",
                },
              },
            },
            reviews: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["author", "rating", "comment"],
                properties: {
                  author: {
                    type: Type.STRING,
                  },
                  rating: {
                    type: Type.INTEGER,
                  },
                  comment: {
                    type: Type.STRING,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  systemInstruction: [
    {
      text: `You are an AI that prepares structured data for a local search marketplace (shops, services, and providers).
For each service entry, you must generate the field embeddingText.

embeddingText should be:

A detailed, keyword-rich description combining the service name, description (Arabic + English), shop info, tags, and category.

Written in natural language, but optimized for semantic search.

Contain synonyms, related keywords, and contextual details a user might search for.

Must be long enough (100–200 words) to capture all possible queries.

Should mix Arabic and English terms naturally for multilingual search.

Example:
If the service is a dentist named “Dr. Mohamed – Dental Clinic” with tags [“teeth”, “orthodontics”], generate something like:

"embeddingText": "Dr. Mohamed Dental Clinic offers professional dental care in Cairo including teeth cleaning, braces, orthodontics, and cosmetic dentistry. خدمات دكتور محمد تشمل تنظيف الأسنان، تقويم الأسنان، تجميل الأسنان، وعلاج اللثة. Located in a modern clinic, available for appointments with affordable prices. Keywords: dentist, dental clinic, Cairo, teeth whitening, cosmetic dentist, علاج الأسنان، طبيب أسنان، عيادة أسنان في القاهرة."

Always ensure embeddingText is comprehensive, descriptive, and keyword-dense.

Dont miss a single entry do them all if u have 50 rows csv output 50 rows json`,
    },
  ],
};
async function prompt() {
  if (index >= data.length) {
    console.log("🎉 All items copied! Exiting...");
    process.exit(0);
  }

  const chunk = data.slice(index, index + chunkSize);

  console.log(`🤖 Sending XLSX content to Gemini (streaming)...`);
  const contents = [{ role: "user", parts: [{ text: JSON.stringify(chunk) }] }];

  const responseStream = await ai.models.generateContentStream({
    model: MODEL,
    config,
    contents,
  });

  let output = "";
  let chunkCount = 0;

  for await (const chunk of responseStream) {
    if (chunk.text) {
      output += chunk.text;
      chunkCount++;
      if (chunkCount % 5 === 0) {
        console.log(`📡 Streamed ${chunkCount} chunks so far...`);
      }
    }
  }

  console.log(`✅ Completed streaming for ${fileName}`);

  let jsonData;
  try {
    jsonData = JSON.parse(output);
  } catch (err) {
    console.error(`❌ Failed to parse JSON from Gemini output`, err);
    prompt()
    return;
  }

  const outputPath = path.join(
    "./output",
    `${index.toString()}.json`
  );
  fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), "utf-8");
  console.log(`💾 Saved structured data to: ${outputPath}`);

  index += chunkSize;
}


prompt()
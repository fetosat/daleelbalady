// ai-import.js
// Usage: node ai-import.js
// Requirements:
//   npm install @google/genai mime xlsx
//   GEMINI_API_KEY must be set in env.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { PrismaClient } from "./generated/prisma/client.js";
import XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

// ---------- CONFIG ----------
const DATA_DIR = path.join(__dirname, "data");
const OUTPUT_DIR = path.join(__dirname, "output");
const MODEL = "gemini-2.5-pro";

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ---------- GEMINI SETUP ----------
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
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

// ---------- FUNCTIONS ----------
function readExcel(filePath) {
    console.log(`📂 Reading XLSX file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // first sheet
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    return json.map((row) => row.join(", ")).join("\n"); // plain text
}

async function processExcel(filePath, fileName) {
    const rawText = readExcel(filePath);

    console.log(`🤖 Sending XLSX content to Gemini (streaming)...`);
    const contents = [{ role: "user", parts: [{ text: rawText }] }];

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
        throw err;
    }

    const outputPath = path.join(
        OUTPUT_DIR,
        `${path.basename(fileName, ".xlsx")}.json`
    );
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), "utf-8");
    console.log(`💾 Saved structured data to: ${outputPath}`);

    return jsonData;
}

async function importData(jsonData) {
    console.log(`🚀 Starting data import into Prisma...`);

    for (const entry of jsonData.entries) {
        // 1. User
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: entry.user.phone !== "N/A" ? entry.user.phone : undefined },
                    { name: entry.user.name }
                ]
            },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: entry.user.name,
                    phone: entry.user.phone !== "N/A" ? entry.user.phone : null,
                    role: entry.user.role || "CUSTOMER",
                },
            });
        }

        // 2. Shop
        let shop = await prisma.shop.findFirst({
            where: {
                name: entry.shop.name,
                ownerId: user.id,
            },
        });

        if (!shop) {
            // ensure translation row
            const translation = await prisma.shop_translation.create({
                data: {
                    text_en: entry.shop.address_en || "",
                    text_ar: entry.shop.address_ar || "",
                },
            });

            shop = await prisma.shop.create({
                data: {
                    name: entry.shop.name,
                    phone: entry.shop.phone !== "N/A" ? entry.shop.phone : null,
                    city: entry.shop.city || null,
                    adressId: translation.id,
                    ownerId: user.id,
                },
            });
        }

        // 3. Tags
        let tagIds = [];
        if (entry.shop.tags && entry.shop.tags.length) {
            for (const t of entry.shop.tags) {
                let tag = await prisma.tags.findFirst({ where: { name: t } });
                if (!tag) {
                    tag = await prisma.tags.create({ data: { name: t } });
                }
                tagIds.push(tag.id);
            }
        }

        // 4. Service
        let service = await prisma.service.findFirst({
            where: {
                shopId: shop.id,
                embeddingText: entry.service.embeddingText,
            },
        });

        if (!service) {
            const translation = await prisma.service_translation.create({
                data: {
                    name_en: entry.service.name_en,
                    name_ar: entry.service.name_ar,
                    description_en: entry.service.description_en,
                    description_ar: entry.service.description_ar,
                },
            });

            service = await prisma.service.create({
                data: {
                    embeddingText: entry.service.embeddingText,
                    phone: entry.shop.phone !== "N/A" ? entry.shop.phone : null,
                    city: entry.shop.city || null,
                    shopId: shop.id,
                    ownerUserId: user.id,
                    translationId: translation.id,
                    tags: {
                        connect: tagIds.map((id) => ({ id })),
                    },
                },
            });
        }

        // 5. Reviews (if any)
        if (entry.reviews && entry.reviews.length) {
            for (const rev of entry.reviews) {
                const exists = await prisma.review.findFirst({
                    where: {
                        authorId: user.id,
                        comment: rev.comment,
                        serviceId: service.id,
                    },
                });

                if (!exists) {
                    await prisma.review.create({
                        data: {
                            authorId: user.id,
                            rating: rev.rating,
                            comment: rev.comment,
                            serviceId: service.id,
                            shopId: shop.id,
                            isVerified: true,
                        },
                    });
                }
            }
        }
    }
}

// ---------- MAIN ----------
async function main() {
    try {
        console.log(`🔎 Looking for XLSX files in ${DATA_DIR}`);
        const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".xlsx"));

        if (files.length === 0) {
            console.log(`⚠️ No XLSX files found in ${DATA_DIR}`);
            return;
        }

        for (const file of files) {
            const filePath = path.join(DATA_DIR, file);
            console.log(`📌 Processing file: ${file}`);
            const jsonData = await processExcel(filePath, file);
            await importData(jsonData);
        }
    } catch (err) {
        console.error("💥 Fatal error in main():", err);
    } finally {
        await prisma.$disconnect();
        console.log("🔚 Prisma disconnected");
    }
}

main();

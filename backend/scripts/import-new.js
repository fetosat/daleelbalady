// scripts/importScrapedData.js
import { PrismaClient } from '../generated/prisma/client.js';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const defaultDesign = await prisma.design.upsert({
  where: { slug: 'default-design' },
  update: {},
  create: {
    name: 'Default Design',
    description: 'A default design for imported items.',
    slug: 'default-design',
    categoryId: 'ss'
  },
});

//read command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide an argument: "places" or "events"');
  process.exit(1);
}

const element = args[0];

// --- CONFIGURATION ---
const SCRAPED_DIR = `./out/${element}`; // Directory containing scraped JSON files
const ERROR_LOG_FILE = 'import-scraped-errors.log';

// --- HELPER FUNCTIONS ---
function logError(message, error = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${error ? `\n${error.stack || error.message}` : ''}\n\n`;
  console.error(`❌ ${message}`);
  if (error) console.error(error);
  fs.appendFile(ERROR_LOG_FILE, logMessage).catch(err => {
    console.error('Failed to write to error log file:', err);
  });
}

function cleanRepeatedText(text) {
  if (!text || text.length < 2) return text;
  const mid = Math.floor(text.length / 2);
  const firstHalf = text.substring(0, mid);
  const secondHalf = text.substring(mid);
  if (secondHalf.startsWith(firstHalf) && firstHalf.length > 2) return firstHalf;
  const third = Math.floor(text.length / 3);
  if (text.length % 3 === 0 && third > 2) {
    const p1 = text.substring(0, third);
    const p2 = text.substring(third, 2 * third);
    const p3 = text.substring(2 * third);
    if (p1 === p2 && p2 === p3) return p1;
  }
  return text;
}

// --- MAIN LOGIC ---
async function main() {
  await fs.writeFile(ERROR_LOG_FILE, '').catch(err => console.warn('Could not clear log file:', err));
  console.log('🚀 Starting scraped data import...');
  console.log(`📝 Errors will be logged to: ${ERROR_LOG_FILE}`);

  const stats = {
    usersCreated: 0,
    usersSkipped: 0,
    servicesCreated: 0,
    servicesSkipped: 0,
    categoriesUpserted: 0,
    subCategoriesCreated: 0,
    designsUpserted: 0,
    errors: 0,
    totalEntries: 0,
  };

  console.log('🎨 Ensuring default design exists...');

  stats.designsUpserted++;
  console.log(`  ✅ Default design is ready.`);

  let allPlaces = [];
  try {
    const files = await fs.readdir(SCRAPED_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    if (jsonFiles.length === 0) {
      console.log(`⚠️ No JSON files found in '${SCRAPED_DIR}'. Exiting.`);
      return;
    }
    console.log(`📂 Found ${jsonFiles.length} JSON files. Reading content...`);
    for (const file of jsonFiles) {
      const filePath = path.join(SCRAPED_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      if (data?.places?.length) {
        for (const place of data.places) {
          allPlaces.push({
            ...place,
            meta: data.meta
          });
        }
      }
    }
    stats.totalEntries = allPlaces.length;
    console.log(`📊 Total places to process: ${stats.totalEntries}`);
    console.log('━'.repeat(50));
  } catch (error) {
    logError('Fatal error reading scraped data directory', error);
    return;
  }

  for (let i = 0; i < allPlaces.length; i++) {
    const place = allPlaces[i];
    const meta = place.meta;
    console.log(`\n[${i + 1}/${stats.totalEntries}] Processing: ${place.name}`);

    try {
      const cleanedTitle = cleanRepeatedText(place.name);

      // --- CATEGORY + SUBCATEGORY ---
      const categoryName = meta?.parentCategoryName || 'Unknown Category';
      const subCategoryName = meta?.subCategoryName || 'General';
      const categorySlug = categoryName.trim().toLowerCase().replace(/\s+/g, '-');
      const subCatSlug = `${categorySlug}-${subCategoryName.trim().toLowerCase().replace(/\s+/g, '-')}`;

      const category = await prisma.category.upsert({
        where: { slug: categorySlug },
        update: { designId: defaultDesign.id },
        create: {
          name: categoryName,
          slug: categorySlug,
          description: categoryName,
          designId: defaultDesign.id,
        },
      });
      stats.categoriesUpserted++;

      const subCategory = await prisma.subCategory.upsert({
        where: { slug: subCatSlug },
        update: {},
        create: {
          name: subCategoryName,
          slug: subCatSlug,
          categoryId: category.id,
        },
      });
      stats.subCategoriesCreated++;

      // --- USER ---
      let userName = cleanedTitle || "Business Owner";
      let userPhone = place.phone || null;

      let user = await prisma.user.findFirst({ where: { name: userName } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: userName,
            phone: userPhone,
            role: 'PROVIDER',
            isVerified: true,
            verifiedAt: new Date(),
          },
        });
        stats.usersCreated++;
        console.log(`  ✅ Created User: ${userName}`);
      } else {
        stats.usersSkipped++;
        console.log(`  ⏭️  User already exists: ${userName}`);
      }

      // --- SERVICE ---
      const existingService = await prisma.service.findFirst({
        where: {
          translation: { is: { name_ar: cleanedTitle } },
          ownerUserId: user.id,
        },
      });

      if (!existingService) {
        const translation = await prisma.service_translation.create({
          data: {
            name_ar: cleanedTitle,
            name_en: cleanedTitle,
            description_ar: place.description || '',
            description_en: place.description || '',
          },
        });

        const service = await prisma.service.create({
          data: {
            ownerUserId: user.id,
            translationId: translation.id,
            embeddingText: `${cleanedTitle} ${place.googleCategory || ''} ${categoryName} ${subCategoryName}`,
            phone: userPhone,
            city: place.address?.split('،')[1]?.trim() || 'Unknown',
            locationLat: place.lat,
            locationLon: place.lng,
            galleryImages: place.img ? JSON.stringify([place.img]) : null,
            designId: defaultDesign.id,
            subCategoryId: subCategory.id,
            category: { connect: [{ id: category.id }] },
          },
        });

        await prisma.shop.create({
          data: {
            id: service.id,
            name: cleanedTitle,
            address: {
              create: {
                text_ar: place.address || '',
                text_en: place.address || '',
              },
            },
            owner: { connect: { id: user.id } },
          },
        });

        stats.servicesCreated++;
        console.log(`  ✅ Created Service: ${cleanedTitle}`);
      } else {
        stats.servicesSkipped++;
        console.log(`  ⏭️  Service already exists for this user.`);
      }
    } catch (error) {
      stats.errors++;
      logError(`Error processing place: ${place.name}`, error);
      continue;
    }
  }

  console.log('\n' + '━'.repeat(50));
  console.log('🎉 Import completed!');
  console.log('\n📊 Final Statistics:');
  console.log(`   Total Places Processed: ${stats.totalEntries}`);
  console.log(`   Users created: ${stats.usersCreated} (Skipped: ${stats.usersSkipped})`);
  console.log(`   Services created: ${stats.servicesCreated} (Skipped: ${stats.servicesSkipped})`);
  console.log(`   Designs upserted: ${stats.designsUpserted}`);
  console.log(`   Categories upserted: ${stats.categoriesUpserted}`);
  console.log(`   SubCategories upserted: ${stats.subCategoriesCreated}`);
  console.log(`   Errors encountered: ${stats.errors}`);
  console.log('━'.repeat(50));

  if (stats.errors > 0) {
    console.log(`⚠️  Completed with ${stats.errors} errors. Check logs in ${ERROR_LOG_FILE}`);
  } else {
    console.log('✅ All entries processed successfully!');
  }
}

main()
  .catch((err) => {
    logError('Critical unhandled error during import process', err);
  })
  .finally(async () => {
    console.log('\n🔌 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('👋 Import script finished.');
  });
console.log(element);

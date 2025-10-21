// scripts/importData.js - Enhanced version with business registration and subscription support
import { PrismaClient } from './generated/prisma/client.js';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Error logging setup
const ERROR_LOG_FILE = 'import-errors.log';
function logError(message, error = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${error ? '\n' + error.stack || error.message : ''}\n\n`;
  
  // Log to console
  console.error(message);
  if (error) console.error(error);
  
  // Append to file
  try {
    fs.appendFileSync(ERROR_LOG_FILE, logMessage);
  } catch (fileError) {
    console.error('Failed to write to error log file:', fileError);
  }
}

// Statistics tracking
let stats = {
  usersCreated: 0,
  usersSkipped: 0,
  shopsCreated: 0,
  shopsSkipped: 0,
  servicesCreated: 0,
  servicesSkipped: 0,
  reviewsCreated: 0,
  subscriptionsCreated: 0,
  businessApplicationsCreated: 0,
  errors: 0
};

// Helper function to extract city from address or service data
function extractCityFromData(entry) {
  // Try to extract city from various sources
  if (entry.shop?.city) return entry.shop.city;
  if (entry.service?.city) return entry.service.city;

  // Common Egyptian cities mentioned in medical data
  const cities = ['القاهرة', 'الإسكندرية', 'الجيزة', 'طنطا', 'دمنهور', 'كفر الشيخ', 'المنصورة', 'الزقازيق', 'بورسعيد', 'الإسماعيلية', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'دمياط', 'الفيوم', 'بني سويف', 'المنيا', 'شبين الكوم'];

  // Check in Arabic description or embedding text
  const textToSearch = `${entry.service?.description_ar || ''} ${entry.service?.embeddingText || ''} ${entry.shop?.address_ar || ''}`.toLowerCase();

  for (const city of cities) {
    if (textToSearch.includes(city)) {
      return city;
    }
  }

  // Default fallback
  return 'مصر';
}

// Helper function to create default provider subscription
async function createProviderSubscription(userId) {
  try {
    // Check if subscription already exists
    const existingSubscription = await prisma.providerSubscription.findUnique({
      where: { providerId: userId }
    });

    if (!existingSubscription) {
      await prisma.providerSubscription.create({
        data: {
          providerId: userId,
          planType: 'BASIC_FREE',
          pricePerYear: 0,
          canTakeBookings: false,
          canListProducts: false,
          searchPriority: 0,
          hasPriorityBadge: false,
          hasPromotionalVideo: false,
          totalDiscount: 0,
          isActive: true,
          autoRenew: false
        }
      });
      stats.subscriptionsCreated++;
      console.log(`  ✅ Created subscription for provider ${userId}`);
    }
  } catch (error) {
    const errorMsg = `Error creating subscription for ${userId}: ${error.message}`;
    logError(`  ❌ ${errorMsg}`, error);
    stats.errors++;
  }
}

// Helper function to create business application for providers
async function createBusinessApplication(userId, entry) {
  try {
    // Check if business application already exists
    const existingApp = await prisma.businessApplication.findFirst({
      where: {
        applicantId: userId,
        businessName: entry.shop.name
      }
    });

    if (!existingApp) {
      const city = extractCityFromData(entry);

      await prisma.businessApplication.create({
        data: {
          applicantId: userId,
          businessName: entry.shop.name,
          businessEmail: entry.user.email || `${entry.user.name.replace(/\s+/g, '').toLowerCase()}@business.com`,
          businessPhone: entry.shop.phone || entry.user.phone || '16676',
          description: entry.service.description_ar || entry.service.description_en || 'خدمات تجارية متخصصة',
          businessAddress: entry.shop.address_ar || entry.shop.address_en || 'محل تجاري',
          businessCity: city,
          businessType: 'PROVIDER',
          status: 'APPROVED', // Auto-approve imported data
          approvedAt: new Date(),
          reviewedBy: 'system-import',
          statusNotes: 'Auto-approved during data import'
        }
      });
      stats.businessApplicationsCreated++;
      console.log(`  ✅ Created business application for ${entry.user.name}`);
    }
  } catch (error) {
    // Ignore duplicate email/phone errors as they're expected in import data
    if (!error.message.includes('Unique constraint')) {
      const errorMsg = `Error creating business application for ${entry.user.name}: ${error.message}`;
      logError(`  ❌ ${errorMsg}`, error);
      stats.errors++;
    }
  }
}

async function main() {
  // Clear previous error log
  try {
    if (fs.existsSync(ERROR_LOG_FILE)) {
      fs.unlinkSync(ERROR_LOG_FILE);
    }
  } catch (err) {
    console.warn('Could not clear previous error log:', err.message);
  }
  
  console.log('🚀 Starting enhanced data import...');
  console.log('━'.repeat(50));
  console.log(`📝 Errors will be logged to: ${ERROR_LOG_FILE}`);

  if (!fs.existsSync('./data.json')) {
    console.error('❌ data.json file not found!');
    return;
  }

  const raw = fs.readFileSync('./data.json', 'utf-8');
  const data = JSON.parse(raw);

  console.log(`📊 Found ${data.entries.length} entries to import`);
  console.log('━'.repeat(50));

// Create designs and categories from data.json
  if (data.categories && data.categories.length > 0) {
    console.log('🎨 Processing categories and designs...');
    // Create a default design if needed
    let defaultDesign = await prisma.design.findFirst({ where: { slug: "default" } });
    if (!defaultDesign) {
      defaultDesign = await prisma.design.create({
        data: {
          name: "Default",
          description: "Default design",
          slug: "default",
          categoryId: "temp" // Will be updated later
        }
      });
      console.log('✅ Default design created');
    }
    
    // Process each category from data.json
    for (const catData of data.categories) {
      console.log(`📋 Processing category: ${catData.name}`);
      
      // Check if category exists
      let existingCategories = await prisma.category.findMany({
        where: { 
          OR: [
            { id: catData.id },
            { name: catData.name }
          ]
        }
      });
      
      let category;
      if (existingCategories.length === 0) {
        // Create category if it doesn't exist
        category = await prisma.category.create({
          data: {
            id: catData.id,
            name: catData.name,
            slug: catData.id.toLowerCase(),
            description: catData.name,
            designId: defaultDesign.id
          }
        });
        console.log(`  ✅ Created category: ${catData.name}`);
        
        // Create design for this category
        let design = await prisma.design.create({
          data: {
            name: catData.name,
            description: `Design for ${catData.name}`,
            slug: catData.id.toLowerCase(),
            categoryId: category.id
          }
        });
        console.log(`  ✅ Created design for: ${catData.name}`);
        
        // Update category to use its own design
        await prisma.category.update({
          where: { id: category.id },
          data: { designId: design.id }
        });
      } else {
        category = existingCategories[0];
        console.log(`  ⏭️ Category already exists: ${catData.name}`);
      }
      
      // Process subcategories
      if (catData.sub_categories && catData.sub_categories.length > 0) {
        for (const subCat of catData.sub_categories) {
          // Compute slug candidates (use id-based slug for uniqueness)
          const idSlug = String(subCat.id).toLowerCase().replace(/\s+/g, '-');
          const nameSlug = String(subCat.name).toLowerCase().replace(/\s+/g, '-');

          // Check if subcategory exists by id, name+category, or slug globally
          const existingSubCats = await prisma.subCategory.findMany({
            where: {
              OR: [
                { id: subCat.id },
                { name: subCat.name, categoryId: category.id },
                { slug: idSlug },
                { slug: nameSlug }
              ]
            }
          });

          if (existingSubCats.length === 0) {
            await prisma.subCategory.create({
              data: {
                id: subCat.id,
                name: subCat.name,
                slug: idSlug,
                categoryId: category.id
              }
            });
            console.log(`    ✅ Created subcategory: ${subCat.name}`);
          } else {
            console.log(`    ⏭️ Subcategory already exists: ${subCat.name}`);
          }
        }
      }
    }
  } else {
    console.log('⚠️ No categories found in data.json, using default values...');
    
    // Create or get default design
    let design = await prisma.design.findFirst({ where: { slug: "default" } });
    if (!design) {
      design = await prisma.design.create({
        data: {
          name: "Default",
          description: "Default design",
          slug: "default",
          categoryId: "temp"
        }
      });
    }
    
    // Create default category
    let category = await prisma.category.findFirst({ where: { name: "Default" } });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "Default",
          slug: "default",
          description: "Default category",
          designId: design.id,
          subCategories: {
            create: [{ name: "General", slug: "general" }]
          }
        },
        include: { subCategories: true }
      });
      
      await prisma.design.update({
        where: { id: design.id },
        data: { categoryId: category.id }
      });
    } else {
      category = await prisma.category.findFirst({
        where: { name: "Default" },
        include: { subCategories: true }
      });
    }
  }
  console.log('\n🔄 Processing entries...');

  for (let i = 0; i < data.entries.length; i++) {
    const entry = data.entries[i];

    try {
      console.log(`\n[${i + 1}/${data.entries.length}] Processing: ${entry.user.name}`);

      // 1. User
      let user = await prisma.user.findFirst({
        where: {
          name: entry.user.name
        }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: entry.user.name,
            phone: entry.user.phone !== "N/A" ? entry.user.phone : null,
            role: entry.user.role || "PROVIDER",
            isVerified: true, // Mark imported users as verified
            verifiedAt: new Date()
          },
        });
        stats.usersCreated++;
        console.log(`  ✅ Created user: ${entry.user.name}`);

        // Create business application and subscription for providers
        if ((entry.user.role || "PROVIDER") === "PROVIDER") {
          await createBusinessApplication(user.id, entry);
          await createProviderSubscription(user.id);
        }
      } else {
        stats.usersSkipped++;
        console.log(`  ⏭️  User already exists: ${entry.user.name}`);
      }

      // 2. Shop
      let shop = await prisma.shop.findFirst({
        where: {
          name: entry.shop.name,
          ownerId: user.id,
        },
      });

      if (!shop) {
        // Create translation row
        const translation = await prisma.shop_translation.create({
          data: {
            text_en: entry.shop.address_en || "Medical Clinic",
            text_ar: entry.shop.address_ar || "عيادة طبية",
          },
        });

        const city = extractCityFromData(entry);

        // Get a design for the shop - try to match service category or use default
        let shopDesignId = null;
        if (entry.service?.category_id) {
          const categoryWithDesign = await prisma.category.findFirst({
            where: { id: entry.service.category_id },
            select: { designId: true }
          });
          if (categoryWithDesign) {
            shopDesignId = categoryWithDesign.designId;
          }
        }
        
        // Fallback to first available design
        if (!shopDesignId) {
          const firstDesign = await prisma.design.findFirst({ select: { id: true } });
          shopDesignId = firstDesign?.id;
        }

        shop = await prisma.shop.create({
          data: {
            name: entry.shop.name,
            phone: entry.shop.phone !== "N/A" ? entry.shop.phone : null,
            email: entry.shop.email || null,
            city: city,
            adressId: translation.id,
            ownerId: user.id,
            designId: shopDesignId,
            description: entry.service?.description_ar || entry.service?.description_en || null
          }
        });
        stats.shopsCreated++;
        console.log(`  ✅ Created shop: ${entry.shop.name}`);
      } else {
        stats.shopsSkipped++;
        console.log(`  ⏭️  Shop already exists: ${entry.shop.name}`);
      }

      // 3. Tags (check both shop and service tags)
      let tagIds = [];
      const allTags = [
        ...(entry.shop.tags || []),
        ...(entry.service.tags || [])
      ];

      if (allTags.length) {
        for (const t of allTags) {
          if (t && t.trim()) {
            let tag = await prisma.tags.findFirst({ where: { name: t.trim() } });
            if (!tag) {
              tag = await prisma.tags.create({ data: { name: t.trim() } });
            }
            if (!tagIds.includes(tag.id)) {
              tagIds.push(tag.id);
            }
          }
        }
        console.log(`  🏷️  Processed ${tagIds.length} tags`);
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
            name_en: entry.service.name_en || entry.user.name,
            name_ar: entry.service.name_ar || entry.user.name,
            description_en: entry.service.description_en || 'Professional medical services',
            description_ar: entry.service.description_ar || entry.service.description_en || 'خدمات طبية متخصصة',
          },
        });

        const city = extractCityFromData(entry);
        // Find matching category and subcategory from data
        let matchingCategory = null;
        let subcategoryId = null;
        
        // Try to find the matching category and subcategory
        if (entry.service.category_id) {
          const categoryFromDb = await prisma.category.findFirst({
            where: { id: entry.service.category_id },
            include: { subCategories: true }
          });
          
          if (categoryFromDb) {
            matchingCategory = categoryFromDb;
            
            if (entry.service.sub_category_id) {
              const subcategory = await prisma.subCategory.findFirst({
                where: { id: entry.service.sub_category_id }
              });
              
              if (subcategory) {
                subcategoryId = subcategory.id;
              }
            }
          }
        }
        
        // If no matching category found, use the first available one
        if (!matchingCategory) {
          const categories = await prisma.category.findMany({
            include: { subCategories: true },
            take: 1
          });
          
          if (categories.length > 0) {
            matchingCategory = categories[0];
            subcategoryId = matchingCategory.subCategories[0]?.id;
          }
        }

        // Generate embeddingText if missing
        const embeddingText = entry.service.embeddingText || 
          `${entry.service.name_en || entry.service.name_ar || entry.user.name} ${entry.service.description_en || entry.service.description_ar || ''} ${(entry.service.tags || []).join(' ')}`;

        service = await prisma.service.create({
          data: {
            embeddingText: embeddingText,
            phone: entry.shop.phone !== "N/A" ? entry.shop.phone : null,
            city: city,
            shopId: shop.id,
            ownerUserId: user.id,
            translationId: translation.id,
            category: matchingCategory ? { connect: [{ id: matchingCategory.id }] } : undefined,
            subCategory: subcategoryId ? { connect: [{ id: subcategoryId }] } : undefined,
            tags: tagIds.length ? {
              connect: tagIds.map((id) => ({ id })),
            } : undefined,
            designId: matchingCategory?.designId || (await prisma.design.findFirst())?.id
          }
        });
        stats.servicesCreated++;
        console.log(`  ✅ Created service: ${entry.service.name_en || entry.service.name_ar}`);
      } else {
        stats.servicesSkipped++;
        console.log(`  ⏭️  Service already exists`);
      }

      // 5. Reviews (if any)
      if (entry.reviews && entry.reviews.length) {
        let reviewsCreatedForEntry = 0;
        for (const rev of entry.reviews) {
          if (rev.comment && rev.rating) {
            const exists = await prisma.review.findFirst({
              where: {
                comment: rev.comment,
                serviceId: service.id,
              },
            });

            if (!exists) {
              // Create anonymous reviewer for reviews
              let reviewer = await prisma.user.findFirst({
                where: { name: rev.author || 'مريض سابق' }
              });

              if (!reviewer) {
                reviewer = await prisma.user.create({
                  data: {
                    name: rev.author || 'مريض سابق',
                    role: 'CUSTOMER'
                  }
                });
              }

              await prisma.review.create({
                data: {
                  authorId: reviewer.id,
                  rating: parseInt(rev.rating) || 5,
                  comment: rev.comment,
                  serviceId: service.id,
                  shopId: shop.id,
                  isVerified: true,
                },
              });
              reviewsCreatedForEntry++;
              stats.reviewsCreated++;
            }
          }
        }
        if (reviewsCreatedForEntry > 0) {
          console.log(`  ✅ Created ${reviewsCreatedForEntry} reviews`);
        }
      }

    } catch (error) {
      const errorMsg = `Error processing entry ${i + 1} (${entry.user.name}): ${error.message}`;
      logError(`  ❌ ${errorMsg}`, error);
      stats.errors++;
      // Continue with next entry instead of stopping
      continue;
    }
  }

  console.log('\n' + '━'.repeat(50));
  console.log('🎉 Import completed!');
  console.log('\n📊 Final Statistics:');
  console.log(`   Users created: ${stats.usersCreated}`);
  console.log(`   Users skipped: ${stats.usersSkipped}`);
  console.log(`   Shops created: ${stats.shopsCreated}`);
  console.log(`   Shops skipped: ${stats.shopsSkipped}`);
  console.log(`   Services created: ${stats.servicesCreated}`);
  console.log(`   Services skipped: ${stats.servicesSkipped}`);
  console.log(`   Reviews created: ${stats.reviewsCreated}`);
  console.log(`   Subscriptions created: ${stats.subscriptionsCreated}`);
  console.log(`   Business applications created: ${stats.businessApplicationsCreated}`);
  console.log(`   Errors encountered: ${stats.errors}`);
  console.log('━'.repeat(50));

  if (stats.errors === 0) {
    console.log('✅ All entries processed successfully!');
  } else {
    console.log(`⚠️  Completed with ${stats.errors} errors. Check logs above and in ${ERROR_LOG_FILE}`);
  }
}

main()
  .catch((err) => {
    const errorMsg = `Critical error during import: ${err.message}`;
    logError(`❌ ${errorMsg}`, err);
    console.log(`\n📝 Check ${ERROR_LOG_FILE} for detailed error information.`);
  })
  .finally(async () => {
    console.log('\n🔌 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('👋 Import script finished.');
  });

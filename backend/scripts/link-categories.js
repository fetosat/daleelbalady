const { PrismaClient } = require("./../generated/prisma/client.js");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function linkCategories() {
  try {
    console.log("🔄 Starting category import...");

    // Read the JSON file
    const jsonPath = path.join(__dirname, "services_categories.json");
    const jsonData = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(jsonData);
    console.log(`📋 Found ${data.length} services to process`);

    let linkedCount = 0;

    for (const serviceData of data.services) {
      console.log(`\n🔗 Processing service ID: ${serviceData.id}`);

      const service = await prisma.service.findUnique({
        where: { id: serviceData.id },
        include: { translation: true, shop: true, subCategory: true },
      });

      if (!service) {
        console.log(`  ❌ Service with ID ${serviceData.id} not found, skipping...`);
        continue;
      }

      const subCategory = await prisma.subCategory.findUnique({
        where: { id: serviceData.subCategoryId },
        include: { category: true },
      });

      if (!subCategory) {
        console.log(
          `  ❌ SubCategory with ID ${serviceData.subCategoryId} not found, skipping...`
        );
        continue;
      }

      // Handle based on type
      if (serviceData.type === "person") {
        // update service translation description
        await prisma.service.update({
          where: { id: serviceData.id },
          data: {
            subCategory: { connect: { id: serviceData.subCategoryId } },
            category: { connect: { id: subCategory.categoryId } },
            translation: {
              update: {
                name_ar: serviceData.text,
                name_en: serviceData.text,
                description_ar: serviceData.text,
                description_en: serviceData.text, // you might later transtone this
              },
            },
          },
        });
      } else if (serviceData.type === "service") {
        // update service translation name
        await prisma.service.update({
          where: { id: serviceData.id },
          data: {
            subCategory: { connect: { id: serviceData.subCategoryId } },
            category: { connect: { id: subCategory.categoryId } },
            translation: {
              update: {
                name_ar: serviceData.text,
                name_en: serviceData.text,
                description_ar: serviceData.text,
                description_en: serviceData.text, // you might later transtone this
              },
            },
          },
        });
      } else if (serviceData.type === "shop" || serviceData.type === "place") {
        // Create a Shop linked to the same user (if not already exists)
        const ownerId = service.ownerUserId;
        const shop = await prisma.shop.upsert({
          where: { id: serviceData.id }, // reuse same id if exists
          update: { name: serviceData.text },
          create: {
            id: serviceData.id,
            name: serviceData.text,
            ownerId,
          },
        });

        await prisma.service.update({
          where: { id: serviceData.id },
          data: {
            subCategory: { connect: { id: serviceData.subCategoryId } },
            category: { connect: { id: subCategory.categoryId } },
            shop: { connect: { id: shop.id } },
            translation: {
              update: {
                name_ar: serviceData.text,
                name_en: serviceData.text,
                description_ar: serviceData.text,
                description_en: serviceData.text, // you might later transtone this
              },
            },
          },
        });
      }

      console.log(
        `  ✅ Linked type=${serviceData.type} → Category ID: ${subCategory.categoryId} (${subCategory.category.name}), SubCategory ID: ${serviceData.subCategoryId} (${subCategory.name})`
      );
      linkedCount++;
    }

    console.log("\n🎉 Linking process finished! Total services linked:", linkedCount);
  } catch (error) {
    console.error("❌ Error importing categories:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

linkCategories().then(() => {
  console.log("🎉 Import process finished!");
  process.exit(0);
});
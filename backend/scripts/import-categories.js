const { PrismaClient } = require('./../generated/prisma/client.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importCategories() {
  try {
    console.log('🔄 Starting category import...');

    // Read the JSON file
    const jsonPath = path.join(__dirname, 'categories.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(jsonData);

    // First, we need a default design for categories
    // Check if we have any design or create a default one
    let defaultDesign = await prisma.design.findFirst();
    if (!defaultDesign) {
      console.log('📝 Creating default design...');
      defaultDesign = await prisma.design.create({
        data: {
          categoryId: "medical",
          description: 'Default design for categories',
          slug: 'medical',
          name: 'Default Category Design',
        }
      });
    }

    console.log(`📋 Found ${data.categories.length} categories to import`);

    let importedCategoriesCount = 0;
    let importedSubCategoriesCount = 0;

    for (const categoryData of data.categories) {
      console.log(`\n📁 Processing category: ${categoryData.name}`);

      // Check if category already exists
      const existingCategory = await prisma.category.findUnique({
        where: { slug: categoryData.slug }
      });

      let category;
      if (existingCategory) {
        console.log(`  ⚠️  Category already exists, updating...`);
        category = await prisma.category.update({
          where: { slug: categoryData.slug },
          data: {
            name: categoryData.name,
            description: categoryData.description,
            designId: defaultDesign.id
          }
        });
      } else {
        console.log(`  ✨ Creating new category...`);
        category = await prisma.category.create({
          data: {
            name: categoryData.name,
            id: categoryData.id,
            slug: categoryData.slug,
            description: categoryData.description,
            designId: defaultDesign.id
          }
        });
        importedCategoriesCount++;
      }

      // Process subcategories
      if (categoryData.subCategories && categoryData.subCategories.length > 0) {
        console.log(`  📋 Processing ${categoryData.subCategories.length} subcategories...`);

        for (const subCategoryData of categoryData.subCategories) {
          const existingSubCategory = await prisma.subCategory.findUnique({
            where: { slug: subCategoryData.slug }
          });

          if (existingSubCategory) {
            console.log(`    ⚠️  Subcategory "${subCategoryData.name}" already exists, updating...`);
            await prisma.subCategory.update({
              where: { slug: subCategoryData.slug },
              data: {
                name: subCategoryData.name,
                categoryId: category.id,
                id: subCategoryData.id
              }
            });
          } else {
            console.log(`    ✨ Creating subcategory "${subCategoryData.name}"`);
            await prisma.subCategory.create({
              data: {
                name: subCategoryData.name,
                slug: subCategoryData.slug,
                categoryId: category.id,
                id: subCategoryData.id
              }
            });
            importedSubCategoriesCount++;
          }
        }
      }
    }

    console.log('\n✅ Import completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - New categories imported: ${importedCategoriesCount}`);
    console.log(`   - New subcategories imported: ${importedSubCategoriesCount}`);

  } catch (error) {
    console.error('❌ Error importing categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importCategories()
    .then(() => {
      console.log('🎉 Import process finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import process failed:', error);
      process.exit(1);
    });
}

module.exports = { importCategories };

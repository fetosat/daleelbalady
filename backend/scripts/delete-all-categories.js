const { PrismaClient } = require('../generated/prisma/client.js');

const prisma = new PrismaClient();

async function deleteAllCategories({ dryRun = false } = {}) {
  try {
    console.log('🗑️ Deleting all categories and subcategories...');
    console.log(`Dry run: ${dryRun ? 'YES (no changes will be written)' : 'NO (data will be deleted)'}`);

    // Get counts before deletion
    const categoriesCount = await prisma.category.count();
    const subCategoriesCount = await prisma.subCategory.count();

    console.log(`📊 Current state:`);
    console.log(`   - Categories: ${categoriesCount}`);
    console.log(`   - SubCategories: ${subCategoriesCount}`);

    if (categoriesCount === 0 && subCategoriesCount === 0) {
      console.log('✅ No categories or subcategories to delete.');
      return { deleted: { categories: 0, subCategories: 0 } };
    }

    if (dryRun) {
      console.log('🔍 Dry run: Would delete all categories and subcategories.');
      return {
        wouldDelete: {
          categories: categoriesCount,
          subCategories: subCategoriesCount
        }
      };
    }

    // Check for any remaining relations that might cause issues
    console.log('🔍 Checking for any remaining relations...');

    // Check if any services still have category (M2M) or subCategory (FK) relations
    const servicesWithRelationsCount = await prisma.service.count({
      where: {
        OR: [
          { category: { some: {} } },        // Correct for M2M Category relations
          { subCategoryId: { not: null } }   // Correct for 1-M SubCategory foreign key
        ]
      }
    });

    if (servicesWithRelationsCount > 0) {
      console.log('⚠️  WARNING: Found services that still have category/subcategory relations!');
      console.log(`   Services with relations: ${servicesWithRelationsCount}`);
      console.log('   Please run the cleanup script first (e.g., `node cleanup-category-relations.js`) to disconnect them.');
      return { error: 'Relations still exist, cleanup required' };
    }

    // The check for `subCategoriesWithService` is removed because `SubCategory.serviceId` no longer exists
    // and `Service.subCategoryId` is handled by the `servicesWithRelationsCount` check.

    console.log('✅ No blocking relations found, proceeding with deletion...');

    // Delete in correct order: subcategories first (they depend on category), then categories
    console.log('🗑️ Deleting subcategories...');
    const deletedSubCategories = await prisma.subCategory.deleteMany({});
    console.log(`   Deleted ${deletedSubCategories.count} subcategories`);

    console.log('🗑️ Deleting categories...');
    const deletedCategories = await prisma.category.deleteMany({});
    console.log(`   Deleted ${deletedCategories.count} categories`);

    console.log('✅ Deletion completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories deleted: ${deletedCategories.count}`);
    console.log(`   - SubCategories deleted: ${deletedSubCategories.count}`);

    return {
      deleted: {
        categories: deletedCategories.count,
        subCategories: deletedSubCategories.count
      }
    };

  } catch (error) {
    console.error('❌ Error deleting categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  try {
    const result = await deleteAllCategories({ dryRun });

    if (result.error) {
      console.error('💥 Deletion failed:', result.error);
      process.exit(1);
    }

    console.log('🎉 Deletion process finished!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Deletion process failed:', error);
    process.exit(1);
  }
}

// Run the deletion if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { deleteAllCategories };
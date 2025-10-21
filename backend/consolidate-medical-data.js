import { PrismaClient } from './generated/prisma/index.js';
const prisma = new PrismaClient();

/**
 * This script consolidates the duplicate "Medical Services" category into "الدليل الطبي",
 * and then assigns the correct medical design to all related services, shops, and products.
 */
async function fixMedicalData() {
  console.log('🚀 Starting medical data consolidation script...');

  try {
    await prisma.$transaction(async (tx) => {
      // --- Step 1: Find the necessary records ---
      console.log('\n🔍 Step 1: Locating categories and design...');

      const categoryToDelete = await tx.category.findUnique({
        where: { slug: 'medical-services' },
        include: { Service: { select: { id: true } } },
      });

      const categoryToKeep = await tx.category.findUnique({
        where: { slug: 'الدليل-الطبي' },
      });

      const medicalDesign = await tx.design.findUnique({
        where: { slug: 'medical' },
      });

      if (!categoryToKeep) {
        throw new Error('❌ Critical Error: The primary medical category \"الدليل-الطبي\" was not found.');
      }
      if (!medicalDesign) {
        throw new Error('❌ Critical Error: The design with slug \"medical\" was not found.');
      }

      console.log(`  - Found category to keep: \"${categoryToKeep.name}\" (ID: ${categoryToKeep.id})`);
      if (categoryToDelete) {
        console.log(`  - Found category to delete: \"${categoryToDelete.name}\" (ID: ${categoryToDelete.id})`);
      } else {
        console.log('  - \"Medical Services\" category not found, it might have been deleted already. Skipping deletion steps.');
      }
      console.log(`  - Found medical design: \"${medicalDesign.name}\" (ID: ${medicalDesign.id})`);

      // --- Step 2: Consolidate and delete the duplicate category ---
      if (categoryToDelete) {
        // 2a. Move any subcategories
        console.log('\n🔄 Step 2a: Checking for and moving subcategories...');
        const subCategoriesToMove = await tx.subCategory.findMany({
            where: { categoryId: categoryToDelete.id }
        });

        if (subCategoriesToMove.length > 0) {
            await tx.subCategory.updateMany({
                where: { categoryId: categoryToDelete.id },
                data: { categoryId: categoryToKeep.id },
            });
            console.log(`  - Successfully moved ${subCategoriesToMove.length} subcategories.`);
        } else {
            console.log('  - No subcategories to move.');
        }

        // 2b. Update the design link
        console.log('\n🔗 Step 2b: Updating design category link...');
        await tx.design.updateMany({
            where: { categoryId: categoryToDelete.id },
            data: { categoryId: categoryToKeep.id },
        });
        console.log('  - Design link updated successfully.');

        // 2c. Re-associate services
        console.log(`\n🔄 Step 2c: Re-associating services from \"${categoryToDelete.name}\" to \"${categoryToKeep.name}\"...`);
        const serviceIdsToUpdate = (await tx.service.findMany({
            where: { category: { some: { id: categoryToDelete.id } } },
            select: { id: true }
        })).map(s => s.id);

        if (serviceIdsToUpdate.length > 0) {
          for (const serviceId of serviceIdsToUpdate) {
             await tx.service.update({
                where: { id: serviceId },
                data: {
                    category: {
                        disconnect: { id: categoryToDelete.id },
                        connect: { id: categoryToKeep.id }
                    }
                }
             });
          }
          console.log(`  - Successfully re-associated ${serviceIdsToUpdate.length} services.`);
        } else {
          console.log('  - No services were associated with the duplicate category.');
        }

        // 2d. Delete the now-empty category
        console.log(`\n🗑️ Step 2d: Deleting the duplicate category \"${categoryToDelete.name}\"...`);
        await tx.category.delete({
          where: { id: categoryToDelete.id },
        });
        console.log('  - Category deleted successfully.');
      }

      // --- Step 3: Assign the medical design to all relevant data ---
      console.log('\n🎨 Step 3: Assigning medical design to un-assigned services, shops, and products...');

      const medicalKeywords = [
        'medical', 'doctor', 'clinic', 'hospital', 'pharmacy', 'medicine', 'drug', 'health', 'dentist', 'dental', 'pediatrics',
        'طبي', 'طبيب', 'دكتور', 'مستشفى', 'عيادة', 'صيدلية', 'دواء', 'علاج', 'صحة', 'أسنان', 'أطفال'
      ];

      const searchConditions = (fields) => (
        medicalKeywords.flatMap(keyword =>
          fields.map(field => ({ [field]: { contains: keyword } }))
        )
      );

      const servicesUpdated = await tx.service.updateMany({
        where: {
            designId: null,
            OR: searchConditions(['embeddingText'])
        },
        data: { designId: medicalDesign.id },
      });
      console.log(`  - Updated ${servicesUpdated.count} services.`);

      const shopsUpdated = await tx.shop.updateMany({
        where: {
            designId: null,
            OR: searchConditions(['name', 'description'])
        },
        data: { designId: medicalDesign.id },
      });
      console.log(`  - Updated ${shopsUpdated.count} shops.`);

      const productsUpdated = await tx.product.updateMany({
        where: {
            designId: null,
            OR: searchConditions(['name', 'description', 'embeddingText'])
        },
        data: { designId: medicalDesign.id },
      });
      console.log(`  - Updated ${productsUpdated.count} products.`);

      console.log('\n🎉 All medical data has been consolidated and cleaned up successfully!');
    });
  } catch (error) {
    console.error('\n❌ An error occurred during the script execution:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixMedicalData();


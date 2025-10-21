import { PrismaClient } from './generated/prisma/index.js';
const prisma = new PrismaClient();

/**
 * Remove the duplicate Arabic medical design and reassign all
 * services using it to the main medical design
 */
async function removeDuplicateArabicDesign() {
  console.log('🔧 Removing duplicate Arabic medical design...');

  try {
    await prisma.$transaction(async (tx) => {
      // Find both designs
      const medicalDesign = await tx.design.findUnique({
        where: { slug: 'medical' }
      });

      const arabicDesign = await tx.design.findUnique({
        where: { slug: 'medical-professional-ar' }
      });

      if (!medicalDesign) {
        throw new Error('Main medical design not found!');
      }

      if (!arabicDesign) {
        console.log('ℹ️  Arabic medical design not found. Nothing to do.');
        return;
      }

      console.log(`✅ Found main design: ${medicalDesign.name} (${medicalDesign.slug})`);
      console.log(`✅ Found Arabic design: ${arabicDesign.name} (${arabicDesign.slug})`);

      // Update all services using the Arabic design
      const servicesUpdated = await tx.service.updateMany({
        where: { designId: arabicDesign.id },
        data: { designId: medicalDesign.id }
      });
      console.log(`\n✅ Updated ${servicesUpdated.count} services to use main design`);

      // Update all shops using the Arabic design
      const shopsUpdated = await tx.shop.updateMany({
        where: { designId: arabicDesign.id },
        data: { designId: medicalDesign.id }
      });
      console.log(`✅ Updated ${shopsUpdated.count} shops to use main design`);

      // Update all products using the Arabic design
      const productsUpdated = await tx.product.updateMany({
        where: { designId: arabicDesign.id },
        data: { designId: medicalDesign.id }
      });
      console.log(`✅ Updated ${productsUpdated.count} products to use main design`);

      // Update any categories using the Arabic design
      const categoriesUpdated = await tx.category.updateMany({
        where: { designId: arabicDesign.id },
        data: { designId: medicalDesign.id }
      });
      console.log(`✅ Updated ${categoriesUpdated.count} categories to use main design`);

      // Delete the duplicate Arabic design
      await tx.design.delete({
        where: { id: arabicDesign.id }
      });
      console.log(`\n🗑️  Deleted duplicate Arabic design`);

      console.log('\n✨ Done! All data now uses the main medical design.');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicateArabicDesign();


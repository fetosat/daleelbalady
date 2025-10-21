import { PrismaClient } from './generated/prisma/index.js';
const prisma = new PrismaClient();

/**
 * Script to assign the medical design to existing medical-related data
 * This script finds medical-related services, shops, and products
 * and assigns them the medical design for proper frontend rendering
 */

async function assignMedicalDesign() {
  try {
    console.log('🔍 Step 1: Finding medical design...\n');
    
    // Find the medical design
    const medicalDesign = await prisma.design.findFirst({
      where: { slug: 'medical' }
    });

    if (!medicalDesign) {
      console.error('❌ Error: Medical design not found!');
      console.log('Please create a medical design first with slug="medical"');
      process.exit(1);
    }

    console.log(`✅ Found medical design: ${medicalDesign.name} (ID: ${medicalDesign.id})\n`);

    // Medical-related keywords (English and Arabic)
    const medicalKeywords = {
      english: ['medical', 'doctor', 'clinic', 'hospital', 'pharmacy', 'medicine', 'drug', 'health', 'dentist', 'dental'],
      arabic: ['طبي', 'طبيب', 'دكتور', 'مستشفى', 'عيادة', 'صيدلية', 'دواء', 'علاج', 'صحة', 'أسنان']
    };

    console.log('🔍 Step 2: Finding medical-related services...\n');
    
    // Find services without design that contain medical keywords
    const servicesToUpdate = await prisma.service.findMany({
      where: {
        designId: null,
        OR: [
          ...medicalKeywords.english.map(keyword => ({
            embeddingText: { contains: keyword, mode: 'insensitive' }
          })),
          ...medicalKeywords.arabic.map(keyword => ({
            embeddingText: { contains: keyword }
          }))
        ]
      },
      select: {
        id: true,
        embeddingText: true
      }
    });

    console.log(`Found ${servicesToUpdate.length} services to update:`);
    servicesToUpdate.slice(0, 5).forEach(service => {
      console.log(`  - ${service.id}: ${service.embeddingText.substring(0, 100)}...`);
    });
    if (servicesToUpdate.length > 5) {
      console.log(`  ... and ${servicesToUpdate.length - 5} more`);
    }

    console.log('\n🔍 Step 3: Finding medical-related shops...\n');
    
    // Find shops without design that contain medical keywords
    const shopsToUpdate = await prisma.shop.findMany({
      where: {
        designId: null,
        OR: [
          ...medicalKeywords.english.map(keyword => ({
            name: { contains: keyword, mode: 'insensitive' }
          })),
          ...medicalKeywords.arabic.map(keyword => ({
            name: { contains: keyword }
          })),
          ...medicalKeywords.english.map(keyword => ({
            description: { contains: keyword, mode: 'insensitive' }
          })),
          ...medicalKeywords.arabic.map(keyword => ({
            description: { contains: keyword }
          }))
        ]
      },
      select: {
        id: true,
        name: true
      }
    });

    console.log(`Found ${shopsToUpdate.length} shops to update:`);
    shopsToUpdate.slice(0, 5).forEach(shop => {
      console.log(`  - ${shop.id}: ${shop.name}`);
    });
    if (shopsToUpdate.length > 5) {
      console.log(`  ... and ${shopsToUpdate.length - 5} more`);
    }

    console.log('\n🔍 Step 4: Finding medical-related products...\n');
    
    // Find products without design that contain medical keywords
    const productsToUpdate = await prisma.product.findMany({
      where: {
        designId: null,
        OR: [
          ...medicalKeywords.english.map(keyword => ({
            name: { contains: keyword, mode: 'insensitive' }
          })),
          ...medicalKeywords.arabic.map(keyword => ({
            name: { contains: keyword }
          })),
          ...medicalKeywords.english.map(keyword => ({
            description: { contains: keyword, mode: 'insensitive' }
          })),
          ...medicalKeywords.arabic.map(keyword => ({
            description: { contains: keyword }
          })),
          ...medicalKeywords.english.map(keyword => ({
            embeddingText: { contains: keyword, mode: 'insensitive' }
          })),
          ...medicalKeywords.arabic.map(keyword => ({
            embeddingText: { contains: keyword }
          }))
        ]
      },
      select: {
        id: true,
        name: true
      }
    });

    console.log(`Found ${productsToUpdate.length} products to update:`);
    productsToUpdate.slice(0, 5).forEach(product => {
      console.log(`  - ${product.id}: ${product.name}`);
    });
    if (productsToUpdate.length > 5) {
      console.log(`  ... and ${productsToUpdate.length - 5} more`);
    }

    console.log('\n📝 Step 5: Updating records...\n');

    // Update services
    if (servicesToUpdate.length > 0) {
      const serviceUpdate = await prisma.service.updateMany({
        where: {
          id: { in: servicesToUpdate.map(s => s.id) }
        },
        data: {
          designId: medicalDesign.id
        }
      });
      console.log(`✅ Updated ${serviceUpdate.count} services`);
    } else {
      console.log('ℹ️  No services to update');
    }

    // Update shops
    if (shopsToUpdate.length > 0) {
      const shopUpdate = await prisma.shop.updateMany({
        where: {
          id: { in: shopsToUpdate.map(s => s.id) }
        },
        data: {
          designId: medicalDesign.id
        }
      });
      console.log(`✅ Updated ${shopUpdate.count} shops`);
    } else {
      console.log('ℹ️  No shops to update');
    }

    // Update products
    if (productsToUpdate.length > 0) {
      const productUpdate = await prisma.product.updateMany({
        where: {
          id: { in: productsToUpdate.map(p => p.id) }
        },
        data: {
          designId: medicalDesign.id
        }
      });
      console.log(`✅ Updated ${productUpdate.count} products`);
    } else {
      console.log('ℹ️  No products to update');
    }

    console.log('\n🎉 Done! Medical design has been assigned to all relevant data.\n');
    
    // Summary
    const totalUpdated = servicesToUpdate.length + shopsToUpdate.length + productsToUpdate.length;
    console.log('📊 Summary:');
    console.log(`  - Services: ${servicesToUpdate.length}`);
    console.log(`  - Shops: ${shopsToUpdate.length}`);
    console.log(`  - Products: ${productsToUpdate.length}`);
    console.log(`  - Total: ${totalUpdated} records updated\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
assignMedicalDesign();


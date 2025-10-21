/**
 * Diagnose Shop Connection Issues
 * 
 * This script helps understand why shops aren't getting connected to designs
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function diagnoseShops() {
  console.log('🔍 Diagnosing shop connection issues...\n');
  
  try {
    // Check total shops
    const totalShops = await prisma.shop.count({
      where: { deletedAt: null }
    });
    console.log(`Total active shops: ${totalShops}`);

    // Check shops without design
    const shopsWithoutDesign = await prisma.shop.count({
      where: { designId: null, deletedAt: null }
    });
    console.log(`Shops without design: ${shopsWithoutDesign}\n`);

    // Sample a few shops to understand their structure
    console.log('📋 Sampling 5 shops:\n');
    const sampleShops = await prisma.shop.findMany({
      where: { designId: null, deletedAt: null },
      take: 5,
      include: {
        owner: {
          select: { id: true, name: true }
        },
        services: {
          take: 3,
          include: {
            category: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    sampleShops.forEach((shop, index) => {
      console.log(`${index + 1}. Shop: ${shop.name}`);
      console.log(`   Owner: ${shop.owner?.name || 'N/A'}`);
      console.log(`   Services: ${shop.services?.length || 0}`);
      if (shop.services && shop.services.length > 0) {
        shop.services.forEach((service, si) => {
          console.log(`     Service ${si + 1}: ${service.translation?.name_en || 'N/A'}`);
          console.log(`       Categories: ${service.category?.length || 0}`);
          if (service.category && service.category.length > 0) {
            service.category.forEach(cat => {
              console.log(`         - ${cat.name}`);
            });
          }
        });
      }
      console.log('');
    });

    // Check shops WITH services
    console.log('📊 Statistics:\n');
    const shopsWithServices = await prisma.shop.count({
      where: {
        designId: null,
        deletedAt: null,
        services: {
          some: {}
        }
      }
    });
    console.log(`Shops with at least one service: ${shopsWithServices}`);

    // Check if owner has services instead
    console.log('\n🔍 Checking if services are linked to users instead of shops...\n');
    const servicesWithOwners = await prisma.service.count({
      where: {
        ownerUserId: { not: null },
        shopId: null,
        deletedAt: null
      }
    });
    console.log(`Services linked directly to users (not shops): ${servicesWithOwners}`);

    const servicesInShops = await prisma.service.count({
      where: {
        shopId: { not: null },
        deletedAt: null
      }
    });
    console.log(`Services linked to shops: ${servicesInShops}`);

    // Check products
    console.log('\n📦 Checking products:\n');
    const totalProducts = await prisma.product.count({
      where: { deletedAt: null }
    });
    console.log(`Total active products: ${totalProducts}`);

    const productsWithShops = await prisma.product.count({
      where: {
        shopId: { not: null },
        deletedAt: null
      }
    });
    console.log(`Products linked to shops: ${productsWithShops}`);

    const productsWithoutDesign = await prisma.product.count({
      where: {
        designId: null,
        deletedAt: null
      }
    });
    console.log(`Products without design: ${productsWithoutDesign}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  diagnoseShops()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { diagnoseShops };


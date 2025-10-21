/**
 * Connect Entities to Designs Script
 * 
 * This script connects all existing entities to their appropriate designs:
 * - Services → Design (based on service's category)
 * - Shops → Design (based on shop owner's primary service category)
 * - Products → Design (based on shop's design or product category)
 * - Users → Design (based on user's primary service category for providers)
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function connectEntitiesToDesigns() {
  console.log('🔗 Starting entity-design connection process...\n');
  
  let stats = {
    servicesConnected: 0,
    shopsConnected: 0,
    productsConnected: 0,
    usersConnected: 0,
    servicesSkipped: 0,
    shopsSkipped: 0,
    productsSkipped: 0,
    usersSkipped: 0,
    errors: 0
  };

  try {
    // Step 1: Get all designs with their categories
    console.log('📋 Step 1: Loading designs and categories...');
    const designs = await prisma.design.findMany({
      include: {
        Category: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    // Create a map: categoryId -> designId
    const categoryToDesignMap = new Map();
    designs.forEach(design => {
      design.Category.forEach(category => {
        categoryToDesignMap.set(category.id, design.id);
      });
    });

    console.log(`✅ Loaded ${designs.length} designs`);
    console.log(`✅ Mapped ${categoryToDesignMap.size} categories to designs\n`);

    // Step 2: Connect Services to Designs
    console.log('🎨 Step 2: Connecting services to designs...');
    const services = await prisma.service.findMany({
      where: {
        designId: null, // Only services without a design
        deletedAt: null
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    console.log(`Found ${services.length} services without designs`);
    
    for (const service of services) {
      if (!service.category || service.category.length === 0) {
        stats.servicesSkipped++;
        continue;
      }

      // Use the first category
      const categoryId = service.category[0].id;
      const designId = categoryToDesignMap.get(categoryId);

      if (!designId) {
        console.log(`⚠️  No design found for category: ${service.category[0].name}`);
        stats.servicesSkipped++;
        continue;
      }

      try {
        await prisma.service.update({
          where: { id: service.id },
          data: { designId }
        });
        stats.servicesConnected++;
      } catch (error) {
        console.error(`❌ Error connecting service ${service.id}:`, error.message);
        stats.errors++;
      }
    }

    console.log(`✅ Connected ${stats.servicesConnected} services`);
    console.log(`⏭️  Skipped ${stats.servicesSkipped} services\n`);

    // Step 3: Connect Shops to Designs
    console.log('🏪 Step 3: Connecting shops to designs...');
    const shops = await prisma.shop.findMany({
      where: {
        designId: null,
        deletedAt: null
      },
      include: {
        services: {
          take: 1,
          include: {
            category: {
              select: { id: true, name: true }
            }
          }
        },
        owner: {
          include: {
            services: {
              take: 1,
              include: {
                category: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      }
    });

    console.log(`Found ${shops.length} shops without designs`);

    for (const shop of shops) {
      let designId = null;

      // Try 1: Get design from shop's services
      if (shop.services && shop.services.length > 0) {
        const service = shop.services[0];
        if (service.category && service.category.length > 0) {
          const categoryId = service.category[0].id;
          designId = categoryToDesignMap.get(categoryId);
        }
      }

      // Try 2: Get design from owner's services (common pattern!)
      if (!designId && shop.owner?.services && shop.owner.services.length > 0) {
        const service = shop.owner.services[0];
        if (service.category && service.category.length > 0) {
          const categoryId = service.category[0].id;
          designId = categoryToDesignMap.get(categoryId);
        }
      }

      if (!designId) {
        stats.shopsSkipped++;
        continue;
      }

      try {
        await prisma.shop.update({
          where: { id: shop.id },
          data: { designId }
        });
        stats.shopsConnected++;
      } catch (error) {
        console.error(`❌ Error connecting shop ${shop.id}:`, error.message);
        stats.errors++;
      }
    }

    console.log(`✅ Connected ${stats.shopsConnected} shops`);
    console.log(`⏭️  Skipped ${stats.shopsSkipped} shops\n`);

    // Step 4: Connect Products to Designs
    console.log('📦 Step 4: Connecting products to designs...');
    const products = await prisma.product.findMany({
      where: {
        designId: null,
        deletedAt: null
      },
      include: {
        shop: {
          select: { 
            id: true,
            designId: true,
            services: {
              take: 1,
              include: {
                category: {
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    console.log(`Found ${products.length} products without designs`);

    for (const product of products) {
      let designId = null;

      // Try to get design from shop
      if (product.shop?.designId) {
        designId = product.shop.designId;
      }
      // Otherwise, get from shop's service category
      else if (product.shop?.services && product.shop.services.length > 0) {
        const service = product.shop.services[0];
        if (service.category && service.category.length > 0) {
          const categoryId = service.category[0].id;
          designId = categoryToDesignMap.get(categoryId);
        }
      }

      if (!designId) {
        stats.productsSkipped++;
        continue;
      }

      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { designId }
        });
        stats.productsConnected++;
      } catch (error) {
        console.error(`❌ Error connecting product ${product.id}:`, error.message);
        stats.errors++;
      }
    }

    console.log(`✅ Connected ${stats.productsConnected} products`);
    console.log(`⏭️  Skipped ${stats.productsSkipped} products\n`);

    // Step 5: Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 Entity-Design Connection Summary:');
    console.log('='.repeat(70));
    console.log(`Services:`);
    console.log(`  ✅ Connected: ${stats.servicesConnected}`);
    console.log(`  ⏭️  Skipped: ${stats.servicesSkipped}`);
    console.log(``);
    console.log(`Shops:`);
    console.log(`  ✅ Connected: ${stats.shopsConnected}`);
    console.log(`  ⏭️  Skipped: ${stats.shopsSkipped}`);
    console.log(``);
    console.log(`Products:`);
    console.log(`  ✅ Connected: ${stats.productsConnected}`);
    console.log(`  ⏭️  Skipped: ${stats.productsSkipped}`);
    console.log(``);
    console.log(`Total Errors: ${stats.errors}`);
    console.log('='.repeat(70));

    // Step 6: Verification
    console.log('\n🔍 Verification:');
    console.log('Checking connected entities...\n');

    const connectedServices = await prisma.service.count({
      where: { designId: { not: null }, deletedAt: null }
    });
    const connectedShops = await prisma.shop.count({
      where: { designId: { not: null }, deletedAt: null }
    });
    const connectedProducts = await prisma.product.count({
      where: { designId: { not: null }, deletedAt: null }
    });

    console.log(`✅ Total services with designs: ${connectedServices}`);
    console.log(`✅ Total shops with designs: ${connectedShops}`);
    console.log(`✅ Total products with designs: ${connectedProducts}`);

    console.log('\n✨ Process completed successfully!\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  connectEntitiesToDesigns()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { connectEntitiesToDesigns };


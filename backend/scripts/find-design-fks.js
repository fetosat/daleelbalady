/**
 * Find Design Foreign Keys Script
 * 
 * This script finds all tables that have foreign key relationships to the design table
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function findDesignFKs() {
  console.log('🔍 Finding all foreign key relationships to design table...\n');
  
  try {
    // Check all potential tables that might reference design
    const tablesToCheck = [
      { name: 'Service', field: 'designId' },
      { name: 'Shop', field: 'designId' },
      { name: 'Product', field: 'designId' },
      { name: 'User', field: 'designId' },
    ];

    console.log('Checking tables for designId foreign keys:\n');
    
    for (const table of tablesToCheck) {
      try {
        const count = await prisma[table.name.toLowerCase()].count({
          where: { [table.field]: { not: null } }
        });
        
        if (count > 0) {
          console.log(`✅ ${table.name} has ${count} record(s) with designId`);
        } else {
          console.log(`⚪ ${table.name} has 0 records with designId`);
        }
      } catch (error) {
        console.log(`❌ ${table.name}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('Checking existing designs and their relationships:\n');
    
    const designs = await prisma.design.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        Service: { select: { id: true } },
        Shop: { select: { id: true } },
        Product: { select: { id: true } },
        Category: { select: { id: true } },
      }
    });

    designs.forEach((design, index) => {
      console.log(`${index + 1}. ${design.name} (${design.slug})`);
      console.log(`   Services: ${design.Service?.length || 0}`);
      console.log(`   Shops: ${design.Shop?.length || 0}`);
      console.log(`   Products: ${design.Product?.length || 0}`);
      console.log(`   Categories: ${design.Category?.length || 0}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  findDesignFKs()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { findDesignFKs };


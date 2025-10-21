/**
 * List Categories Script
 * 
 * This script lists all categories in the database to help you
 * understand what categories exist and need designs.
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function listCategories() {
  console.log('📋 Fetching all categories from database...\n');
  
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Found ${categories.length} categories:\n`);
    console.log('='.repeat(80));
    
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name}`);
      console.log(`   Slug: ${cat.slug}`);
      console.log(`   ID: ${cat.id}`);
      if (cat.description) {
        console.log(`   Description: ${cat.description.substring(0, 60)}...`);
      }
      console.log('');
    });
    
    console.log('='.repeat(80));
    console.log('\n✅ Category list complete!\n');

  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  listCategories()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { listCategories };


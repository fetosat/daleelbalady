import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

async function listAllCategories() {
  try {
    console.log('📋 Fetching all categories and subcategories...\n');

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        subCategories: {
          orderBy: { name: 'asc' }
        }
      }
    });

    console.log(`Found ${categories.length} categories:\n`);

    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
      console.log(`   ID: ${category.id}`);
      console.log(`   Slug: ${category.slug || 'NO SLUG'}`);
      
      if (category.subCategories.length > 0) {
        console.log(`   Subcategories (${category.subCategories.length}):`);
        category.subCategories.forEach((sub, subIndex) => {
          console.log(`      ${subIndex + 1}. ${sub.name}`);
          console.log(`         ID: ${sub.id}`);
          console.log(`         Slug: ${sub.slug}`);
        });
      } else {
        console.log(`   No subcategories`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllCategories();


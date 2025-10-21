import { PrismaClient } from './generated/prisma/index.js';
const prisma = new PrismaClient();

async function exportDesignSlugs() {
  console.log('📋 Exporting all design slugs...\n');

  try {
    const designs = await prisma.design.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('=== ALL DESIGN SLUGS ===\n');
    
    designs.forEach((design, index) => {
      console.log(`${index + 1}. ${design.name}`);
      console.log(`   Slug: ${design.slug}`);
      console.log(`   ID: ${design.id}`);
      console.log(`   Description: ${design.description}`);
      console.log('');
    });

    console.log('=== SUMMARY ===');
    console.log(`Total designs: ${designs.length}\n`);
    
    console.log('=== SLUG LIST (for frontend) ===');
    const slugs = designs.map(d => d.slug);
    console.log(JSON.stringify(slugs, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

exportDesignSlugs();


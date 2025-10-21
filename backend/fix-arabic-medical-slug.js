import { PrismaClient } from './generated/prisma/index.js';
const prisma = new PrismaClient();

/**
 * Update the Arabic medical design slug to match the English one
 * so both use the same frontend design component
 */
async function fixArabicMedicalSlug() {
  console.log('🔧 Fixing Arabic medical design slug...');

  try {
    // Update the Arabic medical design to use the same slug as English
    const result = await prisma.design.update({
      where: { slug: 'medical-professional-ar' },
      data: { slug: 'medical' }
    });

    console.log(`✅ Updated design: ${result.name}`);
    console.log(`   Old slug: medical-professional-ar`);
    console.log(`   New slug: medical`);
    console.log('\n✨ Done! The Arabic medical design now uses the same slug as the English one.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixArabicMedicalSlug();


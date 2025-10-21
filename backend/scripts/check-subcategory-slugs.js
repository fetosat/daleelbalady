import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

async function checkSubcategorySlugs() {
  try {
    console.log('🔍 Checking subcategory slugs for issues...\n');

    const subcategories = await prisma.subCategory.findMany({
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Found ${subcategories.length} subcategories:\n`);

    let issuesFound = 0;

    subcategories.forEach((sub, index) => {
      const hasIssues = [];
      
      // Check for common slug issues
      if (!sub.slug) {
        hasIssues.push('❌ Missing slug');
      }
      
      if (sub.slug && sub.slug.includes(' ')) {
        hasIssues.push('⚠️ Contains spaces');
      }
      
      if (sub.slug && /[A-Z]/.test(sub.slug)) {
        hasIssues.push('⚠️ Contains uppercase letters');
      }
      
      if (sub.slug && sub.slug.includes('ك') && !sub.name.includes('ك')) {
        hasIssues.push('⚠️ Slug has "ك" but name doesn\'t');
      }

      // Display subcategory info
      console.log(`${index + 1}. ${sub.name}`);
      console.log(`   Category: ${sub.category.name}`);
      console.log(`   Slug: ${sub.slug || 'NONE'}`);
      console.log(`   ID: ${sub.id}`);
      
      if (hasIssues.length > 0) {
        console.log(`   Issues: ${hasIssues.join(', ')}`);
        issuesFound++;
      }
      
      console.log('');
    });

    console.log(`\n📊 Summary: ${issuesFound} subcategories with potential issues\n`);

    // Check for duplicate slugs
    const slugCounts = {};
    subcategories.forEach(sub => {
      if (sub.slug) {
        slugCounts[sub.slug] = (slugCounts[sub.slug] || 0) + 1;
      }
    });

    const duplicates = Object.entries(slugCounts).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('⚠️ Duplicate slugs found:');
      duplicates.forEach(([slug, count]) => {
        console.log(`   "${slug}" appears ${count} times`);
      });
    } else {
      console.log('✅ No duplicate slugs found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubcategorySlugs();


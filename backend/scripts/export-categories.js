import fs from 'fs';
import path from 'path';
import { PrismaClient } from './../generated/prisma/client.js';

const prisma = new PrismaClient();

async function exportCategoriesToMarkdown(outputFile = 'categories-export.md') {
  try {
    console.log('🔄 Starting category export...');

    // Fetch all categories with their subcategories
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📋 Found ${categories.length} categories to export`);

    // Generate markdown content
    let markdownContent = '# Categories and Subcategories\n\n';
    markdownContent += `*Generated on: ${new Date().toISOString()}*\n\n`;

    if (categories.length === 0) {
      markdownContent += '**No categories found in the database.**\n';
    } else {
      categories.forEach(category => {
        // Category header
        markdownContent += `## ${category.name}\n`;
        if (category.description) {
          markdownContent += `*${category.description}*\n\n`;
        }

        // Subcategories
        if (category.subCategories && category.subCategories.length > 0) {
          category.subCategories.forEach(subCategory => {
            markdownContent += `  - **${subCategory.name}** : \`${subCategory.id}\`\n`;
          });
        } else {
          markdownContent += '  *No subcategories found*\n';
        }

        markdownContent += '\n';
      });
    }

    // Write to file
    const outputPath = path.join('..', outputFile);
    fs.writeFileSync(outputPath, markdownContent, 'utf-8');

    console.log(`✅ Export completed successfully!`);
    console.log(`📄 Markdown file saved to: ${outputPath}`);
    console.log(`📊 Summary:`);
    console.log(`   - Categories exported: ${categories.length}`);
    console.log(`   - Total subcategories: ${categories.reduce((total, cat) => total + cat.subCategories.length, 0)}`);

    return outputPath;

  } catch (error) {
    console.error('❌ Error exporting categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function exportCategoriesToJSON(outputFile = 'categories-export.json') {
  try {
    console.log('🔄 Starting category JSON export...');

    // Fetch all categories with their subcategories
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📋 Found ${categories.length} categories to export`);

    // Generate JSON structure
    const exportData = {
      exportDate: new Date().toISOString(),
      totalCategories: categories.length,
      totalSubCategories: categories.reduce((total, cat) => total + cat.subCategories.length, 0),
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        createdAt: category.createdAt,
        subCategories: category.subCategories.map(subCategory => ({
          id: subCategory.id,
          name: subCategory.name,
          slug: subCategory.slug,
          createdAt: subCategory.createdAt
        }))
      }))
    };

    // Write to file
    const outputPath = path.join('..', outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

    console.log(`✅ JSON export completed successfully!`);
    console.log(`📄 JSON file saved to: ${outputPath}`);

    return outputPath;

  } catch (error) {
    console.error('❌ Error exporting categories to JSON:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const format = args[0] || 'markdown'; // 'markdown' or 'json'
  const outputFile = args[1];

  try {
    if (format.toLowerCase() === 'json') {
      await exportCategoriesToJSON(outputFile);
    } else {
      await exportCategoriesToMarkdown(outputFile);
    }

    console.log('🎉 Export process finished!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Export process failed:', error);
    process.exit(1);
  }
}

main();
// Run with: node scripts/export-categories.js [markdown|json] [optional-output-filename]
import fs from 'fs';
import path from 'path';
import { PrismaClient } from './../generated/prisma/client.js';

const prisma = new PrismaClient();

async function exportServicesBasic(outputFile = 'services-export.json') {
  try {
    console.log('🔄 Starting service export...');

    // Fetch all services with minimal data and translations
    const services = await prisma.service.findMany({
      select: {
        id: true,
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
        translation: {
          select: {
            name_en: true,
            name_ar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📋 Found ${services.length} services to export`);

    // Transform the data to include both English and Arabic names
    const exportData = {
      exportDate: new Date().toISOString(),
      totalServices: services.length,
      services: services.map(service => ({
        id: service.id,
        nameAr: service.translation?.name_ar || service.translation?.name_en || 'N/A',
        category: service.category[0]?.name || 'N/A',
      }))
    };

    // Write to file
    const outputPath = path.join(__dirname, '..', outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

    console.log(`✅ Export completed successfully!`);
    console.log(`📄 JSON file saved to: ${outputPath}`);
    console.log(`📊 Summary:`);
    console.log(`   - Services exported: ${services.length}`);

    return outputPath;

  } catch (error) {
    console.error('❌ Error exporting services:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const outputFile = args[0] || 'services-export.json';

  try {
    await exportServicesBasic(outputFile);
    console.log('🎉 Export process finished!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Export process failed:', error);
    process.exit(1);
  }
}

// Run the export if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { exportServicesBasic };

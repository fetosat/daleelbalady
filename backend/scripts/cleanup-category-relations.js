const { PrismaClient } = require('../generated/prisma/client.js');

const prisma = new PrismaClient();

async function disconnectAllCategoryRelations({ dryRun = false } = {}) {
  console.log('— Category/SubCategory relation cleanup —');
  console.log(`Dry run: ${dryRun ? 'YES (no changes will be written)' : 'NO (changes will be applied)'}`);

  // 1) Summaries before
  const totals = await prisma.$transaction([
    prisma.category.count(),
    prisma.subCategory.count(),
    prisma.service.count(),
  ]);
  console.log(`Existing: categories=${totals[0]}, subCategories=${totals[1]}, services=${totals[2]}`);

  // Estimate relation counts using efficient direct queries
  console.log('Estimating relation links...');
  // For the implicit M2M table between Category and Service
  // Note: The table name `_CategoryToService` is Prisma's default. If you renamed it, adjust this query.
  const [{ categoryLinkCount }] = await prisma.$queryRaw`SELECT COUNT(*) as categoryLinkCount FROM \`_CategoryToService\``;
  const estCategoryLinks = Number(categoryLinkCount); // Raw query returns BigInt

  // For the explicit 1-M relation from Service to SubCategory
  const estSubCategoryLinks = await prisma.service.count({
    where: { subCategoryId: { not: null } },
  });

  console.log(`Estimated links: Service↔Category (M2M)=${estCategoryLinks}, Service→SubCategory (1-M)=${estSubCategoryLinks}`);

  if (dryRun) {
    console.log('Dry run: skipping writes.');
    return { estCategoryLinks, estSubCategoryLinks };
  }

  // 2) Null all Service.subCategoryId fields (disconnecting the 1-to-many relation)
  // This is a single, efficient operation.
  console.log('Nulling all Service.subCategoryId foreign keys...');
  const subCategoryRes = await prisma.service.updateMany({
    data: { subCategoryId: null },
    where: { subCategoryId: { not: null } },
  });
  console.log(`  Cleared SubCategory relations for ${subCategoryRes.count} services.`);

  // 3) Clear many-to-many: Service.category
  // This requires iterating because `updateMany` doesn't support M2M relation updates.
  console.log('Disconnecting all Service.category relations (many-to-many)...');
  const batchSize = 200;
  let cursor = undefined;
  let clearedServiceCount = 0;
  const totalServices = totals[2];

  while (true) {
    const services = await prisma.service.findMany({
      select: { id: true },
      orderBy: { id: 'asc' },
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    if (services.length === 0) break;

    // Update each service in the batch to clear its 'category' relations.
    await Promise.all(
      services.map((s) =>
        prisma.service.update({
          where: { id: s.id },
          data: {
            category: { set: [] },
          },
        })
      )
    );

    clearedServiceCount += services.length;
    cursor = services[services.length - 1].id;
    console.log(`  Processed ${clearedServiceCount} of ${totalServices} services for category disconnection...`);
  }

  console.log('Done. You can now safely delete categories and/or subcategories.');
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');

    await disconnectAllCategoryRelations({ dryRun });
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { disconnectAllCategoryRelations };
import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient();

const commonTags = [
    'إلكترونيات',
    'ملابس',
    'أغذية ومشروبات',
    'صحة وجمال',
    'كتب وقرطاسية',
    'منزل ومفروشات',
    'رياضة ولياقة',
    'ألعاب أطفال',
    'سيارات وإكسسوارات',
    'مجوهرات وإكسسوارات',
    'أجهزة منزلية',
    'أدوات ومعدات',
    'حقائب وأحذية',
    'هواتف وتابلت',
    'كمبيوتر ولابتوب',
    'أثاث',
    'إضاءة وديكور',
    'حدائق ونباتات',
    'حيوانات أليفة',
    'أخرى'
];

async function seedTags() {
    console.log('🌱 Seeding product tags...\n');
    
    let created = 0;
    let skipped = 0;
    
    for (const tagName of commonTags) {
        try {
            // Check if tag exists
            const existing = await prisma.tags.findFirst({
                where: { name: tagName }
            });
            
            if (existing) {
                console.log(`⏭️  Skipped: ${tagName} (already exists)`);
                skipped++;
            } else {
                await prisma.tags.create({
                    data: { name: tagName }
                });
                console.log(`✅ Created: ${tagName}`);
                created++;
            }
        } catch (error) {
            console.error(`❌ Error creating tag ${tagName}:`, error.message);
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📋 Total: ${commonTags.length}`);
    
    // Fetch and display all tags
    const allTags = await prisma.tags.findMany({
        orderBy: { name: 'asc' }
    });
    
    console.log(`\n📋 All tags in database (${allTags.length}):`);
    allTags.forEach((tag, index) => {
        console.log(`   ${index + 1}. ${tag.name}`);
    });
}

seedTags()
    .then(async () => {
        await prisma.$disconnect();
        console.log('\n✅ Done!');
    })
    .catch(async (error) => {
        console.error('\n❌ Error:', error);
        await prisma.$disconnect();
        process.exit(1);
    });


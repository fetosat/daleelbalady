/**
 * Create Missing Designs Script
 * 
 * This script creates designs for categories that don't have them yet.
 * SAFE: Does not delete existing designs or modify existing relationships.
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Design templates mapped to ACTUAL category slugs
const designTemplates = {
  'medical-services': {
    name: 'Medical Professional',
    description: 'Clean, professional medical-themed design with calming blue tones, medical icons, and trust-building elements. Perfect for healthcare providers, clinics, hospitals, and medical services.',
    slug: 'medical-professional'
  },
  'الدليل-الطبي': {
    name: 'Medical Professional Arabic',
    description: 'تصميم طبي احترافي بألوان زرقاء هادئة، أيقونات طبية، وعناصر بناء الثقة. مثالي لمقدمي الرعاية الصحية والعيادات والمستشفيات والخدمات الطبية.',
    slug: 'medical-professional-ar'
  },
  'الدليل-القانوني': {
    name: 'Legal Authority',
    description: 'Professional legal design with authoritative dark blue and gold accents. Emphasizes trust, expertise, and professionalism for lawyers, accountants, and legal consultants.',
    slug: 'legal-authority'
  },
  'الدليلك-الهندسي': {
    name: 'Engineering Blueprint',
    description: 'Technical and modern design with engineering-inspired elements, clean lines, and technical blue/stone palette. Ideal for engineers, technical consultants, and engineering firms.',
    slug: 'engineering-blueprint'
  },
  'الدليل-الحرفي': {
    name: 'Craftsman Workshop',
    description: 'Rustic and practical design with warm earth tones, tool icons, and hands-on aesthetic. Perfect for craftsmen, electricians, plumbers, carpenters, and artisans.',
    slug: 'craftsman-workshop'
  },
  'دليل-الورش': {
    name: 'Industrial Workshop',
    description: 'Industrial-strength design with metallic accents, bold typography, and workshop imagery. Great for repair shops, mechanical workshops, and service centers.',
    slug: 'industrial-workshop'
  },
  'دليل-المصانع': {
    name: 'Factory Industrial',
    description: 'Heavy industrial design with strong geometric patterns, steel stone palette, and production-focused elements. Suited for factories, manufacturing, and industrial production.',
    slug: 'factory-industrial'
  },
  'دليل-الشركات': {
    name: 'Corporate Professional',
    description: 'Modern corporate design with sleek layouts, professional blue and white palette, and business-focused elements. Perfect for corporations, enterprises, and business services.',
    slug: 'corporate-professional'
  },
  'دليل-المطاعم': {
    name: 'Restaurant Delicious',
    description: 'Appetizing food-themed design with warm colors, mouth-watering imagery, and inviting layouts. Ideal for restaurants, eateries, and food services.',
    slug: 'restaurant-delicious'
  },
  'دليل-الكافيهات': {
    name: 'Cafe Cozy',
    description: 'Warm and inviting cafe design with coffee-inspired browns and creams, relaxed atmosphere, and social elements. Perfect for cafes, coffee shops, and social hangouts.',
    slug: 'cafe-cozy'
  },
  'دليل-المحلات': {
    name: 'Retail Showcase',
    description: 'Vibrant retail design with product-focused layouts, shopping-friendly navigation, and colorful accents. Great for retail stores, shops, and e-commerce.',
    slug: 'retail-showcase'
  },
  'الدليل-العقاري': {
    name: 'Real Estate Luxury',
    description: 'Elegant real estate design with sophisticated gold and navy palette, property showcases, and premium feel. Perfect for real estate agents, developers, and property services.',
    slug: 'real-estate-luxury'
  },
  'دليل-السيارات': {
    name: 'Automotive Speed',
    description: 'Dynamic automotive design with sleek lines, racing-inspired reds and blacks, and car-focused imagery. Ideal for car dealers, service centers, and automotive businesses.',
    slug: 'automotive-speed'
  },
  'دليل-المصالح-الحكوميه': {
    name: 'Government Official',
    description: 'Formal government design with official colors, structured layouts, and authoritative elements. Suited for government offices, public services, and official entities.',
    slug: 'government-official'
  }
};

async function createMissingDesigns() {
  console.log('🎨 Creating missing designs (safe mode)...\n');
  
  let created = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Fetch all categories
    console.log('📋 Fetching categories from database...');
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true }
    });
    console.log(`✅ Found ${categories.length} categories\n`);

    // Fetch existing designs
    const existingDesigns = await prisma.design.findMany({
      select: { slug: true, categoryId: true }
    });
    const existingSlugs = new Set(existingDesigns.map(d => d.slug));

    console.log('🎨 Checking for missing designs...\n');
    
    for (const category of categories) {
      const designTemplate = designTemplates[category.slug];

      if (!designTemplate) {
        console.log(`⚠️  No design template for: ${category.name} (${category.slug})`);
        skipped++;
        continue;
      }

      // Check if design already exists
      if (existingSlugs.has(designTemplate.slug)) {
        console.log(`⏭️  Design already exists: ${designTemplate.name}`);
        skipped++;
        continue;
      }

      try {
        // Create the design
        const design = await prisma.design.create({
          data: {
            name: designTemplate.name,
            description: designTemplate.description,
            slug: designTemplate.slug,
            categoryId: category.id,
            Category: {
              connect: { id: category.id }
            }
          }
        });

        console.log(`✅ Created: ${design.name}`);
        console.log(`   → Connected to: ${category.name}\n`);
        created++;

      } catch (error) {
        console.error(`❌ Error creating design for ${category.name}:`, error.message);
        errors++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 Design Creation Summary:');
    console.log('='.repeat(70));
    console.log(`✅ Created: ${created} new design(s)`);
    console.log(`⏭️  Skipped: ${skipped} (already exist)`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(70));

    console.log('\n✨ Process completed successfully!\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createMissingDesigns()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { createMissingDesigns };


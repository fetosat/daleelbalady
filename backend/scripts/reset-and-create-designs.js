/**
 * Reset and Create Designs Script
 * 
 * This script:
 * 1. Deletes all existing designs
 * 2. Creates new designs mapped to actual database categories
 * 3. Properly connects designs to their categories
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Design templates mapped to ACTUAL category slugs from your database
const designTemplates = {
  // Medical Services (English)
  'medical-services': {
    name: 'Medical Professional',
    description: 'Clean, professional medical-themed design with calming blue tones, medical icons, and trust-building elements. Perfect for healthcare providers, clinics, hospitals, and medical services.',
    slug: 'medical-professional'
  },
  
  // الدليل الطبي (Arabic Medical)
  'الدليل-الطبي': {
    name: 'Medical Professional Arabic',
    description: 'تصميم طبي احترافي بألوان زرقاء هادئة، أيقونات طبية، وعناصر بناء الثقة. مثالي لمقدمي الرعاية الصحية والعيادات والمستشفيات والخدمات الطبية.',
    slug: 'medical-professional-ar'
  },
  
  // الدليل القانوني (Legal)
  'الدليل-القانوني': {
    name: 'Legal Authority',
    description: 'Professional legal design with authoritative dark blue and gold accents. Emphasizes trust, expertise, and professionalism for lawyers, accountants, and legal consultants.',
    slug: 'legal-authority'
  },
  
  // الدليلك الهندسي (Engineering)
  'الدليلك-الهندسي': {
    name: 'Engineering Blueprint',
    description: 'Technical and modern design with engineering-inspired elements, clean lines, and technical blue/stone palette. Ideal for engineers, technical consultants, and engineering firms.',
    slug: 'engineering-blueprint'
  },
  
  // الدليل الحرفي (Craftsmen)
  'الدليل-الحرفي': {
    name: 'Craftsman Workshop',
    description: 'Rustic and practical design with warm earth tones, tool icons, and hands-on aesthetic. Perfect for craftsmen, electricians, plumbers, carpenters, and artisans.',
    slug: 'craftsman-workshop'
  },
  
  // دليل الورش (Workshops)
  'دليل-الورش': {
    name: 'Industrial Workshop',
    description: 'Industrial-strength design with metallic accents, bold typography, and workshop imagery. Great for repair shops, mechanical workshops, and service centers.',
    slug: 'industrial-workshop'
  },
  
  // دليل المصانع (Factories)
  'دليل-المصانع': {
    name: 'Factory Industrial',
    description: 'Heavy industrial design with strong geometric patterns, steel stone palette, and production-focused elements. Suited for factories, manufacturing, and industrial production.',
    slug: 'factory-industrial'
  },
  
  // دليل الشركات (Companies)
  'دليل-الشركات': {
    name: 'Corporate Professional',
    description: 'Modern corporate design with sleek layouts, professional blue and white palette, and business-focused elements. Perfect for corporations, enterprises, and business services.',
    slug: 'corporate-professional'
  },
  
  // دليل المطاعم (Restaurants)
  'دليل-المطاعم': {
    name: 'Restaurant Delicious',
    description: 'Appetizing food-themed design with warm colors, mouth-watering imagery, and inviting layouts. Ideal for restaurants, eateries, and food services.',
    slug: 'restaurant-delicious'
  },
  
  // دليل الكافيهات (Cafes)
  'دليل-الكافيهات': {
    name: 'Cafe Cozy',
    description: 'Warm and inviting cafe design with coffee-inspired browns and creams, relaxed atmosphere, and social elements. Perfect for cafes, coffee shops, and social hangouts.',
    slug: 'cafe-cozy'
  },
  
  // دليل المحلات (Shops)
  'دليل-المحلات': {
    name: 'Retail Showcase',
    description: 'Vibrant retail design with product-focused layouts, shopping-friendly navigation, and colorful accents. Great for retail stores, shops, and e-commerce.',
    slug: 'retail-showcase'
  },
  
  // الدليل العقاري (Real Estate)
  'الدليل-العقاري': {
    name: 'Real Estate Luxury',
    description: 'Elegant real estate design with sophisticated gold and navy palette, property showcases, and premium feel. Perfect for real estate agents, developers, and property services.',
    slug: 'real-estate-luxury'
  },
  
  // دليل السيارات (Automotive)
  'دليل-السيارات': {
    name: 'Automotive Speed',
    description: 'Dynamic automotive design with sleek lines, racing-inspired reds and blacks, and car-focused imagery. Ideal for car dealers, service centers, and automotive businesses.',
    slug: 'automotive-speed'
  },
  
  // دليل المصالح الحكوميه (Government Services)
  'دليل-المصالح-الحكوميه': {
    name: 'Government Official',
    description: 'Formal government design with official colors, structured layouts, and authoritative elements. Suited for government offices, public services, and official entities.',
    slug: 'government-official'
  }
};

async function resetAndCreateDesigns() {
  console.log('🔄 Starting design reset and creation process...\n');
  
  let deleted = 0;
  let created = 0;
  let errors = 0;
  let disconnected = 0;

  try {
    // Step 0: Get all existing designs first
    console.log('🔍 Step 0: Checking existing designs...');
    const existingDesigns = await prisma.design.findMany({
      select: { id: true, name: true }
    });
    console.log(`Found ${existingDesigns.length} existing design(s)\n`);

    if (existingDesigns.length === 0) {
      console.log('✅ No existing designs to clean up. Proceeding to creation...\n');
    } else {
      // Step 0.5: Disconnect designs from all related entities
      console.log('🔌 Step 1: Disconnecting existing design relationships...');
      
      // Disconnect designs from services
      const servicesCount = await prisma.service.count({
        where: { designId: { not: null } }
      });
      
      if (servicesCount > 0) {
        await prisma.service.updateMany({
          where: { designId: { not: null } },
          data: { designId: null }
        });
        console.log(`   ✅ Disconnected ${servicesCount} services`);
        disconnected += servicesCount;
      }

      // Disconnect designs from shops
      const shopsCount = await prisma.shop.count({
        where: { designId: { not: null } }
      });
      
      if (shopsCount > 0) {
        await prisma.shop.updateMany({
          where: { designId: { not: null } },
          data: { designId: null }
        });
        console.log(`   ✅ Disconnected ${shopsCount} shops`);
        disconnected += shopsCount;
      }

      // Disconnect designs from products
      const productsCount = await prisma.product.count({
        where: { designId: { not: null } }
      });
      
      if (productsCount > 0) {
        await prisma.product.updateMany({
          where: { designId: { not: null } },
          data: { designId: null }
        });
        console.log(`   ✅ Disconnected ${productsCount} products`);
        disconnected += productsCount;
      }

      // Disconnect designs from users (if users have designId)
      try {
        const usersCount = await prisma.user.count({
          where: { designId: { not: null } }
        });
        
        if (usersCount > 0) {
          await prisma.user.updateMany({
            where: { designId: { not: null } },
            data: { designId: null }
          });
          console.log(`   ✅ Disconnected ${usersCount} users`);
          disconnected += usersCount;
        }
      } catch (error) {
        // User table might not have designId field
        console.log(`   ⚪ User table doesn't have designId field`);
      }

      // Disconnect design-category relationships (many-to-many)
      console.log('   🔗 Disconnecting Category-Design relationships...');
      for (const design of existingDesigns) {
        try {
          await prisma.design.update({
            where: { id: design.id },
            data: {
              Category: {
                set: [] // Disconnect all categories
              }
            }
          });
        } catch (error) {
          // Ignore errors for designs without category relations
        }
      }
      console.log(`   ✅ Cleared Category-Design relationships`);

      console.log(`✅ Total disconnections: ${disconnected}\n`);
    }

    // Step 2: Delete all existing designs
    console.log('🗑️  Step 2: Deleting all existing designs...');
    const deleteResult = await prisma.design.deleteMany({});
    deleted = deleteResult.count;
    console.log(`✅ Deleted ${deleted} existing design(s)\n`);

    // Step 3: Fetch all categories from database
    console.log('📋 Step 3: Fetching categories from database...');
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true }
    });
    console.log(`✅ Found ${categories.length} categories\n`);

    // Step 4: Create designs for each category
    console.log('🎨 Step 4: Creating designs for categories...\n');
    
    for (const category of categories) {
      const designTemplate = designTemplates[category.slug];

      if (!designTemplate) {
        console.log(`⚠️  No design template for: ${category.name} (${category.slug})`);
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
        console.log(`   → Connected to: ${category.name}`);
        console.log(`   → Design slug: ${design.slug}\n`);
        created++;

      } catch (error) {
        console.error(`❌ Error creating design for ${category.name}:`, error.message);
        errors++;
      }
    }

    // Step 5: Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 Design Reset and Creation Summary:');
    console.log('='.repeat(70));
    console.log(`🔌 Disconnected: ${disconnected} relationship(s)`);
    console.log(`🗑️  Deleted: ${deleted} old design(s)`);
    console.log(`✅ Created: ${created} new design(s)`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(70));

    // Step 6: Verify connections
    console.log('\n🔍 Verifying design-category connections...\n');
    const designs = await prisma.design.findMany({
      include: {
        Category: {
          select: { name: true, slug: true }
        }
      }
    });

    designs.forEach((design, index) => {
      console.log(`${index + 1}. ${design.name} (${design.slug})`);
      if (design.Category && design.Category.length > 0) {
        design.Category.forEach(cat => {
          console.log(`   ✅ Connected to: ${cat.name}`);
        });
      } else {
        console.log(`   ⚠️  No category connection found`);
      }
    });

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
  resetAndCreateDesigns()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { resetAndCreateDesigns, designTemplates };


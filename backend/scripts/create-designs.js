/**
 * Create Designs Script
 * 
 * This script creates designs for each category in the database.
 * Designs are visual themes/templates that can be applied to:
 * - Products
 * - Services
 * - Shops
 * - User Listings
 * 
 * Each design is associated with a category and provides a unique
 * visual identity for that category's content.
 */

import { PrismaClient } from '../generated/prisma/index.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load categories.json
const categoriesData = await readFile(join(__dirname, 'categories.json'), 'utf-8');
const categories = JSON.parse(categoriesData);

const prisma = new PrismaClient();

// Design templates mapping category slugs to design configurations
const designTemplates = {
  // Medical/Healthcare Design
  'medical-guide': {
    name: 'Medical Professional',
    description: 'Clean, professional medical-themed design with calming blue tones, medical icons, and trust-building elements. Perfect for healthcare providers, clinics, hospitals, and medical services.',
    slug: 'medical-professional'
  },
  
  // Legal Services Design
  'legal-guide': {
    name: 'Legal Authority',
    description: 'Professional legal design with authoritative dark blue and gold accents. Emphasizes trust, expertise, and professionalism for lawyers, accountants, and legal consultants.',
    slug: 'legal-authority'
  },
  
  // Engineering Design
  'engineering-guide': {
    name: 'Engineering Blueprint',
    description: 'Technical and modern design with engineering-inspired elements, clean lines, and technical blue/stone palette. Ideal for engineers, technical consultants, and engineering firms.',
    slug: 'engineering-blueprint'
  },
  
  // Craftsmen Design
  'craftsmen-guide': {
    name: 'Craftsman Workshop',
    description: 'Rustic and practical design with warm earth tones, tool icons, and hands-on aesthetic. Perfect for craftsmen, electricians, plumbers, carpenters, and artisans.',
    slug: 'craftsman-workshop'
  },
  
  // Workshops Design
  'workshops-guide': {
    name: 'Industrial Workshop',
    description: 'Industrial-strength design with metallic accents, bold typography, and workshop imagery. Great for repair shops, mechanical workshops, and service centers.',
    slug: 'industrial-workshop'
  },
  
  // Factories Design
  'factories-guide': {
    name: 'Factory Industrial',
    description: 'Heavy industrial design with strong geometric patterns, steel stone palette, and production-focused elements. Suited for factories, manufacturing, and industrial production.',
    slug: 'factory-industrial'
  },
  
  // Companies Design
  'companies-guide': {
    name: 'Corporate Professional',
    description: 'Modern corporate design with sleek layouts, professional blue and white palette, and business-focused elements. Perfect for corporations, enterprises, and business services.',
    slug: 'corporate-professional'
  },
  
  // Restaurants Design
  'restaurants-guide': {
    name: 'Restaurant Delicious',
    description: 'Appetizing food-themed design with warm colors, mouth-watering imagery, and inviting layouts. Ideal for restaurants, eateries, and food services.',
    slug: 'restaurant-delicious'
  },
  
  // Cafes Design
  'cafes-guide': {
    name: 'Cafe Cozy',
    description: 'Warm and inviting cafe design with coffee-inspired browns and creams, relaxed atmosphere, and social elements. Perfect for cafes, coffee shops, and social hangouts.',
    slug: 'cafe-cozy'
  },
  
  // Shops Design
  'shops-guide': {
    name: 'Retail Showcase',
    description: 'Vibrant retail design with product-focused layouts, shopping-friendly navigation, and colorful accents. Great for retail stores, shops, and e-commerce.',
    slug: 'retail-showcase'
  },
  
  // Real Estate Design
  'real-estate-guide': {
    name: 'Real Estate Luxury',
    description: 'Elegant real estate design with sophisticated gold and navy palette, property showcases, and premium feel. Perfect for real estate agents, developers, and property services.',
    slug: 'real-estate-luxury'
  },
  
  // Automotive Design
  'automotive-guide': {
    name: 'Automotive Speed',
    description: 'Dynamic automotive design with sleek lines, racing-inspired reds and blacks, and car-focused imagery. Ideal for car dealers, service centers, and automotive businesses.',
    slug: 'automotive-speed'
  },
  
  // Government Services Design
  'government-services-guide': {
    name: 'Government Official',
    description: 'Formal government design with official colors, structured layouts, and authoritative elements. Suited for government offices, public services, and official entities.',
    slug: 'government-official'
  }
};

async function createDesigns() {
  console.log('🎨 Starting design creation process...\n');
  
  let created = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // First, let's see what categories exist in the database
    console.log('📋 Checking database for existing categories...\n');
    const dbCategories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true }
    });
    console.log(`Found ${dbCategories.length} categories in database`);
    
    // Show first 5 categories as examples
    if (dbCategories.length > 0) {
      console.log('\nExample categories in database:');
      dbCategories.slice(0, 5).forEach(cat => {
        console.log(`  - ${cat.name} (${cat.slug})`);
      });
      console.log('');
    }

    // Iterate through all categories
    for (const category of categories.categories) {
      const categorySlug = category.slug;
      const designTemplate = designTemplates[categorySlug];

      if (!designTemplate) {
        console.log(`⚠️  No design template found for category: ${category.name} (${categorySlug})`);
        skipped++;
        continue;
      }

      try {
        // Check if design already exists
        const existingDesign = await prisma.design.findUnique({
          where: { slug: designTemplate.slug }
        });

        if (existingDesign) {
          console.log(`⏭️  Design already exists: ${designTemplate.name} (${designTemplate.slug})`);
          skipped++;
          continue;
        }

        // Find the category in the database - try multiple matching strategies
        let dbCategory = await prisma.category.findFirst({
          where: { 
            OR: [
              { slug: categorySlug },
              { name: category.name },
              { name: { contains: category.name.split(' ')[0] } }, // Try first word
            ]
          }
        });

        // If still not found, try to match by similar name patterns
        if (!dbCategory) {
          // Remove "الدليلك" or "الدليل" prefix and try again
          const nameWithoutPrefix = category.name
            .replace('الدليلك ', '')
            .replace('الدليل ', '')
            .replace('للمطاعم', 'المطاعم')
            .replace('للمحلات', 'المحلات')
            .replace('للسيارات', 'السيارات')
            .replace('للكافيهات', 'الكافيهات')
            .replace('للمصالح الحكوميه', 'المصالح الحكوميه');
          
          dbCategory = await prisma.category.findFirst({
            where: { 
              name: { contains: nameWithoutPrefix }
            }
          });
        }

        if (!dbCategory) {
          console.log(`❌ Category not found in database: ${category.name} (${categorySlug})`);
          console.log(`   Try checking: ${category.name.replace('الدليلك ', '').replace('الدليل ', '')}`);
          errors++;
          continue;
        }

        // Create the design
        const design = await prisma.design.create({
          data: {
            name: designTemplate.name,
            description: designTemplate.description,
            slug: designTemplate.slug,
            categoryId: dbCategory.id
          }
        });

        console.log(`✅ Created design: ${design.name} (${design.slug}) for category: ${dbCategory.name}`);
        created++;

      } catch (error) {
        console.error(`❌ Error creating design for ${category.name}:`, error.message);
        errors++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Design Creation Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Created: ${created}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Fatal error during design creation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createDesigns()
    .then(() => {
      console.log('✨ Design creation process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { createDesigns, designTemplates };


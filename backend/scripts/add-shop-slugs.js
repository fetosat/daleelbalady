// Migration script to add slugs to existing shops
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

// Helper function to generate shop slug from name and ID
const generateSlug = (name, id) => {
  // First, try to generate from Latin characters only
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Keep only latin letters, numbers, spaces, hyphens
    .replace(/[\s_]+/g, '-')      // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');       // Remove leading/trailing hyphens
  
  // If slug is empty or too short (Arabic/special chars only), use shop ID
  if (!slug || slug.length < 2) {
    // Use last 12 characters of ID for uniqueness
    slug = `shop-${id.slice(-12)}`;
  }
  
  return slug;
};

// Function to ensure unique slug
const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await prisma.shop.findFirst({
      where: {
        slug: slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    });
    
    if (!existing) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

async function addSlugsToShops() {
  console.log('🔄 Starting shop slug migration...');
  
  try {
    // Get all shops without slugs
    const shops = await prisma.shop.findMany({
      where: {
        OR: [
          { slug: null },
          { slug: '' }
        ],
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
    
    console.log(`Found ${shops.length} shops without slugs`);
    
    let updated = 0;
    let errors = 0;
    
    for (const shop of shops) {
      try {
        console.log(`Processing shop: "${shop.name}" (ID: ${shop.id})`);
        
        const baseSlug = generateSlug(shop.name, shop.id);
        
        const uniqueSlug = await ensureUniqueSlug(baseSlug, shop.id);
        
        await prisma.shop.update({
          where: { id: shop.id },
          data: { slug: uniqueSlug }
        });
        
        console.log(`✅ Updated "${shop.name}" with slug: "${uniqueSlug}"`);
        updated++;
        
      } catch (error) {
        console.error(`❌ Error updating shop "${shop.name}":`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully updated: ${updated} shops`);
    console.log(`❌ Errors: ${errors} shops`);
    console.log(`📝 Total processed: ${shops.length} shops`);
    
    // Verify results
    const shopsWithoutSlugs = await prisma.shop.count({
      where: {
        OR: [
          { slug: null },
          { slug: '' }
        ],
        deletedAt: null
      }
    });
    
    console.log(`\n🔍 Verification: ${shopsWithoutSlugs} shops still without slugs`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Test function to create a sample shop for testing
async function createTestShop() {
  console.log('🧪 Creating test shop...');
  
  try {
    // First, find an existing user or create one
    let testUser = await prisma.user.findFirst({
      where: {
        role: 'PROVIDER'
      }
    });
    
    if (!testUser) {
      // Create a test user
      testUser = await prisma.user.create({
        data: {
          name: 'Test Shop Owner',
          email: 'testowner@example.com',
          role: 'PROVIDER',
          isVerified: true
        }
      });
      console.log('✅ Created test user:', testUser.id);
    }
    
    // Create test shop
    const testShop = await prisma.shop.create({
      data: {
        name: 'Mohamed Aymen Shop',
        description: 'A test shop for Mohamed Aymen',
        slug: 'mohamed-aymen',
        ownerId: testUser.id,
        city: 'Cairo',
        phone: '+201234567890',
        email: 'mohamed.aymen@example.com',
        isVerified: true
      }
    });
    
    console.log('✅ Created test shop:', {
      id: testShop.id,
      name: testShop.name,
      slug: testShop.slug
    });
    
    return testShop;
    
  } catch (error) {
    console.error('❌ Error creating test shop:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test-shop')) {
    await createTestShop();
  } else {
    await addSlugsToShops();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { addSlugsToShops, createTestShop, generateSlug, ensureUniqueSlug };

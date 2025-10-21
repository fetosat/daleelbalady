// Script to populate random location coordinates for services
// This will set latitude and longitude for all services to random points within Cairo bounds

import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

// Define the bounding box (your specified coordinates)
// Note: You provided coordinates in format (lat, long), so I'm using them as is
const BOUNDS = {
  minLat: 30.749264468704027,  // Bottom left latitude
  maxLat: 30.76800728124096,   // Top left latitude
  minLong: 30.684312009001303, // Top left longitude
  maxLong: 30.71009865657588   // Top right longitude
};

/**
 * Generate a random number between min and max
 */
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random coordinates within the bounding box
 */
function generateRandomLocation() {
  const latitude = randomBetween(BOUNDS.minLat, BOUNDS.maxLat);
  const longitude = randomBetween(BOUNDS.minLong, BOUNDS.maxLong);
  
  return {
    latitude: parseFloat(latitude.toFixed(8)),
    longitude: parseFloat(longitude.toFixed(8))
  };
}

/**
 * Main function to populate service locations
 */
async function populateServiceLocations() {
  try {
    console.log('🗺️  Starting to populate service locations...');
    console.log(`📍 Bounds: Lat [${BOUNDS.minLat}, ${BOUNDS.maxLat}], Long [${BOUNDS.minLong}, ${BOUNDS.maxLong}]`);
    console.log('');

    // Get all services
    const services = await prisma.service.findMany({
      select: {
        id: true,
        embeddingText: true,
        locationLat: true,
        locationLon: true
      }
    });

    console.log(`📊 Found ${services.length} services`);
    
    if (services.length === 0) {
      console.log('⚠️  No services found in database');
      return;
    }

    // Count services without location
    const servicesWithoutLocation = services.filter(s => !s.locationLat || !s.locationLon);
    console.log(`📍 Services without location: ${servicesWithoutLocation.length}`);
    console.log(`✅ Services with location: ${services.length - servicesWithoutLocation.length}`);
    console.log('');

    // Ask for confirmation if services already have locations
    if (servicesWithoutLocation.length < services.length) {
      console.log('⚠️  Some services already have locations. This script will:');
      console.log('   - Update ALL services (including those with existing locations)');
      console.log('   - Assign new random coordinates to ALL services');
      console.log('');
    }

    // Update all services with random locations
    let updated = 0;
    let errors = 0;

    console.log('🔄 Updating services with random locations...');
    console.log('');

    for (const service of services) {
      try {
        const location = generateRandomLocation();
        
        await prisma.service.update({
          where: { id: service.id },
          data: {
            locationLat: location.latitude,
            locationLon: location.longitude
          }
        });

        updated++;
        
        // Show progress every 10 services
        if (updated % 10 === 0) {
          console.log(`✓ Updated ${updated}/${services.length} services...`);
        }

        // Show first 3 updates with details
        if (updated <= 3) {
          console.log(`  ↳ Service: ${service.embeddingText?.substring(0, 50) || 'Unnamed'}...`);
          console.log(`    Coordinates: ${location.latitude}, ${location.longitude}`);
        }
      } catch (error) {
        errors++;
        console.error(`✗ Error updating service ${service.id}:`, error.message);
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Service location population complete!');
    console.log(`📊 Total services: ${services.length}`);
    console.log(`✓ Successfully updated: ${updated}`);
    console.log(`✗ Errors: ${errors}`);
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('🗺️  You can now view services on the map in the /find page');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Also create a function to populate shops, users, and products
async function populateAllLocations() {
  try {
    console.log('🌍 Populating locations for all entities...');
    console.log('');

    // Update Services
    console.log('1️⃣  Updating Services...');
    const services = await prisma.service.findMany({ select: { id: true } });
    for (const service of services) {
      const location = generateRandomLocation();
      await prisma.service.update({
        where: { id: service.id },
        data: { latitude: location.latitude, longitude: location.longitude }
      });
    }
    console.log(`✓ Updated ${services.length} services`);
    console.log('');

    // Update Shops
    console.log('2️⃣  Updating Shops...');
    const shops = await prisma.shop.findMany({ select: { id: true } });
    for (const shop of shops) {
      const location = generateRandomLocation();
      await prisma.shop.update({
        where: { id: shop.id },
        data: { latitude: location.latitude, longitude: location.longitude }
      });
    }
    console.log(`✓ Updated ${shops.length} shops`);
    console.log('');

    // Update Users
    console.log('3️⃣  Updating Users...');
    const users = await prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
      const location = generateRandomLocation();
      await prisma.user.update({
        where: { id: user.id },
        data: { latitude: location.latitude, longitude: location.longitude }
      });
    }
    console.log(`✓ Updated ${users.length} users`);
    console.log('');

    // Update Products (inherit from shop if shop exists)
    console.log('4️⃣  Updating Products...');
    const products = await prisma.product.findMany({
      select: { id: true, shopId: true },
      include: { shop: { select: { latitude: true, longitude: true } } }
    });
    
    let productCount = 0;
    for (const product of products) {
      let location;
      // If product has a shop with location, use it; otherwise generate random
      if (product.shop?.latitude && product.shop?.longitude) {
        location = {
          latitude: product.shop.latitude,
          longitude: product.shop.longitude
        };
      } else {
        location = generateRandomLocation();
      }
      
      await prisma.product.update({
        where: { id: product.id },
        data: { latitude: location.latitude, longitude: location.longitude }
      });
      productCount++;
    }
    console.log(`✓ Updated ${productCount} products`);
    console.log('');

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ All locations populated successfully!');
    console.log(`📊 Services: ${services.length}`);
    console.log(`📊 Shops: ${shops.length}`);
    console.log(`📊 Users: ${users.length}`);
    console.log(`📊 Products: ${productCount}`);
    console.log('═══════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'all') {
  console.log('🌍 Running in ALL mode - will update shops, services, users, and products');
  console.log('');
  populateAllLocations();
} else if (command === 'services' || !command) {
  console.log('🔧 Running in SERVICES mode - will only update services');
  console.log('💡 Use "npm run populate-locations all" to update all entities');
  console.log('');
  populateServiceLocations();
} else {
  console.log('❌ Invalid command');
  console.log('');
  console.log('Usage:');
  console.log('  node populate-service-locations.js          - Update services only');
  console.log('  node populate-service-locations.js services - Update services only');
  console.log('  node populate-service-locations.js all      - Update all (shops, services, users, products)');
  process.exit(1);
}


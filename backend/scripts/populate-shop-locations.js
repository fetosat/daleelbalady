// Script to populate random location coordinates for shops
// This will set locationLat and locationLon for all shops to random points within Cairo bounds

import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

// Define the bounding box (your specified coordinates)
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
 * Main function to populate shop locations
 */
async function populateShopLocations() {
  try {
    console.log('🏪 Starting to populate shop locations...');
    console.log(`📍 Bounds: Lat [${BOUNDS.minLat}, ${BOUNDS.maxLat}], Long [${BOUNDS.minLong}, ${BOUNDS.maxLong}]`);
    console.log('');

    // Get all shops
    const shops = await prisma.shop.findMany({
      select: {
        id: true,
        name: true,
        locationLat: true,
        locationLon: true
      }
    });

    console.log(`📊 Found ${shops.length} shops`);
    
    if (shops.length === 0) {
      console.log('⚠️  No shops found in database');
      return;
    }

    // Count shops without location
    const shopsWithoutLocation = shops.filter(s => !s.locationLat || !s.locationLon);
    console.log(`📍 Shops without location: ${shopsWithoutLocation.length}`);
    console.log(`✅ Shops with location: ${shops.length - shopsWithoutLocation.length}`);
    console.log('');

    // Ask for confirmation if shops already have locations
    if (shopsWithoutLocation.length < shops.length) {
      console.log('⚠️  Some shops already have locations. This script will:');
      console.log('   - Update ALL shops (including those with existing locations)');
      console.log('   - Assign new random coordinates to ALL shops');
      console.log('');
    }

    // Update all shops with random locations
    let updated = 0;
    let errors = 0;

    console.log('🔄 Updating shops with random locations...');
    console.log('');

    for (const shop of shops) {
      try {
        const location = generateRandomLocation();
        
        await prisma.shop.update({
          where: { id: shop.id },
          data: {
            locationLat: location.latitude,
            locationLon: location.longitude
          }
        });

        updated++;
        
        // Show progress every 10 shops
        if (updated % 10 === 0) {
          console.log(`✓ Updated ${updated}/${shops.length} shops...`);
        }

        // Show first 3 updates with details
        if (updated <= 3) {
          console.log(`  ↳ Shop: ${shop.name?.substring(0, 50) || 'Unnamed'}...`);
          console.log(`    Coordinates: ${location.latitude}, ${location.longitude}`);
        }
      } catch (error) {
        errors++;
        console.error(`✗ Error updating shop ${shop.id}:`, error.message);
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Shop location population complete!');
    console.log(`📊 Total shops: ${shops.length}`);
    console.log(`✓ Successfully updated: ${updated}`);
    console.log(`✗ Errors: ${errors}`);
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('🗺️  You can now view shops on the map in the /find page');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateShopLocations();


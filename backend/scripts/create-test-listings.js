#!/usr/bin/env node
/**
 * Create Test Listings Script
 * 
 * Generates comprehensive test data for all subscription plan types:
 * - FREE Plan: Basic listings with limited features
 * - VERIFICATION Plan: Verified badges and full contact
 * - SERVICES Plan: Booking system and availability
 * - PRODUCTS Plan: E-commerce with inventory
 * 
 * Usage: node scripts/create-test-listings.js
 */

import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Egyptian cities for realistic data
const CITIES = [
  "Cairo", "Alexandria", "Giza", "Shubra El-Kheima", "Port Said",
  "Suez", "Luxor", "Mansoura", "El-Mahalla El-Kubra", "Tanta",
  "Asyut", "Ismailia", "Faiyum", "Zagazig", "Aswan"
];

// Categories and subcategories
const CATEGORIES = {
  healthcare: {
    name: "Healthcare",
    nameAr: "الرعاية الصحية",
    subcategories: ["Cardiology", "Dentistry", "Pediatrics", "General Practice", "Dermatology"]
  },
  education: {
    name: "Education",
    nameAr: "التعليم",
    subcategories: ["Language Courses", "Math Tutoring", "Music Lessons", "Art Classes", "Test Prep"]
  },
  restaurant: {
    name: "Restaurants",
    nameAr: "المطاعم",
    subcategories: ["Egyptian", "Italian", "Chinese", "Fast Food", "Cafes"]
  },
  beauty: {
    name: "Beauty & Wellness",
    nameAr: "الجمال والعافية",
    subcategories: ["Hair Salon", "Spa", "Nail Salon", "Barbershop", "Massage"]
  },
  retail: {
    name: "Retail",
    nameAr: "التجزئة",
    subcategories: ["Clothing", "Electronics", "Books", "Home Goods", "Jewelry"]
  },
  automotive: {
    name: "Automotive",
    nameAr: "السيارات",
    subcategories: ["Car Repair", "Car Wash", "Tire Shop", "Oil Change", "Auto Parts"]
  }
};

// Sample business names for each category
const BUSINESS_NAMES = {
  healthcare: [
    { en: "Dr. Ahmed Hassan - Cardiology Clinic", ar: "د. أحمد حسن - عيادة القلب" },
    { en: "Cairo Dental Center", ar: "مركز القاهرة لطب الأسنان" },
    { en: "Kids Health Pediatrics", ar: "صحة الأطفال لطب الأطفال" },
    { en: "Family Medical Clinic", ar: "عيادة الطب العائلي" }
  ],
  education: [
    { en: "English Excellence Academy", ar: "أكاديمية التفوق في الإنجليزية" },
    { en: "Math Masters Tutoring", ar: "أساتذة الرياضيات للدروس الخصوصية" },
    { en: "Music & Arts School", ar: "مدرسة الموسيقى والفنون" },
    { en: "SAT Prep Center", ar: "مركز التحضير لاختبار SAT" }
  ],
  restaurant: [
    { en: "Al-Masry Restaurant", ar: "مطعم المصري" },
    { en: "Pizza Palace", ar: "قصر البيتزا" },
    { en: "Golden Dragon Chinese", ar: "التنين الذهبي الصيني" },
    { en: "Quick Burger", ar: "برجر سريع" }
  ],
  beauty: [
    { en: "Elegance Hair Salon", ar: "صالون الأناقة للشعر" },
    { en: "Luxury Spa & Wellness", ar: "سبا الفخامة والعافية" },
    { en: "Perfect Nails Studio", ar: "استوديو الأظافر المثالي" },
    { en: "Classic Barbershop", ar: "حلاق كلاسيك" }
  ],
  retail: [
    { en: "Fashion House Boutique", ar: "بوتيك بيت الأزياء" },
    { en: "Tech Electronics Store", ar: "متجر تك للإلكترونيات" },
    { en: "Book Corner Library", ar: "مكتبة ركن الكتاب" },
    { en: "Home Essentials Shop", ar: "محل أساسيات المنزل" }
  ],
  automotive: [
    { en: "Auto Pro Repair Shop", ar: "ورشة أوتو برو للإصلاح" },
    { en: "Shine Car Wash", ar: "غسيل سيارات شاين" },
    { en: "Tire Express Center", ar: "مركز تاير إكسبريس" },
    { en: "Quick Lube Service", ar: "خدمة تغيير الزيت السريع" }
  ]
};

// Generate random phone number
function generatePhone() {
  return `+2010${Math.floor(10000000 + Math.random() * 90000000)}`;
}

// Generate random coordinates within Egypt
function generateEgyptCoordinates() {
  return {
    lat: 30.0444 + (Math.random() - 0.5) * 0.5,
    lon: 31.2357 + (Math.random() - 0.5) * 0.5
  };
}

// Generate realistic description
function generateDescription(category, name) {
  const descriptions = {
    healthcare: `We provide professional ${category} services with experienced doctors and modern equipment. Our clinic is dedicated to your health and wellbeing.`,
    education: `Expert tutoring and teaching services for all ages. We help students achieve their academic goals with personalized attention.`,
    restaurant: `Delicious ${category} cuisine prepared with fresh ingredients. Experience authentic flavors in a comfortable atmosphere.`,
    beauty: `Professional ${category} services using premium products. Our skilled team ensures you look and feel your best.`,
    retail: `Quality ${category} products at competitive prices. We offer a wide selection to meet all your needs.`,
    automotive: `Professional ${category} services for all vehicle makes and models. Quick, reliable, and affordable.`
  };
  
  const key = Object.keys(CATEGORIES).find(k => 
    CATEGORIES[k].subcategories.some(sc => sc === category)
  );
  
  return descriptions[key] || `Professional ${category} services in Egypt.`;
}

// Create a user with specific plan
async function createTestUser(planType, index) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("test123456", salt);
  
  const email = `${planType.toLowerCase()}-user-${index}@daleelbalady.com`;
  
  try {
    return await prisma.user.create({
      data: {
        name: `${planType} Plan User ${index}`,
        email,
        phone: generatePhone(),
        password: hashedPassword,
        role: planType === "FREE" ? "CUSTOMER" : "PROVIDER",
        isVerified: planType !== "FREE",
        verifiedBadge: planType !== "FREE" ? "verified_business" : null,
        bio: `Test user for ${planType} plan testing and demonstration`,
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      // User exists, fetch and return
      return await prisma.user.findUnique({ where: { email } });
    }
    throw error;
  }
}

// Create FREE plan listing
async function createFreeListing(user, category, subcategory, businessName, city) {
  const coords = generateEgyptCoordinates();
  const description = generateDescription(subcategory, businessName.en);
  
  // Create translation first
  const translation = await prisma.service_translation.create({
    data: {
      name_en: businessName.en,
      name_ar: businessName.ar,
      description_en: description,
      description_ar: `خدمات ${businessName.ar} المهنية في مصر`
    }
  });
  
  const service = await prisma.service.create({
    data: {
      city,
      locationLat: coords.lat,
      locationLon: coords.lon,
      phone: generatePhone(),
      embeddingText: `${businessName.en} ${subcategory} ${city} ${description}`,
      coverImage: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=800&h=400`,
      logoImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName.en)}&size=200`,
      ownerUserId: user.id,
      translationId: translation.id
    }
  });

  // Add some reviews
  await createReviews(service.id, 'service');

  console.log(`✅ Created FREE listing: ${businessName.en}`);
  return service;
}

// Create VERIFICATION plan listing
async function createVerifiedListing(user, category, subcategory, businessName, city) {
  const coords = generateEgyptCoordinates();
  const description = generateDescription(subcategory, businessName.en);
  
  // Create shop for verified listings (shops have email, website, etc.)
  const shop = await prisma.shop.create({
    data: {
      name: businessName.en,
      description,
      city,
      locationLat: coords.lat,
      locationLon: coords.lon,
      phone: generatePhone(),
      email: `contact@${businessName.en.toLowerCase().replace(/\s+/g, '')}.com`,
      website: `https://www.${businessName.en.toLowerCase().replace(/\s+/g, '')}.com`,
      coverImage: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=800&h=400`,
      logoImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName.en)}&size=200`,
      ownerId: user.id,
      isVerified: true
    }
  });
  
  // Create translation
  const translation = await prisma.service_translation.create({
    data: {
      name_en: businessName.en,
      name_ar: businessName.ar,
      description_en: description,
      description_ar: `خدمات ${businessName.ar} المهنية والموثوقة`
    }
  });
  
  // Create service linked to shop
  const service = await prisma.service.create({
    data: {
      city,
      locationLat: coords.lat,
      locationLon: coords.lon,
      phone: generatePhone(),
      embeddingText: `${businessName.en} ${subcategory} ${city} verified ${description}`,
      coverImage: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=800&h=400`,
      logoImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName.en)}&size=200`,
      shopId: shop.id,
      translationId: translation.id
    }
  });

  // Create provider subscription (using proper BASIC_FREE enum value)
  await prisma.providerSubscription.create({
    data: {
      providerId: user.id,
      planType: "BASIC_FREE",
      pricePerYear: 0,
      canTakeBookings: false,
      canListProducts: false,
      isActive: true
    }
  });

  await createReviews(service.id, 'service');

  console.log(`✅ Created VERIFIED listing: ${businessName.en}`);
  return service;
}

// Create SERVICES plan listing with booking
async function createServicesListing(user, category, subcategory, businessName, city) {
  const coords = generateEgyptCoordinates();
  const description = generateDescription(subcategory, businessName.en);
  const price = Math.floor(Math.random() * 500) + 100;
  
  // Create shop for service with booking
  const shop = await prisma.shop.create({
    data: {
      name: businessName.en,
      description,
      city,
      locationLat: coords.lat,
      locationLon: coords.lon,
      phone: generatePhone(),
      email: `bookings@${businessName.en.toLowerCase().replace(/\s+/g, '')}.com`,
      website: `https://www.${businessName.en.toLowerCase().replace(/\s+/g, '')}.com`,
      coverImage: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=800&h=400`,
      logoImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName.en)}&size=200`,
      ownerId: user.id,
      isVerified: true
    }
  });
  
  // Create translation
  const translation = await prisma.service_translation.create({
    data: {
      name_en: businessName.en,
      name_ar: businessName.ar,
      description_en: description,
      description_ar: `خدمات ${businessName.ar} مع نظام الحجز المتقدم`
    }
  });
  
  // Create service with booking capabilities
  const service = await prisma.service.create({
    data: {
      city,
      locationLat: coords.lat,
      locationLon: coords.lon,
      phone: generatePhone(),
      embeddingText: `${businessName.en} ${subcategory} ${city} booking service ${price} EGP ${description}`,
      price,
      currency: "EGP",
      durationMins: 45,
      coverImage: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=800&h=400`,
      logoImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName.en)}&size=200`,
      shopId: shop.id,
      translationId: translation.id
    }
  });

  // Create provider subscription with booking enabled (using BOOKING_BASIC enum)
  await prisma.providerSubscription.create({
    data: {
      providerId: user.id,
      planType: "BOOKING_BASIC",
      pricePerYear: 1000,
      canTakeBookings: true,
      canListProducts: false,
      isActive: true
    }
  });

  // Create availability schedule
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  for (const day of days) {
    await prisma.serviceAvailability.create({
      data: {
        serviceId: service.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        isRecurring: true
      }
    });
  }

  await createReviews(service.id, 'service');

  console.log(`✅ Created SERVICES listing with booking: ${businessName.en}`);
  return service;
}

// Create PRODUCTS plan listing with shop
async function createProductsListing(user, category, subcategory, businessName, city) {
  const coords = generateEgyptCoordinates();
  
  // Create Shop (note: using existing address field pattern from DB)
  const shop = await prisma.shop.create({
    data: {
      name: businessName.en,
      slug: businessName.en.toLowerCase().replace(/\s+/g, '-'),
      description: generateDescription(subcategory, businessName.en),
      city,
      locationLat: coords.lat,
      locationLon: coords.lon,
      phone: generatePhone(),
      email: `shop@${businessName.en.toLowerCase().replace(/\s+/g, '')}.com`,
      logoImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName.en)}&size=200`,
      coverImage: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=800&h=400`,
      ownerId: user.id,
      isVerified: true
    }
  });

  // Create provider subscription with products enabled (using PRODUCTS_PREMIUM enum)
  await prisma.providerSubscription.create({
    data: {
      providerId: user.id,
      planType: "PRODUCTS_PREMIUM",
      pricePerYear: 2000,
      canTakeBookings: true,
      canListProducts: true,
      isActive: true
    }
  });

  // Create sample products
  const productCount = Math.floor(Math.random() * 5) + 3; // 3-7 products
  for (let i = 0; i < productCount; i++) {
    const price = Math.floor(Math.random() * 1000) + 50;
    
    await prisma.product.create({
      data: {
        name: `${subcategory} Product ${i + 1}`,
        description: `High-quality ${subcategory.toLowerCase()} product from ${businessName.en}. Brand: ${businessName.en}, Origin: Egypt, Quality: Premium, Warranty: 1 Year`,
        price,
        currency: "EGP",
        stock: Math.floor(Math.random() * 100) + 10,
        sku: `SKU-${Date.now()}-${i}`,
        isActive: true,
        embeddingText: `${subcategory} Product ${i + 1} from ${businessName.en} in ${city}`,
        shopId: shop.id,
        listerId: user.id
      }
    });
  }

  await createReviews(shop.id, 'shop');

  console.log(`✅ Created PRODUCTS listing with ${productCount} products: ${businessName.en}`);
  return shop;
}

// Create sample reviews
async function createReviews(entityId, entityType) {
  const reviewCount = Math.floor(Math.random() * 5) + 2; // 2-6 reviews
  
  const comments = [
    "Excellent service! Very professional and friendly staff.",
    "Great experience, highly recommended!",
    "Very satisfied with the quality and service.",
    "Professional and reliable, will definitely come back.",
    "Outstanding service, exceeded my expectations!",
    "Good value for money, quality service.",
    "Friendly staff and clean environment.",
    "Quick service and great results!"
  ];

  for (let i = 0; i < reviewCount; i++) {
    try {
      // Create a reviewer user for each review
      const reviewer = await prisma.user.create({
        data: {
          name: `Reviewer ${Math.floor(Math.random() * 10000)}`,
          email: `reviewer-${Date.now()}-${i}@test.com`,
          phone: generatePhone(),
          role: "CUSTOMER"
        }
      });
      
      const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
      
      const reviewData = {
        rating,
        comment: comments[Math.floor(Math.random() * comments.length)],
        authorId: reviewer.id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Within last 30 days
      };

      if (entityType === 'service') {
        reviewData.serviceId = entityId;
      } else if (entityType === 'shop') {
        reviewData.shopId = entityId;
      }

      await prisma.review.create({ data: reviewData });
    } catch (error) {
      console.error(`Error creating review: ${error.message}`);
    }
  }
}

// Main function
async function main() {
  console.log("🚀 Starting test listings generation...\n");

  const categories = Object.keys(CATEGORIES);
  let listingCount = 0;

  // Create listings for each plan type
  const planTypes = ["FREE", "VERIFICATION", "SERVICES", "PRODUCTS"];
  
  for (const planType of planTypes) {
    console.log(`\n📋 Creating ${planType} Plan Listings...\n`);
    
    // Create 4 listings per plan type (one from each major category)
    for (let i = 0; i < 4; i++) {
      const categoryKey = categories[i % categories.length];
      const category = CATEGORIES[categoryKey];
      const subcategory = category.subcategories[Math.floor(Math.random() * category.subcategories.length)];
      const businessNames = BUSINESS_NAMES[categoryKey];
      const businessName = businessNames[Math.floor(Math.random() * businessNames.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];

      try {
        // Create user
        const user = await createTestUser(planType, i + 1);

        // Create listing based on plan type
        if (planType === "FREE") {
          await createFreeListing(user, categoryKey, subcategory, businessName, city);
        } else if (planType === "VERIFICATION") {
          await createVerifiedListing(user, categoryKey, subcategory, businessName, city);
        } else if (planType === "SERVICES") {
          await createServicesListing(user, categoryKey, subcategory, businessName, city);
        } else if (planType === "PRODUCTS") {
          await createProductsListing(user, categoryKey, subcategory, businessName, city);
        }

        listingCount++;
      } catch (error) {
        console.error(`❌ Error creating ${planType} listing:`, error.message);
      }
    }
  }

  console.log(`\n✨ Successfully created ${listingCount} test listings!`);
  console.log("\n📊 Summary:");
  console.log("- FREE Plan: 4 listings (basic info, masked contact)");
  console.log("- VERIFICATION Plan: 4 listings (verified badge, full contact)");
  console.log("- SERVICES Plan: 4 listings (booking system, availability)");
  console.log("- PRODUCTS Plan: 4 shops with products (e-commerce)");
  console.log("\n🔐 Test User Credentials:");
  console.log("Password for all test users: test123456");
  console.log("\nEmails:");
  planTypes.forEach((plan, i) => {
    console.log(`  ${plan}: ${plan.toLowerCase()}-user-1@daleelbalady.com`);
  });
}

// Run script
main()
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


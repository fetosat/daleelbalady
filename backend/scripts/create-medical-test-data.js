import { PrismaClient } from '../generated/prisma/client.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🏥 Creating Medical Design Test Data...\n');

  try {
    // 1 & 2. Create Medical Design and Category together (handling circular dependency)
    console.log('📐📁 Creating medical design and category together...');
    
    // Use a transaction to create both and link them
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create a temporary/placeholder ID for the design
      const tempCategoryId = 'temp-category-id';
      
      // Step 2: Create the design with a temporary categoryId
      const design = await tx.design.create({
        data: {
          name: 'Medical & Healthcare',
          description: 'Professional healthcare design with doctor profiles, specialty badges, and medical-focused UI',
          slug: 'medical',
          categoryId: tempCategoryId, // temporary value
        }
      });
      
      // Step 3: Create the category linked to the design
      const category = await tx.category.create({
        data: {
          name: 'Medical Services',
          slug: 'medical-services',
          description: 'Healthcare providers, doctors, and medical services',
          position: 1,
          designId: design.id,
        }
      });
      
      // Step 4: Update the design with the real category ID
      const updatedDesign = await tx.design.update({
        where: { id: design.id },
        data: { categoryId: category.id }
      });
      
      return { design: updatedDesign, category };
    });
    
    const medicalDesign = result.design;
    const medicalCategory = result.category;
    
    console.log(`✅ Medical design created: ${medicalDesign.id}`);
    console.log(`✅ Medical category created: ${medicalCategory.id}\n`);

    // 3. Create Medical Subcategories
    console.log('📂 Creating subcategories...');
    const cardiology = await prisma.subCategory.create({
      data: {
        name: 'Cardiology',
        slug: 'cardiology',
        categoryId: medicalCategory.id,
      }
    });
    const pediatrics = await prisma.subCategory.create({
      data: {
        name: 'Pediatrics',
        slug: 'pediatrics',
        categoryId: medicalCategory.id,
      }
    });
    console.log(`✅ Subcategories created\n`);

    // 4. Create Test Doctor User
    console.log('👨‍⚕️ Creating test doctor user...');
    const hashedPassword = await bcrypt.hash('doctor123', 10);
    const doctorUser = await prisma.user.create({
      data: {
        name: 'Dr. Ahmed Hassan',
        email: 'ahmed.hassan@medical.test',
        password: hashedPassword,
        phone: '+20 10 1234 5678',
        role: 'PROVIDER',
        bio: 'Experienced cardiologist with 15+ years of practice. Specialized in preventive cardiology and heart disease management.',
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBadge: 'verified_doctor',
        profilePic: 'https://i.pravatar.cc/300?img=12',
        coverImage: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200',
      }
    });
    console.log(`✅ Doctor user created: ${doctorUser.id}\n`);

    // 5. Create Provider Subscription
    console.log('💳 Creating provider subscription...');
    await prisma.providerSubscription.create({
      data: {
        providerId: doctorUser.id,
        planType: 'PRODUCTS_PREMIUM',
        pricePerYear: 2000,
        currency: 'EGP',
        canTakeBookings: true,
        canListProducts: true,
        searchPriority: 5,
        hasPriorityBadge: true,
        isActive: true,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      }
    });
    console.log(`✅ Provider subscription created\n`);

    // 6. Create Service Translation
    console.log('🌐 Creating service translation...');
    const serviceTranslation = await prisma.service_translation.create({
      data: {
        name_en: 'Cardiology Consultation',
        name_ar: 'استشارة أمراض القلب',
        description_en: 'Comprehensive cardiac evaluation including ECG, echocardiogram review, and personalized treatment plans. Available for clinic visits, home visits, and video consultations.',
        description_ar: 'تقييم شامل للقلب بما في ذلك تخطيط القلب ومراجعة صدى القلب وخطط العلاج الشخصية. متاح لزيارات العيادة والزيارات المنزلية والاستشارات عبر الفيديو.'
      }
    });

    // 7. Create Medical Service
    console.log('⚕️ Creating medical service...');
    const medicalService = await prisma.service.create({
      data: {
        translationId: serviceTranslation.id,
        embeddingText: 'Cardiology Consultation Dr Ahmed Hassan Heart Doctor Cardiac Care ECG Echocardiogram Cairo استشارة أمراض القلب',
        phone: '+20 10 1234 5678',
        city: 'Cairo',
        locationLat: 30.0444,
        locationLon: 31.2357,
        price: 500,
        currency: 'EGP',
        durationMins: 30,
        available: true,
        coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
        logoImage: 'https://i.pravatar.cc/300?img=12',
        ownerUserId: doctorUser.id,
        designId: medicalDesign.id,
        category: {
          connect: { id: medicalCategory.id }
        },
        subCategoryId: cardiology.id,
      }
    });
    console.log(`✅ Medical service created: ${medicalService.id}\n`);

    // 8. Create Service Availability
    console.log('📅 Creating service availability...');
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
    for (const day of days) {
      await prisma.serviceAvailability.create({
        data: {
          serviceId: medicalService.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          timezone: 'Africa/Cairo',
          isRecurring: true,
        }
      });
    }
    console.log(`✅ Service availability created\n`);

    // 9. Create Medical Shop (Pharmacy)
    console.log('🏥 Creating pharmacy/clinic...');
    const medicalShop = await prisma.shop.create({
      data: {
        name: 'City Medical Center & Pharmacy',
        slug: 'city-medical-center',
        description: 'Full-service medical center with pharmacy, laboratory services, and specialist consultations. Open 24/7 for emergencies.',
        phone: '+20 2 1234 5678',
        email: 'info@citymedicenter.test',
        website: 'https://citymedicenter.test',
        city: 'Cairo',
        locationLat: 30.0444,
        locationLon: 31.2357,
        coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200',
        logoImage: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=300',
        isVerified: true,
        ownerId: doctorUser.id,
        designId: medicalDesign.id,
      }
    });
    console.log(`✅ Pharmacy created: ${medicalShop.id}\n`);

    // 10. Create Medical Products
    console.log('💊 Creating medical products...');
    
    const products = [
      {
        name: 'Paracetamol 500mg',
        description: 'Pain reliever and fever reducer. 20 tablets per pack.',
        price: 25,
        stock: 150,
        sku: 'MED-PARA-500',
      },
      {
        name: 'Amoxicillin 500mg',
        description: 'Antibiotic for bacterial infections. Prescription required. 21 capsules.',
        price: 120,
        stock: 50,
        sku: 'MED-AMOX-500',
      },
      {
        name: 'Vitamin D3 5000 IU',
        description: 'Vitamin D supplement. 60 capsules per bottle.',
        price: 180,
        stock: 80,
        sku: 'MED-VITD-5000',
      },
      {
        name: 'Omeprazole 20mg',
        description: 'Reduces stomach acid. For ulcers and GERD. 28 capsules.',
        price: 85,
        stock: 120,
        sku: 'MED-OMEP-20',
      }
    ];

    for (const product of products) {
      await prisma.product.create({
        data: {
          ...product,
          currency: 'EGP',
          isActive: true,
          shopId: medicalShop.id,
          listerId: doctorUser.id,
          designId: medicalDesign.id,
          embeddingText: `${product.name} ${product.description} medication medicine pharmacy`,
        }
      });
    }
    console.log(`✅ ${products.length} products created\n`);

    // 11. Create Medical Tags
    console.log('🏷️ Creating medical tags...');
    const tagNames = ['cardiology', 'consultation', 'ecg', 'heart-health', 'preventive-care'];
    for (const tagName of tagNames) {
      await prisma.tags.create({
        data: { name: tagName }
      });
    }
    console.log(`✅ Tags created\n`);

    // 12. Create Sample Reviews
    console.log('⭐ Creating sample reviews...');
    
    // Create a customer user for reviews
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await prisma.user.create({
      data: {
        name: 'Sarah Ahmed',
        email: 'sarah.ahmed@test.com',
        password: customerPassword,
        phone: '+20 11 9876 5432',
        role: 'CUSTOMER',
        profilePic: 'https://i.pravatar.cc/300?img=5',
      }
    });

    await prisma.review.create({
      data: {
        authorId: customer.id,
        serviceId: medicalService.id,
        rating: 5,
        comment: 'Excellent doctor! Very professional and thorough. Dr. Hassan took the time to explain everything and made me feel comfortable. Highly recommended!',
        isVerified: true,
      }
    });

    await prisma.review.create({
      data: {
        authorId: customer.id,
        shopId: medicalShop.id,
        rating: 5,
        comment: 'Great pharmacy with a wide selection of medications. Staff is very helpful and knowledgeable. Clean facility and good prices.',
        isVerified: true,
      }
    });

    console.log(`✅ Reviews created\n`);

    // 13. Create Another Doctor with Different Specialty
    console.log('👨‍⚕️ Creating pediatrician...');
    const pediatrician = await prisma.user.create({
      data: {
        name: 'Dr. Mona Khalil',
        email: 'mona.khalil@medical.test',
        password: hashedPassword,
        phone: '+20 12 3456 7890',
        role: 'PROVIDER',
        bio: 'Pediatrician specializing in child development and preventive care. 10 years of experience with newborns and children.',
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBadge: 'verified_doctor',
        profilePic: 'https://i.pravatar.cc/300?img=47',
      }
    });

    await prisma.providerSubscription.create({
      data: {
        providerId: pediatrician.id,
        planType: 'BOOKING_BASIC',
        pricePerYear: 1000,
        canTakeBookings: true,
        canListProducts: false,
        searchPriority: 3,
        isActive: true,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }
    });

    const pediatricTranslation = await prisma.service_translation.create({
      data: {
        name_en: 'Pediatric Consultation',
        name_ar: 'استشارة طب الأطفال',
        description_en: 'Comprehensive child health check-ups, vaccinations, and developmental assessments. Child-friendly environment.',
        description_ar: 'فحوصات صحية شاملة للأطفال، تطعيمات، وتقييمات النمو. بيئة صديقة للطفل.'
      }
    });

    await prisma.service.create({
      data: {
        translationId: pediatricTranslation.id,
        embeddingText: 'Pediatric Consultation Dr Mona Khalil Children Kids Doctor Vaccinations Cairo طب الأطفال',
        phone: '+20 12 3456 7890',
        city: 'Cairo',
        locationLat: 30.0626,
        locationLon: 31.2497,
        price: 400,
        currency: 'EGP',
        durationMins: 45,
        available: true,
        coverImage: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800',
        logoImage: 'https://i.pravatar.cc/300?img=47',
        ownerUserId: pediatrician.id,
        designId: medicalDesign.id,
        category: {
          connect: { id: medicalCategory.id }
        },
        subCategoryId: pediatrics.id,
      }
    });

    console.log(`✅ Pediatrician created\n`);

    // Summary
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 Medical Test Data Created Successfully!\n');
    console.log('📊 Summary:');
    console.log(`   ✅ Design: medical (${medicalDesign.id})`);
    console.log(`   ✅ Category: Medical Services`);
    console.log(`   ✅ Subcategories: 2 (Cardiology, Pediatrics)`);
    console.log(`   ✅ Doctors: 2 (Cardiologist, Pediatrician)`);
    console.log(`   ✅ Services: 2 (Both with medical design)`);
    console.log(`   ✅ Pharmacy: 1 (City Medical Center)`);
    console.log(`   ✅ Products: 4 (Medications with medical design)`);
    console.log(`   ✅ Reviews: 2`);
    console.log(`   ✅ Customer: 1 (for reviews)`);
    console.log('\n📧 Test Accounts:');
    console.log('   Doctor 1: ahmed.hassan@medical.test / doctor123');
    console.log('   Doctor 2: mona.khalil@medical.test / doctor123');
    console.log('   Customer: sarah.ahmed@test.com / customer123');
    console.log('\n🔗 URLs to test:');
    console.log(`   Service: /listing/${medicalService.id}`);
    console.log(`   Shop: /shop/${medicalShop.slug}`);
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });


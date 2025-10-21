import { PrismaClient } from './generated/prisma/client.js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createSampleService() {
  try {
    console.log('Creating sample service...');
    
    // First, ensure we have a user to own the service
    let user = await prisma.user.findFirst({
      where: { role: 'PROVIDER' }
    });
    
    if (!user) {
      console.log('Creating sample user...');
      user = await prisma.user.create({
        data: {
          name: 'Dr. Ahmed Hassan',
          email: 'dr.ahmed@example.com',
          password: 'sample123',
          role: 'PROVIDER',
          phone: '+201234567890',
          bio: 'Experienced medical professional',
          isVerified: true,
        }
      });
    }
    
    // Create service translation
    console.log('Creating service translation...');
    const translation = await prisma.service_translation.create({
      data: {
        name_en: 'Medical Consultation',
        name_ar: 'استشارة طبية',
        description_en: 'Professional medical consultation with experienced doctor. Full examination and diagnosis.',
        description_ar: 'استشارة طبية مع طبيب ذو خبرة. فحص شامل وتشخيص دقيق.'
      }
    });
    
    // Create service
    console.log('Creating service...');
    const service = await prisma.service.create({
      data: {
        ownerUserId: user.id,
        translationId: translation.id,
        price: 200.0,
        currency: 'EGP',
        durationMins: 30,
        city: 'Cairo',
        locationLat: 30.0444,
        locationLon: 31.2357,
        available: true,
        embeddingText: 'Medical consultation doctor healthcare examination diagnosis treatment'
      }
    });
    
    // Create availability schedule
    console.log('Creating availability schedule...');
    await prisma.serviceAvailability.create({
      data: {
        serviceId: service.id,
        dayOfWeek: 'SUNDAY',
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'Africa/Cairo',
        isRecurring: true
      }
    });
    
    await prisma.serviceAvailability.create({
      data: {
        serviceId: service.id,
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'Africa/Cairo',
        isRecurring: true
      }
    });
    
    console.log('✅ Sample service created successfully!');
    console.log('Service ID:', service.id);
    console.log('Test the endpoint with: GET /api/services/' + service.id);
    
    // Create a few more services for testing
    const services = [];
    for (let i = 1; i <= 3; i++) {
      const trans = await prisma.service_translation.create({
        data: {
          name_en: `Test Service ${i}`,
          name_ar: `خدمة تجريبية ${i}`,
          description_en: `This is test service number ${i} for API testing.`,
          description_ar: `هذه خدمة تجريبية رقم ${i} لاختبار API.`
        }
      });
      
      const srv = await prisma.service.create({
        data: {
          ownerUserId: user.id,
          translationId: trans.id,
          price: 100.0 + (i * 50),
          currency: 'EGP',
          durationMins: 45,
          city: i === 1 ? 'Cairo' : i === 2 ? 'Alexandria' : 'Giza',
          locationLat: 30.0444 + (i * 0.1),
          locationLon: 31.2357 + (i * 0.1),
          available: true,
          embeddingText: `Test service ${i} sample data for API testing`
        }
      });
      
      services.push(srv);
    }
    
    console.log('✅ Additional test services created:');
    services.forEach((srv, index) => {
      console.log(`Service ${index + 2} ID: ${srv.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating sample service:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSampleService();
}

export { createSampleService };

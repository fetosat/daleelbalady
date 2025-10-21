import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

async function createSampleOffers() {
  console.log('🎯 Creating sample offers...');

  try {
    // First, let's find a provider user and a category
    const provider = await prisma.user.findFirst({
      where: { role: 'PROVIDER' }
    });

    if (!provider) {
      console.error('❌ No provider user found. Please create a provider user first.');
      return;
    }

    const category = await prisma.category.findFirst();
    
    if (!category) {
      console.error('❌ No category found. Please create categories first.');
      return;
    }

    console.log(`✅ Found provider: ${provider.name} (${provider.id})`);
    console.log(`✅ Found category: ${category.name} (${category.id})`);

    // Sample Offer 1: Percentage Discount
    const offer1 = await prisma.offer.create({
      data: {
        title: 'خصم 25% على جميع الخدمات الطبية',
        description: 'احصل على خصم 25% على جميع الخدمات الطبية المتاحة. العرض ساري لمدة محدودة فقط!',
        shortDescription: 'خصم 25% على الخدمات الطبية',
        level: 'PREMIUM',
        targetType: 'SERVICE',
        discountType: 'PERCENTAGE',
        discountValue: 25,
        maxDiscountAmount: 500,
        minPurchaseAmount: 100,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        maxTotalUsage: 100,
        currentUsage: 0,
        maxUsagePerUser: 3,
        isActive: true,
        isExclusive: true,
        requiresPlan: true,
        providerId: provider.id,
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=400&fit=crop',
        backgroundColor: '#3B82F6',
        textColor: '#FFFFFF',
        categories: {
          connect: { id: category.id }
        }
      }
    });

    console.log(`✅ Created offer 1: ${offer1.title}`);

    // Sample Offer 2: Fixed Amount Discount
    const offer2 = await prisma.offer.create({
      data: {
        title: 'وفر 100 جنيه على خدمات الصيانة',
        description: 'احصل على خصم فوري 100 جنيه عند حجز أي خدمة صيانة. صالح لجميع أنواع الصيانة المنزلية والسيارات.',
        shortDescription: 'خصم 100 جنيه على الصيانة',
        level: 'STANDARD',
        targetType: 'SERVICE',
        discountType: 'FIXED_AMOUNT',
        discountValue: 100,
        minPurchaseAmount: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        maxTotalUsage: 200,
        currentUsage: 0,
        maxUsagePerUser: 5,
        isActive: true,
        isExclusive: false,
        requiresPlan: true,
        providerId: provider.id,
        imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=400&fit=crop',
        backgroundColor: '#10B981',
        textColor: '#FFFFFF',
        categories: {
          connect: { id: category.id }
        }
      }
    });

    console.log(`✅ Created offer 2: ${offer2.title}`);

    // Sample Offer 3: Exclusive Premium Offer
    const offer3 = await prisma.offer.create({
      data: {
        title: 'عرض حصري: خصم 40% على المطاعم الفاخرة',
        description: 'عرض حصري لأعضائنا المميزين! استمتع بخصم 40% في مجموعة مختارة من أفضل المطاعم. احجز الآن!',
        shortDescription: 'خصم 40% حصري على المطاعم',
        level: 'EXCLUSIVE',
        targetType: 'SERVICE',
        discountType: 'PERCENTAGE',
        discountValue: 40,
        maxDiscountAmount: 300,
        minPurchaseAmount: 150,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        validDays: JSON.stringify(['THURSDAY', 'FRIDAY', 'SATURDAY']),
        validTimeFrom: '18:00',
        validTimeTo: '23:59',
        maxTotalUsage: 50,
        currentUsage: 0,
        maxUsagePerUser: 2,
        isActive: true,
        isExclusive: true,
        requiresPlan: true,
        providerId: provider.id,
        imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=400&fit=crop',
        backgroundColor: '#8B5CF6',
        textColor: '#FFFFFF',
        categories: {
          connect: { id: category.id }
        }
      }
    });

    console.log(`✅ Created offer 3: ${offer3.title}`);

    console.log('\n🎉 Successfully created 3 sample offers!');
    console.log('\nOffer IDs:');
    console.log(`1. ${offer1.id} - ${offer1.title}`);
    console.log(`2. ${offer2.id} - ${offer2.title}`);
    console.log(`3. ${offer3.id} - ${offer3.title}`);

  } catch (error) {
    console.error('❌ Error creating sample offers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSampleOffers()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

const rewards = [
  {
    title: '10% Discount',
    titleAr: 'خصم 10%',
    description: 'Get 10% discount on your next booking',
    descriptionAr: 'احصل على خصم 10% على حجزك القادم',
    pointsRequired: 50,
    rewardType: 'DISCOUNT_PERCENTAGE',
    rewardValue: JSON.stringify({ percentage: 10, maxAmount: 100 }),
    isActive: true
  },
  {
    title: '20% Discount',
    titleAr: 'خصم 20%',
    description: 'Get 20% discount on your next booking',
    descriptionAr: 'احصل على خصم 20% على حجزك القادم',
    pointsRequired: 100,
    rewardType: 'DISCOUNT_PERCENTAGE',
    rewardValue: JSON.stringify({ percentage: 20, maxAmount: 200 }),
    isActive: true
  },
  {
    title: 'Free Month',
    titleAr: 'شهر مجاني',
    description: 'Get one free month of family subscription',
    descriptionAr: 'احصل على شهر واحد مجاني من الاشتراك العائلي',
    pointsRequired: 200,
    rewardType: 'FREE_MONTH',
    rewardValue: JSON.stringify({ months: 1 }),
    isActive: true
  },
  {
    title: 'VIP Upgrade',
    titleAr: 'ترقية VIP',
    description: 'Upgrade to VIP subscription for 3 months',
    descriptionAr: 'ترقية إلى اشتراك VIP لمدة 3 أشهر',
    pointsRequired: 500,
    rewardType: 'UPGRADE',
    rewardValue: JSON.stringify({ plan: 'VIP', months: 3 }),
    isActive: true
  },
  {
    title: 'EGP 50 Credit',
    titleAr: 'رصيد 50 جنيه',
    description: 'Get EGP 50 credit for services and products',
    descriptionAr: 'احصل على رصيد 50 جنيه للخدمات والمنتجات',
    pointsRequired: 150,
    rewardType: 'DISCOUNT_FIXED',
    rewardValue: JSON.stringify({ amount: 50, currency: 'EGP' }),
    isActive: true
  },
  {
    title: 'EGP 100 Credit',
    titleAr: 'رصيد 100 جنيه',
    description: 'Get EGP 100 credit for services and products',
    descriptionAr: 'احصل على رصيد 100 جنيه للخدمات والمنتجات',
    pointsRequired: 300,
    rewardType: 'DISCOUNT_FIXED',
    rewardValue: JSON.stringify({ amount: 100, currency: 'EGP' }),
    isActive: true
  }
];

async function main() {
  console.log('🌱 Seeding rewards...');

  for (const reward of rewards) {
    const created = await prisma.reward.upsert({
      where: { title: reward.title },
      update: reward,
      create: reward
    });
    console.log(`✅ Created/Updated reward: ${created.titleAr}`);
  }

  console.log('✅ Rewards seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding rewards:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import { PrismaClient } from './generated/prisma/index.js';
const prisma = new PrismaClient();

async function checkUserDesign() {
  const userId = 'b0e9682e-5374-4b87-821e-c47302d19e86';
  console.log(`🔍 Checking data for user: ${userId}`);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      services: {
        select: {
          id: true,
          embeddingText: true,
          design: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  console.log('\n=== User Data ===');
  console.log(JSON.stringify(user, null, 2));

  if (user && user.services.length > 0) {
    console.log('\n✅ This user has services. The backend API should be modified to include the design slug from one of these services.');
  } else {
    console.log('\n⚠️ This user has no services. Please ensure this user has a service with the medical design assigned.');
  }

  await prisma.$disconnect();
}

checkUserDesign().catch(console.error);


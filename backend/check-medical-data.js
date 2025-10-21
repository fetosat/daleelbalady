import { PrismaClient } from './generated/prisma/index.js';
const prisma = new PrismaClient();

async function checkMedicalData() {
  console.log('=== Checking Design Table ===');
  const designs = await prisma.design.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      categoryId: true
    }
  });
  console.log('Designs:', JSON.stringify(designs, null, 2));

  console.log('\n=== Checking Categories ===');
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      designId: true
    }
  });
  console.log('Categories:', JSON.stringify(categories, null, 2));

  console.log('\n=== Checking for Medical Design ===');
  const medicalDesign = await prisma.design.findFirst({
    where: {
      slug: 'medical'
    },
    include: {
      Category: true
    }
  });
  console.log('Medical Design:', JSON.stringify(medicalDesign, null, 2));

  console.log('\n=== Checking Services/Shops/Products with NULL designId ===');
  
  const servicesWithoutDesign = await prisma.service.findMany({
    where: {
      OR: [
        { designId: null },
        { design: { slug: 'medical' } }
      ]
    },
    select: {
      id: true,
      embeddingText: true,
      designId: true,
      design: {
        select: { name: true, slug: true }
      }
    },
    take: 10
  });
  console.log('Services (sample):', JSON.stringify(servicesWithoutDesign, null, 2));

  const shopsWithoutDesign = await prisma.shop.findMany({
    where: {
      OR: [
        { designId: null },
        { design: { slug: 'medical' } }
      ]
    },
    select: {
      id: true,
      name: true,
      designId: true,
      design: {
        select: { name: true, slug: true }
      }
    },
    take: 10
  });
  console.log('Shops (sample):', JSON.stringify(shopsWithoutDesign, null, 2));

  const productsWithoutDesign = await prisma.product.findMany({
    where: {
      OR: [
        { designId: null },
        { design: { slug: 'medical' } }
      ]
    },
    select: {
      id: true,
      name: true,
      designId: true,
      design: {
        select: { name: true, slug: true }
      }
    },
    take: 10
  });
  console.log('Products (sample):', JSON.stringify(productsWithoutDesign, null, 2));

  await prisma.$disconnect();
}

checkMedicalData().catch(console.error);


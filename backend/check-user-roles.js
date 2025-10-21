import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient();

async function checkUserRoles() {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        name: true, 
        email: true, 
        phone: true, 
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('All users and their roles:');
    console.table(users);
    
    // Check for specific email/phone if provided as argument
    const searchTerm = process.argv[2];
    if (searchTerm) {
      const specificUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { contains: searchTerm } },
            { phone: { contains: searchTerm } },
            { name: { contains: searchTerm } }
          ]
        }
      });
      
      if (specificUser) {
        console.log('\nSpecific user found:');
        console.log(specificUser);
      } else {
        console.log(`\nNo user found matching: ${searchTerm}`);
      }
    }
    
  } catch (error) {
    console.error('Error checking user roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRoles();

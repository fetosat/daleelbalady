console.log('Testing Node.js...');
console.log('Process cwd:', process.cwd());
console.log('Environment variables:', {
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set'
});

// Test basic Prisma client
try {
    const { PrismaClient } = await import('./generated/prisma/client.js');
    console.log('Prisma client imported successfully');
    
    const prisma = new PrismaClient();
    console.log('Prisma client created');
    
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    await prisma.$disconnect();
    console.log('Test completed successfully');
} catch (error) {
    console.error('Test failed:', error);
}

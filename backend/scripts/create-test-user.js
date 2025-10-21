#!/usr/bin/env node
// scripts/create-test-user.js
import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createTestUser() {
    try {
        console.log('Creating test user for development...');
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("testpassword", salt);

        // Create test user with the specific ID that's being used in the frontend
        const user = await prisma.user.create({
            data: {
                id: "b1d1bba6-3807-4036-bfcc-3dadf3ae17d9",
                name: "Test User",
                email: "test@daleelbalady.com", 
                phone: "+20123456789",
                password: hashedPassword,
                role: "CUSTOMER",
                isVerified: true,
                bio: "Development test user for Daleel Balady",
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isVerified: true,
                createdAt: true
            }
        });

        console.log('✅ Test user created successfully:', user);
        console.log('\n📋 Login credentials:');
        console.log('Email: test@daleelbalady.com');
        console.log('Password: testpassword');
        console.log('\n🔗 Use these credentials to test authentication and booking features.');
        
    } catch (error) {
        if (error.code === 'P2002') {
            console.log('ℹ️  Test user already exists. Login credentials:');
            console.log('Email: test@daleelbalady.com');
            console.log('Password: testpassword');
        } else {
            console.error('❌ Error creating test user:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createTestUser()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export { createTestUser };

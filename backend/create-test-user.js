// create-test-user.js
import { PrismaClient } from "./generated/prisma/client.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);
    
    console.log('Creating user with password: 123456');

    // Create test user with the exact ID from the token logs
    const user = await prisma.user.create({
      data: {
        id: "a801debc-9c62-4d0e-8a95-83a5577bd13e",
        name: "Local Test User",
        email: "local@test.com", 
        phone: "+20100000000",
        password: hashedPassword,
        role: "CUSTOMER",
        isVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    console.log("Test user created successfully:", user);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log("Test user already exists");
    } else {
      console.error("Error creating test user:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

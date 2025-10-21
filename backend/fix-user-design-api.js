/**
 * This is a conceptual guide to fix the missing design slug in your user listing API.
 * You will need to integrate this logic into your existing API endpoint for fetching user data.
 */

// Presumed existing imports
import { PrismaClient } from './generated/prisma/index.js';
const prisma = new PrismaClient();

// --- Inside your user listing API endpoint (e.g., app.get('/api/listing/user/:id', ...)) ---

// 1. Fetch the user with their services and the service's design
const user = await prisma.user.findUnique({
  where: { id: req.params.id },
  include: {
    services: {
      select: {
        design: {
          select: {
            slug: true,
          },
        },
      },
    },
  },
});

// 2. Determine the design slug
// If the user has services, use the design slug from the first service.
// Otherwise, fall back to null.
const designSlug = user?.services?.[0]?.design?.slug || null;

// 3. Create the final user object to send to the frontend
// This should be your existing user object, with the designSlug added.
const userForFrontend = {
  ...user,
  designSlug, // Add the designSlug to the user object
};

// 4. Send the modified user object in the API response
res.json(userForFrontend);


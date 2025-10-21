// Shop service utilities
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

// Helper function to generate shop slug from name
export const generateSlug = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid shop name provided for slug generation');
  }
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Function to ensure unique slug
export const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  if (!baseSlug || baseSlug.length < 2) {
    throw new Error('Base slug must be at least 2 characters long');
  }
  
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await prisma.shop.findFirst({
      where: {
        slug: slug,
        ...(excludeId && { id: { not: excludeId } }),
        deletedAt: null
      }
    });
    
    if (!existing) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    // Prevent infinite loops
    if (counter > 1000) {
      throw new Error('Unable to generate unique slug after 1000 attempts');
    }
  }
};

// Create shop with automatic slug generation
export const createShop = async (shopData) => {
  const { name, ...restData } = shopData;
  
  if (!name) {
    throw new Error('Shop name is required');
  }
  
  try {
    // Generate base slug from name
    const baseSlug = generateSlug(name);
    
    // Ensure slug is unique
    const uniqueSlug = await ensureUniqueSlug(baseSlug);
    
    // Create shop with slug
    const shop = await prisma.shop.create({
      data: {
        name,
        slug: uniqueSlug,
        ...restData
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePic: true,
            bio: true,
            isVerified: true,
            verifiedBadge: true,
            role: true
          }
        }
      }
    });
    
    console.log(`✅ Created shop "${name}" with slug: "${uniqueSlug}"`);
    return shop;
    
  } catch (error) {
    console.error(`❌ Error creating shop "${name}":`, error.message);
    throw error;
  }
};

// Update shop with slug regeneration if name changes
export const updateShop = async (shopId, updateData) => {
  try {
    // Check if name is being updated
    if (updateData.name) {
      const currentShop = await prisma.shop.findUnique({
        where: { id: shopId },
        select: { name: true, slug: true }
      });
      
      if (!currentShop) {
        throw new Error('Shop not found');
      }
      
      // If name changed, regenerate slug
      if (currentShop.name !== updateData.name) {
        const baseSlug = generateSlug(updateData.name);
        const uniqueSlug = await ensureUniqueSlug(baseSlug, shopId);
        updateData.slug = uniqueSlug;
      }
    }
    
    // Update shop
    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePic: true,
            bio: true,
            isVerified: true,
            verifiedBadge: true,
            role: true
          }
        }
      }
    });
    
    if (updateData.slug) {
      console.log(`✅ Updated shop "${shop.name}" with new slug: "${updateData.slug}"`);
    }
    
    return shop;
    
  } catch (error) {
    console.error(`❌ Error updating shop:`, error.message);
    throw error;
  }
};

// Get shop by slug
export const getShopBySlug = async (slug) => {
  if (!slug) {
    throw new Error('Slug is required');
  }
  
  const cleanSlug = slug.toLowerCase().trim();
  
  const shop = await prisma.shop.findFirst({
    where: {
      slug: cleanSlug,
      deletedAt: null
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profilePic: true,
          bio: true,
          isVerified: true,
          verifiedBadge: true,
          role: true
        }
      },
      services: {
        where: {
          available: true,
          deletedAt: null
        },
        include: {
          translation: true,
          category: true,
          subCategory: true,
          tags: true,
          design: true,
          reviews: {
            include: {
              author: {
                select: {
                  name: true,
                  profilePic: true
                }
              }
            }
          },
          availability: true
        }
      },
      products: {
        where: {
          isActive: true,
          deletedAt: null
        },
        include: {
          tags: true,
          design: true,
          reviews: {
            include: {
              author: {
                select: {
                  name: true,
                  profilePic: true
                }
              }
            }
          }
        }
      },
      reviews: {
        include: {
          author: {
            select: {
              name: true,
              profilePic: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      address: true,
      design: true
    }
  });
  
  return shop;
};

// Validate shop slug format
export const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') {
    return false;
  }
  
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 100;
};

export default {
  createShop,
  updateShop,
  getShopBySlug,
  generateSlug,
  ensureUniqueSlug,
  isValidSlug
};

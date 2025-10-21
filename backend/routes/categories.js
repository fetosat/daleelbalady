import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/categories
 * Get all categories with their subcategories and service counts
 */
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        subCategories: {
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: {
                services: true
              }
            }
          }
        },
        _count: {
          select: {
            Service: true,
            subCategories: true
          }
        }
      }
    });

    // Format the response
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      serviceCount: cat._count.Service,
      subcategoryCount: cat._count.subCategories,
      subcategories: cat.subCategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        serviceCount: sub._count?.services || 0
      }))
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: error.message 
    });
  }
});

/**
 * GET /api/categories/:slug
 * Get a single category by slug with subcategories
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        subCategories: {
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: {
                services: true
              }
            }
          }
        },
        _count: {
          select: {
            Service: true,
            subCategories: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ 
        error: 'Category not found',
        slug 
      });
    }

    // Format the response
    const formattedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      serviceCount: category._count.Service,
      subcategoryCount: category._count.subCategories,
      subcategories: category.subCategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        serviceCount: sub._count?.services || 0
      }))
    };

    res.json(formattedCategory);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ 
      error: 'Failed to fetch category',
      message: error.message 
    });
  }
});

/**
 * GET /api/categories/:categorySlug/:subcategorySlug
 * Get a specific subcategory by category slug and subcategory slug
 */
router.get('/:categorySlug/:subcategorySlug', async (req, res) => {
  try {
    const { categorySlug, subcategorySlug } = req.params;

    // First find the category
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true, name: true, slug: true }
    });

    if (!category) {
      return res.status(404).json({ 
        error: 'Category not found',
        slug: categorySlug 
      });
    }

    // Then find the subcategory
    const subcategory = await prisma.subCategory.findFirst({
      where: { 
        slug: subcategorySlug,
        categoryId: category.id
      },
      include: {
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    if (!subcategory) {
      return res.status(404).json({ 
        error: 'Subcategory not found',
        categorySlug,
        subcategorySlug
      });
    }

    // Format the response
    const formattedSubcategory = {
      id: subcategory.id,
      name: subcategory.name,
      slug: subcategory.slug,
      serviceCount: subcategory._count?.services || 0,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug
      }
    };

    res.json(formattedSubcategory);
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    res.status(500).json({ 
      error: 'Failed to fetch subcategory',
      message: error.message 
    });
  }
});

export default router;


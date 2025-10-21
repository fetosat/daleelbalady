import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/tags - Get all product tags/categories
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching all product tags...');
        
        const tags = await prisma.tags.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        
        console.log(`✅ Found ${tags.length} tags`);
        
        res.json({
            success: true,
            tags: tags.map(tag => ({
                id: tag.id,
                name: tag.name,
                createdAt: tag.createdAt
            }))
        });
        
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tags'
        });
    }
});

// POST /api/tags - Create a new tag (admin only or auto-create)
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Tag name is required'
            });
        }
        
        // Check if tag already exists
        const existing = await prisma.tags.findFirst({
            where: { name }
        });
        
        if (existing) {
            return res.json({
                success: true,
                tag: existing,
                existed: true
            });
        }
        
        // Create new tag
        const tag = await prisma.tags.create({
            data: { name }
        });
        
        console.log(`✅ Created new tag: ${name}`);
        
        res.status(201).json({
            success: true,
            tag,
            existed: false
        });
        
    } catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create tag'
        });
    }
});

export default router;


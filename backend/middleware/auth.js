import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

export const auth = async (req, res, next) => {
    try {
        // Try to get token from Authorization header first
        let token = req.header('Authorization')?.replace('Bearer ', '');
        
        // If no token in header, try cookies
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Add user info to request object
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(401).json({ error: 'Please authenticate' });
    }
};

// Middleware for role-based access control
// Lightweight authentication - only requires valid user, no role restrictions
export const lightAuth = async (req, res, next) => {
    try {
        console.log('=== Light Auth Middleware ===');
        console.log('Request headers:', {
            authorization: req.header('Authorization') ? 'Present' : 'Missing',
            cookies: Object.keys(req.cookies || {})
        });
        
        // Try to get token from Authorization header first
        let token = req.header('Authorization')?.replace('Bearer ', '');
        
        // If no token in header, try cookies
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
            console.log('Using token from cookies');
        } else if (token) {
            console.log('Using token from Authorization header');
        }
        
        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({ 
                error: 'Authentication required. Please log in to write a review.',
                timestamp: new Date().toISOString()
            });
        }

        console.log('Verifying token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded, userId:', decoded.userId);
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            console.log('⚠️  User not found in local database:', decoded.userId);
            console.log('💡 Tip: The /auth/me endpoint will auto-provision this user');
            return res.status(401).json({ 
                error: 'User not found in local database. Please refresh the page to auto-provision.',
                message: 'Visit /auth/me endpoint to create local user record',
                timestamp: new Date().toISOString()
            });
        }

        console.log('✅ User authenticated:', {
            id: user.id,
            name: user.name,
            role: user.role,
            source: 'existing_local_db'
        });
        
        // Add user info to request object
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        console.error('Light auth middleware error:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        res.status(401).json({ 
            error: 'Please log in to write a review.',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'You do not have permission to perform this action' 
            });
        }

        next();
    };
};

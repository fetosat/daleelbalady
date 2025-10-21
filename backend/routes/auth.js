import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db.js';
import { validateSignup, validateLogin } from '../middleware/validation.js';
import passport from '../config/passport.js';

const router = express.Router();

// Signup route
router.post('/signup', validateSignup, async (req, res) => {
    try {
        const { name, email, password, phone, role = 'CUSTOMER' } = req.body;

        // Validate required fields
        if (!name || !password || (!email && !phone)) {
            return res.status(400).json({ 
                error: 'Please provide name, password, and either email or phone' 
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: phone }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ 
                error: 'User already exists with this email or phone' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                role
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

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            message: 'User created successfully',
            user,
            token
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Login route
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        if (!password || (!email && !phone)) {
            return res.status(400).json({
                error: 'Please provide password and either email or phone'
            });
        }

        // Find user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: phone }
                ]
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        console.log(user);
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return user data without password
        const { password: _, ...userData } = user;
        
        res.json({
            message: 'Login successful',
            user: userData,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Get current user route
router.get('/me', async (req, res) => {
    try {
        // Try to get token from cookie first, then from Authorization header
        let token = req.cookies?.token;
        
        if (!token) {
            const authHeader = req.header('Authorization');
            if (authHeader) {
                token = authHeader.replace('Bearer ', '');
            }
        }
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                profilePic: true,
                bio: true,
                isVerified: true,
                verifiedBadge: true,
                createdAt: true,
                // Include provider subscription data
                providerSubscription: {
                    where: {
                        isActive: true
                    },
                    select: {
                        id: true,
                        planType: true,
                        pricePerYear: true,
                        canTakeBookings: true,
                        canListProducts: true,
                        searchPriority: true,
                        isActive: true,
                        expiresAt: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!user) {
            console.log('User not found in local DB, auto-provisioning...', decoded.userId);
            
            // Auto-provision user based on token data
            try {
                user = await prisma.user.create({
                    data: {
                        id: decoded.userId,
                        name: 'Local User (Auto-provisioned)',
                        email: `user-${decoded.userId.slice(0, 8)}@local.dev`,
                        role: decoded.role || 'CUSTOMER',
                        isVerified: true,
                        verifiedBadge: 'AUTO_PROVISION',
                        // No password since this is auto-provisioned from existing token
                        password: 'auto-provisioned'
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        profilePic: true,
                        bio: true,
                        isVerified: true,
                        verifiedBadge: true,
                        createdAt: true
                    }
                });
                console.log('User auto-provisioned successfully:', user.name, user.id);
            } catch (provisionError) {
                console.error('Failed to auto-provision user:', provisionError);
                return res.status(500).json({ 
                    error: 'Failed to provision user account',
                    details: process.env.NODE_ENV === 'development' ? provisionError.message : undefined
                });
            }
        }
        
        // Flatten subscription data for easier access (after confirming user exists)
        if (user && user.providerSubscription && user.providerSubscription.length > 0) {
            // Take the first active subscription
            user.subscription = user.providerSubscription[0];
            // Also keep the array for backward compatibility
        } else if (user) {
            user.subscription = null;
        }

        res.json({ user });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// ============= SOCIAL LOGIN ROUTES =============

// Google OAuth Routes
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        session: false 
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'https://www.daleelbalady.com'}/login?error=google_auth_failed`
    }),
    async (req, res) => {
        try {
            // Generate JWT token
            const token = jwt.sign(
                { userId: req.user.id, role: req.user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Set token in HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Redirect to frontend with token
            const frontendUrl = process.env.FRONTEND_URL || 'https://www.daleelbalady.com';
            res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL || 'https://www.daleelbalady.com'}/login?error=callback_failed`);
        }
    }
);

// Facebook OAuth Routes
router.get('/facebook',
    passport.authenticate('facebook', { 
        scope: ['email'],
        session: false 
    })
);

router.get('/facebook/callback',
    passport.authenticate('facebook', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'https://www.daleelbalady.com'}/login?error=facebook_auth_failed`
    }),
    async (req, res) => {
        try {
            // Generate JWT token
            const token = jwt.sign(
                { userId: req.user.id, role: req.user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Set token in HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Redirect to frontend with token
            const frontendUrl = process.env.FRONTEND_URL || 'https://www.daleelbalady.com';
            res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
        } catch (error) {
            console.error('Facebook callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL || 'https://www.daleelbalady.com'}/login?error=callback_failed`);
        }
    }
);

export default router;

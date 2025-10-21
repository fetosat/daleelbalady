import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                profilePic: true
            }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'https://api.daleelbalady.com'}/api/auth/google/callback`,
        scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists with Google ID
            let user = await prisma.user.findUnique({
                where: { googleId: profile.id }
            });

            if (user) {
                return done(null, user);
            }

            // Check if user exists with the same email
            const email = profile.emails?.[0]?.value;
            if (email) {
                user = await prisma.user.findUnique({
                    where: { email }
                });

                if (user) {
                    // Link Google account to existing user
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            googleId: profile.id,
                            authProvider: 'google',
                            isVerified: true,
                            profilePic: user.profilePic || profile.photos?.[0]?.value
                        }
                    });
                    return done(null, user);
                }
            }

            // Create new user
            user = await prisma.user.create({
                data: {
                    googleId: profile.id,
                    email: email || `${profile.id}@google.oauth`,
                    name: profile.displayName || 'Google User',
                    profilePic: profile.photos?.[0]?.value,
                    authProvider: 'google',
                    role: 'CUSTOMER',
                    isVerified: true,
                    password: 'oauth-user' // OAuth users don't need password
                }
            });

            return done(null, user);
        } catch (error) {
            console.error('Google OAuth error:', error);
            return done(error, null);
        }
    }));
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'https://api.daleelbalady.com'}/api/auth/facebook/callback`,
        profileFields: ['id', 'emails', 'name', 'picture.type(large)']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists with Facebook ID
            let user = await prisma.user.findUnique({
                where: { facebookId: profile.id }
            });

            if (user) {
                return done(null, user);
            }

            // Check if user exists with the same email
            const email = profile.emails?.[0]?.value;
            if (email) {
                user = await prisma.user.findUnique({
                    where: { email }
                });

                if (user) {
                    // Link Facebook account to existing user
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            facebookId: profile.id,
                            authProvider: 'facebook',
                            isVerified: true,
                            profilePic: user.profilePic || profile.photos?.[0]?.value
                        }
                    });
                    return done(null, user);
                }
            }

            // Create new user
            const displayName = profile.name 
                ? `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim() 
                : 'Facebook User';

            user = await prisma.user.create({
                data: {
                    facebookId: profile.id,
                    email: email || `${profile.id}@facebook.oauth`,
                    name: displayName,
                    profilePic: profile.photos?.[0]?.value,
                    authProvider: 'facebook',
                    role: 'CUSTOMER',
                    isVerified: true,
                    password: 'oauth-user' // OAuth users don't need password
                }
            });

            return done(null, user);
        } catch (error) {
            console.error('Facebook OAuth error:', error);
            return done(error, null);
        }
    }));
}

export default passport;


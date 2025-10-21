import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
// import speakeasy from 'speakeasy'; // Commented out - not installed
// import QRCode from 'qrcode'; // Commented out - not installed
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

/**
 * Advanced Authentication System with 2FA, Refresh Tokens, and Enhanced Security
 */

// Token types
const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
  TWO_FACTOR: 'two_factor'
};

// Token expiry times
const TOKEN_EXPIRY = {
  ACCESS: '15m',
  REFRESH: '7d',
  EMAIL_VERIFICATION: '24h',
  PASSWORD_RESET: '1h',
  TWO_FACTOR: '5m'
};

/**
 * Password Strength Validation
 */
export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noCommonPatterns: !/^(password|123456|qwerty|admin|user|guest)/i.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;
  
  return {
    isValid: score >= 5,
    score: score,
    checks: checks,
    strength: score >= 6 ? 'Strong' : score >= 4 ? 'Medium' : 'Weak'
  };
};

/**
 * Generate JWT Token
 */
export const generateToken = (payload, type = TOKEN_TYPES.ACCESS) => {
  const secret = process.env.JWT_SECRET;
  const expiry = TOKEN_EXPIRY[type.toUpperCase()] || TOKEN_EXPIRY.ACCESS;
  
  const tokenPayload = {
    ...payload,
    type,
    iat: Date.now(),
    jti: crypto.randomUUID() // Unique token ID for revocation
  };

  return jwt.sign(tokenPayload, secret, { expiresIn: expiry });
};

/**
 * Verify JWT Token
 */
export const verifyToken = (token, expectedType = TOKEN_TYPES.ACCESS) => {
  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    
    if (decoded.type !== expectedType) {
      throw new Error('Invalid token type');
    }
    
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Generate Refresh Token and Store in Database
 */
export const generateRefreshToken = async (userId) => {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  
  // Store hashed token in database
  await prisma.refreshToken.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true
    }
  });
  
  return refreshToken;
};

/**
 * Validate Refresh Token
 */
export const validateRefreshToken = async (token, userId) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const dbToken = await prisma.refreshToken.findFirst({
    where: {
      token: hashedToken,
      userId: userId,
      isActive: true,
      expiresAt: { gt: new Date() }
    }
  });
  
  return !!dbToken;
};

/**
 * Revoke Refresh Token
 */
export const revokeRefreshToken = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  await prisma.refreshToken.updateMany({
    where: { token: hashedToken },
    data: { isActive: false, revokedAt: new Date() }
  });
};

/**
 * Generate 2FA Secret for User
 */
export const generate2FASecret = async (userId, userEmail) => {
  // TODO: Install speakeasy and qrcode packages to enable 2FA
  throw new Error('2FA is not available - speakeasy package not installed');
  
  /*
  const secret = speakeasy.generateSecret({
    name: `Daleel Balady (${userEmail})`,
    service: 'Daleel Balady',
    length: 32
  });

  // Store secret in database (encrypted)
  const encryptedSecret = encrypt(secret.base32);
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: encryptedSecret,
      twoFactorEnabled: false
    }
  });

  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  return {
    secret: secret.base32,
    qrCode,
    manualEntryKey: secret.base32
  };
  */
};

/**
 * Verify 2FA Token
 */
export const verify2FAToken = async (userId, token) => {
  // TODO: Install speakeasy package to enable 2FA verification
  return { valid: false, error: '2FA verification not available - speakeasy package not installed' };
  
  /*
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true, twoFactorEnabled: true }
  });

  if (!user?.twoFactorSecret) {
    return { valid: false, error: '2FA not set up' };
  }

  const decryptedSecret = decrypt(user.twoFactorSecret);
  
  const verified = speakeasy.totp.verify({
    secret: decryptedSecret,
    encoding: 'base32',
    token: token,
    window: 1
  });

  return { valid: verified };
  */
};

/**
 * Enable 2FA for User
 */
export const enable2FA = async (userId, verificationToken) => {
  const verification = await verify2FAToken(userId, verificationToken);
  
  if (!verification.valid) {
    throw new Error('Invalid 2FA token');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true }
  });

  // Generate backup codes
  const backupCodes = generateBackupCodes();
  const hashedCodes = backupCodes.map(code => bcrypt.hashSync(code, 10));
  
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorBackupCodes: JSON.stringify(hashedCodes) }
  });

  return { success: true, backupCodes };
};

/**
 * Generate Backup Codes for 2FA
 */
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

/**
 * Verify Backup Code
 */
export const verifyBackupCode = async (userId, code) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorBackupCodes: true }
  });

  if (!user?.twoFactorBackupCodes) {
    return { valid: false, error: 'No backup codes found' };
  }

  const backupCodes = JSON.parse(user.twoFactorBackupCodes);
  let validCodeIndex = -1;

  for (let i = 0; i < backupCodes.length; i++) {
    if (bcrypt.compareSync(code, backupCodes[i])) {
      validCodeIndex = i;
      break;
    }
  }

  if (validCodeIndex === -1) {
    return { valid: false, error: 'Invalid backup code' };
  }

  // Remove used backup code
  backupCodes.splice(validCodeIndex, 1);
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorBackupCodes: JSON.stringify(backupCodes) }
  });

  return { valid: true, remainingCodes: backupCodes.length };
};

/**
 * Session Management
 */
export const createUserSession = async (userId, userAgent, ipAddress) => {
  const sessionToken = crypto.randomUUID();
  const hashedToken = crypto.createHash('sha256').update(sessionToken).digest('hex');
  
  await prisma.userSession.create({
    data: {
      userId,
      sessionToken: hashedToken,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true,
      lastActivityAt: new Date()
    }
  });
  
  return sessionToken;
};

/**
 * Validate User Session
 */
export const validateUserSession = async (sessionToken, userId) => {
  const hashedToken = crypto.createHash('sha256').update(sessionToken).digest('hex');
  
  const session = await prisma.userSession.findFirst({
    where: {
      sessionToken: hashedToken,
      userId,
      isActive: true,
      expiresAt: { gt: new Date() }
    }
  });
  
  if (session) {
    // Update last activity
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() }
    });
    return true;
  }
  
  return false;
};

/**
 * Revoke User Session
 */
export const revokeUserSession = async (sessionToken) => {
  const hashedToken = crypto.createHash('sha256').update(sessionToken).digest('hex');
  
  await prisma.userSession.updateMany({
    where: { sessionToken: hashedToken },
    data: { isActive: false, revokedAt: new Date() }
  });
};

/**
 * Advanced Authentication Middleware
 */
export const advancedAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const sessionToken = req.headers['x-session-token'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
    }
    
    const token = authHeader.substring(7);
    const verification = verifyToken(token, TOKEN_TYPES.ACCESS);
    
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
    
    const { userId } = verification.decoded;
    
    // Validate session if provided
    if (sessionToken) {
      const sessionValid = await validateUserSession(sessionToken, userId);
      if (!sessionValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid session',
          code: 'INVALID_SESSION'
        });
      }
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        twoFactorEnabled: true,
        deletedAt: true
      }
    });
    
    if (!user || user.deletedAt) {
      return res.status(401).json({
        success: false,
        message: 'User not found or deactivated',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Check if 2FA is required for sensitive operations
    const sensitiveRoutes = ['/api/payments/', '/api/admin/', '/api/user/delete'];
    const isSensitiveRoute = sensitiveRoutes.some(route => req.path.includes(route));
    
    if (isSensitiveRoute && user.twoFactorEnabled) {
      const twoFactorToken = req.headers['x-2fa-token'];
      if (!twoFactorToken) {
        return res.status(403).json({
          success: false,
          message: '2FA token required for this operation',
          code: 'TWO_FACTOR_REQUIRED'
        });
      }
      
      const twoFactorVerification = await verify2FAToken(userId, twoFactorToken);
      if (!twoFactorVerification.valid) {
        return res.status(403).json({
          success: false,
          message: 'Invalid 2FA token',
          code: 'INVALID_2FA_TOKEN'
        });
      }
    }
    
    // Add user to request
    req.user = user;
    req.sessionToken = sessionToken;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

/**
 * Encryption/Decryption for sensitive data
 */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const ALGORITHM = 'aes-256-gcm';

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
};

const decrypt = (encryptedData) => {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Rate Limiting for Auth Endpoints
 */
export const authRateLimit = {
  login: 5, // attempts per 15 minutes
  register: 3,
  passwordReset: 3,
  twoFactor: 10
};

/**
 * Security Headers Middleware
 */
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");
  next();
};

export default {
  validatePasswordStrength,
  generateToken,
  verifyToken,
  generateRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  generate2FASecret,
  verify2FAToken,
  enable2FA,
  verifyBackupCode,
  createUserSession,
  validateUserSession,
  revokeUserSession,
  advancedAuth,
  securityHeaders,
  authRateLimit
};

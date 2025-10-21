import crypto from 'crypto';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

/**
 * Digital Signature System for Enhanced Authentication Security
 */

/**
 * Generate RSA Key Pair for Digital Signatures
 */
export const generateKeyPair = () => {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
};

/**
 * Sign Data with Private Key
 */
export const signData = (data, privateKey) => {
  const sign = crypto.createSign('SHA256');
  sign.update(JSON.stringify(data));
  sign.end();
  return sign.sign(privateKey, 'hex');
};

/**
 * Verify Signature with Public Key
 */
export const verifySignature = (data, signature, publicKey) => {
  const verify = crypto.createVerify('SHA256');
  verify.update(JSON.stringify(data));
  verify.end();
  return verify.verify(publicKey, signature, 'hex');
};

/**
 * Create Secure Login Token with Digital Signature
 */
export const createSecureLoginToken = async (userId, deviceInfo) => {
  const { publicKey, privateKey } = generateKeyPair();
  
  const tokenData = {
    userId,
    deviceInfo,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex')
  };
  
  const signature = signData(tokenData, privateKey);
  
  // Store public key in database for verification
  await prisma.userSecurityKey.create({
    data: {
      userId,
      publicKey,
      keyType: 'LOGIN',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true
    }
  });
  
  return {
    tokenData,
    signature,
    publicKeyId: crypto.createHash('sha256').update(publicKey).digest('hex').substring(0, 16)
  };
};

/**
 * Verify Secure Login Token
 */
export const verifySecureLoginToken = async (tokenData, signature, publicKeyId) => {
  const keyRecord = await prisma.userSecurityKey.findFirst({
    where: {
      publicKeyId,
      keyType: 'LOGIN',
      isActive: true,
      expiresAt: { gt: new Date() }
    }
  });
  
  if (!keyRecord) {
    return { valid: false, error: 'Security key not found' };
  }
  
  const isValid = verifySignature(tokenData, signature, keyRecord.publicKey);
  
  if (isValid) {
    // Update last used timestamp
    await prisma.userSecurityKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() }
    });
  }
  
  return { valid: isValid };
};

/**
 * Device Fingerprinting for Enhanced Security
 */
export const generateDeviceFingerprint = (req) => {
  const components = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || '',
    req.ip || '',
    req.headers['sec-ch-ua'] || '',
    req.headers['sec-ch-ua-platform'] || ''
  ];
  
  return crypto.createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
};

/**
 * Anomaly Detection for Suspicious Login Attempts
 */
export const detectLoginAnomalies = async (userId, loginData) => {
  // Get user's login history
  const recentLogins = await prisma.userLoginLog.findMany({
    where: {
      userId,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  
  const anomalies = [];
  
  // Check for new device
  const knownDevices = new Set(recentLogins.map(log => log.deviceFingerprint));
  if (!knownDevices.has(loginData.deviceFingerprint)) {
    anomalies.push({
      type: 'NEW_DEVICE',
      severity: 'medium',
      message: 'Login from unrecognized device'
    });
  }
  
  // Check for unusual location (if geolocation available)
  if (loginData.location) {
    const knownLocations = recentLogins
      .filter(log => log.location)
      .map(log => JSON.parse(log.location));
    
    const isNewLocation = !knownLocations.some(loc => 
      Math.abs(loc.lat - loginData.location.lat) < 0.5 &&
      Math.abs(loc.lon - loginData.location.lon) < 0.5
    );
    
    if (isNewLocation && knownLocations.length > 0) {
      anomalies.push({
        type: 'NEW_LOCATION',
        severity: 'medium',
        message: 'Login from unusual location'
      });
    }
  }
  
  // Check for rapid successive login attempts
  const recentAttempts = recentLogins.filter(log => 
    Date.now() - new Date(log.createdAt).getTime() < 5 * 60 * 1000 // Last 5 minutes
  );
  
  if (recentAttempts.length > 5) {
    anomalies.push({
      type: 'RAPID_ATTEMPTS',
      severity: 'high',
      message: 'Multiple rapid login attempts detected'
    });
  }
  
  // Check for unusual time patterns
  const currentHour = new Date().getHours();
  const usualHours = recentLogins.map(log => new Date(log.createdAt).getHours());
  const isUnusualTime = usualHours.length > 10 && 
    !usualHours.includes(currentHour) &&
    (currentHour < 6 || currentHour > 23);
  
  if (isUnusualTime) {
    anomalies.push({
      type: 'UNUSUAL_TIME',
      severity: 'low',
      message: 'Login at unusual time'
    });
  }
  
  return anomalies;
};

/**
 * Log User Login Activity
 */
export const logUserLogin = async (userId, loginData, success = true, anomalies = []) => {
  await prisma.userLoginLog.create({
    data: {
      userId,
      success,
      ipAddress: loginData.ip,
      userAgent: loginData.userAgent,
      deviceFingerprint: loginData.deviceFingerprint,
      location: loginData.location ? JSON.stringify(loginData.location) : null,
      anomalies: anomalies.length > 0 ? JSON.stringify(anomalies) : null,
      timestamp: new Date()
    }
  });
  
  // Send alerts for high-severity anomalies
  const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
  if (highSeverityAnomalies.length > 0) {
    await sendSecurityAlert(userId, highSeverityAnomalies);
  }
};

/**
 * Send Security Alert to User
 */
const sendSecurityAlert = async (userId, anomalies) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true }
  });
  
  if (!user) return;
  
  // Create notification in database
  await prisma.notification.create({
    data: {
      userId,
      type: 'SECURITY',
      title: 'تنبيه أمني - نشاط مشبوه',
      message: `تم اكتشاف نشاط مشبوه في حسابك: ${anomalies.map(a => a.message).join(', ')}`,
      metadata: { anomalies }
    }
  });
  
  // In production, also send email
  console.log(`🚨 Security Alert for ${user.email}:`, anomalies);
};

/**
 * Advanced Password Hashing with Salt
 */
export const hashPasswordAdvanced = async (password, userId) => {
  // Use user-specific salt
  const userSalt = crypto.createHash('sha256')
    .update(userId + process.env.PASSWORD_SALT)
    .digest('hex');
  
  const rounds = 12; // bcrypt rounds
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password + userSalt, rounds);
};

/**
 * Verify Advanced Password Hash
 */
export const verifyPasswordAdvanced = async (password, hashedPassword, userId) => {
  const userSalt = crypto.createHash('sha256')
    .update(userId + process.env.PASSWORD_SALT)
    .digest('hex');
  
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password + userSalt, hashedPassword);
};

/**
 * Generate Secure API Key
 */
export const generateAPIKey = (prefix = 'dlb') => {
  const randomPart = crypto.randomBytes(24).toString('hex');
  const timestamp = Date.now().toString(36);
  const checksum = crypto.createHash('sha256')
    .update(randomPart + timestamp)
    .digest('hex')
    .substring(0, 8);
  
  return `${prefix}_${timestamp}_${randomPart}_${checksum}`;
};

/**
 * Validate API Key Format
 */
export const validateAPIKeyFormat = (apiKey) => {
  const pattern = /^[a-z]+_[a-z0-9]+_[a-f0-9]{48}_[a-f0-9]{8}$/;
  return pattern.test(apiKey);
};

export default {
  generateKeyPair,
  signData,
  verifySignature,
  createSecureLoginToken,
  verifySecureLoginToken,
  generateDeviceFingerprint,
  detectLoginAnomalies,
  logUserLogin,
  hashPasswordAdvanced,
  verifyPasswordAdvanced,
  generateAPIKey,
  validateAPIKeyFormat
};

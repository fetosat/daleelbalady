// server.js
import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { GoogleGenAI } from "@google/genai";
import cookieParser from "cookie-parser";
import passport from './config/passport.js';
import {  authLimit, uploadLimit, searchLimit, aiLimit } from './middleware/rateLimiter.js';
// import { generalLimit } from './middleware/rateLimiter.js';
import { handle_ai } from "./handler/handle_ai.js";
import { handle_ai_simple } from "./handler/handle_ai_simple.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import reviewRoutes from "./routes/reviews.js";
import searchCacheRoutes from "./routes/searchCache.js";
import businessRoutes from "./routes/business.js";
import shopRoutes from "./routes/shops.js";
import userListingsRoutes from "./routes/userListings.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payments-production.js";
import newPaymentRoutes from "./routes/payment.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import userRoutes from "./routes/users.js";
import serviceRoutes from "./routes/services.js";
import analyticsRoutes from "./routes/analytics.js";
import chatRoutes from "./routes/chats.js";
import cartRoutes from "./routes/cart.js";
import reactionRoutes from "./routes/reactions.js";
import advancedSearchRoutes from "./routes/advancedSearch.js";
import findPageRoutes from "./routes/findPage.js";
import productRoutes from "./routes/products.js";
import providerRoutes from "./routes/provider.js";
import favoritesRoutes from "./routes/favorites.js";
import adminRoutes from './routes/admin.js';
import adminConversionsRoutes from './routes/adminConversions.js';
import uploadRoutes from "./routes/upload.js";
import offersRoutes from "./routes/offers.js";
import planViewsRoutes from "./routes/plan-views.js";
import categoriesRoutes from "./routes/categories.js";
import tagsRoutes from "./routes/tags.js";
import notificationsRoutes from "./routes/notifications.js";
import providerNotificationsRoutes from "./routes/providerNotifications.js";
import familyRoutes from "./routes/family.js";
import deliveryRoutes from "./routes/delivery.js";
import deliverySocketService from "./services/deliverySocket.js";
import { handleConnectionError, startAutoReconnect, gracefulShutdown } from "./utils/connectionHandler.js";
import { initializeDatabase, startHealthMonitoring, gracefulDatabaseShutdown } from "./utils/dbHealthCheck.js";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize Delivery Socket Service with shared io instance
deliverySocketService.initialize(io);

// Make it globally accessible
global.deliverySocketService = deliverySocketService;

// init Gemini wrapper client
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY || "",
});

// ==================== SECURITY MIDDLEWARE ====================

// Helmet.js - Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// General rate limiter (applied to all routes)
// app.use('/api/', generalLimit);

// Production CORS settings
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://www.daleelbalady.com",
    "https://medical.daleelbalady.com",
    "https://api-medical.daleelbalady.com",
    "https://daleelbalady.com",
    ...(process.env.NODE_ENV === "development" ? [
        "http://localhost:1024",
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:5173"
    ] : [])
].filter(Boolean); // Remove undefined/null values

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200
}));
// app.use(cors({ origin: '*' }));

// Request size limits for security
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static("public"));
// Serve uploaded files with absolute path
const uploadsPath = path.resolve(process.cwd(), 'uploads');
console.log('Serving static files from:', uploadsPath);

// Custom middleware to handle missing files gracefully
app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadsPath, req.path);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
        // File exists, serve it normally
        next();
    } else {
        console.log(`⚠️ Missing file requested: ${req.path}`);
        console.log(`   Full path: ${filePath}`);
        
        // Return a 404 instead of throwing an error
        res.status(404).json({
            error: 'File not found',
            path: req.path,
            message: 'The requested file does not exist'
        });
    }
}, express.static(uploadsPath));
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

// Routes with rate limiting
app.use('/api/auth', authLimit, authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/search-cache', searchCacheRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/user-listings', userListingsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment', newPaymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/advanced-search', searchLimit, advancedSearchRoutes);
app.use('/api/find', searchLimit, findPageRoutes);
app.use('/api/products', productRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/user/favorites', favoritesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/conversions', adminConversionsRoutes);
app.use('/api/upload', uploadLimit, uploadRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/plan-views', planViewsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/notifications', providerNotificationsRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/delivery', deliveryRoutes);

// health
app.get("/", (_req, res) => res.sendFile(new URL("./public/index.html", import.meta.url).pathname));

// Enhanced health check endpoints
import { healthCheckMiddleware, livenessProbe, readinessProbe, collectMetrics } from "./utils/healthCheck.js";

// Comprehensive health check
app.get("/api/health", healthCheckMiddleware);

// Kubernetes-style probes
app.get("/api/health/live", livenessProbe);
app.get("/api/health/ready", readinessProbe);

// Performance metrics endpoint
app.get("/api/metrics", (_req, res) => {
    const metrics = collectMetrics();
    res.json(metrics);
});

// Simple health check for backward compatibility
app.get("/api/status", (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        service: 'Daleel Balady API'
    });
});

// Track connected clients to prevent duplicates
const connectedClients = new Map();
const processingMessages = new Set();

// sockets
io.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    // Handle client identification
    socket.on("client_identify", (data) => {
        const { clientId } = data;
        if (clientId) {
            // Check if client is already connected
            if (connectedClients.has(clientId)) {
                const existingSocketId = connectedClients.get(clientId);
                console.log(`🔄 Client ${clientId} reconnected (was: ${existingSocketId}, now: ${socket.id})`);
            } else {
                console.log(`🆔 New client identified: ${clientId} (${socket.id})`);
            }

            // Store client mapping
            connectedClients.set(clientId, socket.id);
            socket.clientId = clientId;
        }
    });

    // event to start a message from client
    socket.on("user_message", async (data) => {
        try {
            // Handle both old string format and new object format
            let message, clientId, location;

            if (typeof data === 'string') {
                // Old format - just the message
                message = data;
                clientId = socket.clientId;
            } else {
                // New format with client ID and metadata
                message = data.message;
                clientId = data.clientId || socket.clientId;
                location = data.location;

                // Store location on socket if provided
                if (location) {
                    socket.data = socket.data || {};
                    socket.data.userLocation = location;
                }
            }

            // Create unique message ID for deduplication
            const messageId = `${clientId}_${Date.now()}_${message.substring(0, 20)}`;

            // Check if this message is already being processed
            if (processingMessages.has(messageId)) {
                console.log(`⚠️ Duplicate message detected for client ${clientId}, ignoring...`);
                return;
            }

            // Mark message as being processed
            processingMessages.add(messageId);

            console.log(`📨 Processing message from client ${clientId}: ${message.substring(0, 50)}...`);

            // Use advanced multi-entity search handler
            console.log("🔄 Using multi-entity AI handler...");
            await handle_ai(socket, ai, message);

            // Remove from processing set after completion
            processingMessages.delete(messageId);

        } catch (err) {
            console.error("handle_ai error:", err);
            socket.emit("ai_message", JSON.stringify({ function: "reply_to_user", parameters: { message: "⚠️ حدث خطأ غير متوقع، حاول مرة أخرى." } }));

            // Clean up processing set on error
            const messageId = `${socket.clientId}_${Date.now()}_${typeof data === 'string' ? data : data.message}`;
            processingMessages.delete(messageId);
        }
    });

    // client supplies location when asked
    socket.on("location_response", (payload) => {
        // store location on socket for reuse
        socket.data.userLocation = payload; // { lat, lon }
    });

    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);

        // Clean up client tracking
        if (socket.clientId && connectedClients.get(socket.clientId) === socket.id) {
            connectedClients.delete(socket.clientId);
            console.log(`🧹 Cleaned up client ${socket.clientId}`);
        }

        // Clean up any processing messages for this client
        if (socket.clientId) {
            const messagesToDelete = [];
            for (const messageId of processingMessages) {
                if (messageId.startsWith(socket.clientId + '_')) {
                    messagesToDelete.push(messageId);
                }
            }
            messagesToDelete.forEach(id => processingMessages.delete(id));
        }
    });
});

// Enhanced startup with health checks and connection monitoring
const PORT = process.env.PORT || 5000;

// Add error handlers for unhandled errors
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    handleConnectionError(error, 'process');
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    handleConnectionError(reason, 'promise');
});

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
    console.log('📡 SIGTERM received, starting graceful shutdown...');
    await gracefulDatabaseShutdown();
    await gracefulShutdown([{ name: 'server', disconnect: () => server.close() }]);
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('📡 SIGINT received, starting graceful shutdown...');
    await gracefulDatabaseShutdown();
    await gracefulShutdown([{ name: 'server', disconnect: () => server.close() }]);
    process.exit(0);
});

// Start server
server.listen(PORT, async () => {
    console.log(`🚀 Server starting on http://localhost:${PORT}`);
    
    try {
        // Initialize database first
        console.log('🔄 Initializing database...');
        const dbInitialized = await initializeDatabase();
        if (!dbInitialized) {
            throw new Error('Database initialization failed');
        }
        
        // Start database health monitoring
        startHealthMonitoring(60000); // Check every minute
        
        // Start connection monitoring
        startAutoReconnect(60000); // Check every minute
        
        console.log(`✅ Server fully operational on port ${PORT}`);
    } catch (error) {
        console.error('💥 Server startup failed:', error);
        handleConnectionError(error, 'startup');
        process.exit(1);
    }
});

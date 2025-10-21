-- ==========================================
-- DATABASE OPTIMIZATION SCRIPT
-- Daleel Balady - Performance Indexes & Constraints
-- ==========================================

-- بسم الله نبدأ تحسين قاعدة البيانات

-- ==========================================
-- INDEX OPTIMIZATION
-- ==========================================

-- User Table Indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON User(email);
CREATE INDEX IF NOT EXISTS idx_user_phone ON User(phone);
CREATE INDEX IF NOT EXISTS idx_user_role ON User(role);
CREATE INDEX IF NOT EXISTS idx_user_verified ON User(isVerified);
CREATE INDEX IF NOT EXISTS idx_user_deleted ON User(deletedAt);
CREATE INDEX IF NOT EXISTS idx_user_created ON User(createdAt);

-- Service Table Indexes  
CREATE INDEX IF NOT EXISTS idx_service_owner ON Service(ownerUserId);
CREATE INDEX IF NOT EXISTS idx_service_shop ON Service(shopId);
CREATE INDEX IF NOT EXISTS idx_service_subcategory ON Service(subCategoryId);
CREATE INDEX IF NOT EXISTS idx_service_city ON Service(city);
CREATE INDEX IF NOT EXISTS idx_service_available ON Service(available);
CREATE INDEX IF NOT EXISTS idx_service_price ON Service(price);
CREATE INDEX IF NOT EXISTS idx_service_deleted ON Service(deletedAt);
CREATE INDEX IF NOT EXISTS idx_service_created ON Service(createdAt);
CREATE INDEX IF NOT EXISTS idx_service_location ON Service(locationLat, locationLon);

-- Full-text search index for services
-- CREATE FULLTEXT INDEX idx_service_search ON Service(embeddingText);

-- Shop Table Indexes
CREATE INDEX IF NOT EXISTS idx_shop_owner ON Shop(ownerId);
CREATE INDEX IF NOT EXISTS idx_shop_slug ON Shop(slug);
CREATE INDEX IF NOT EXISTS idx_shop_city ON Shop(city);
CREATE INDEX IF NOT EXISTS idx_shop_verified ON Shop(isVerified);
CREATE INDEX IF NOT EXISTS idx_shop_deleted ON Shop(deletedAt);
CREATE INDEX IF NOT EXISTS idx_shop_created ON Shop(createdAt);
CREATE INDEX IF NOT EXISTS idx_shop_location ON Shop(locationLat, locationLon);

-- Product Table Indexes
CREATE INDEX IF NOT EXISTS idx_product_shop ON Product(shopId);
CREATE INDEX IF NOT EXISTS idx_product_lister ON Product(listerId);
CREATE INDEX IF NOT EXISTS idx_product_sku ON Product(sku);
CREATE INDEX IF NOT EXISTS idx_product_active ON Product(isActive);
CREATE INDEX IF NOT EXISTS idx_product_price ON Product(price);
CREATE INDEX IF NOT EXISTS idx_product_stock ON Product(stock);
CREATE INDEX IF NOT EXISTS idx_product_deleted ON Product(deletedAt);
CREATE INDEX IF NOT EXISTS idx_product_created ON Product(createdAt);

-- Booking Table Indexes
CREATE INDEX IF NOT EXISTS idx_booking_user ON Booking(userId);
CREATE INDEX IF NOT EXISTS idx_booking_service ON Booking(serviceId);
CREATE INDEX IF NOT EXISTS idx_booking_shop ON Booking(shopId);
CREATE INDEX IF NOT EXISTS idx_booking_status ON Booking(status);
CREATE INDEX IF NOT EXISTS idx_booking_start_time ON Booking(startAt);
CREATE INDEX IF NOT EXISTS idx_booking_end_time ON Booking(endAt);
CREATE INDEX IF NOT EXISTS idx_booking_created ON Booking(createdAt);

-- Order Table Indexes
CREATE INDEX IF NOT EXISTS idx_order_user ON Order(userId);
CREATE INDEX IF NOT EXISTS idx_order_number ON Order(orderNumber);
CREATE INDEX IF NOT EXISTS idx_order_status ON Order(status);
CREATE INDEX IF NOT EXISTS idx_order_total ON Order(totalAmount);
CREATE INDEX IF NOT EXISTS idx_order_created ON Order(createdAt);
CREATE INDEX IF NOT EXISTS idx_order_delivered ON Order(deliveredAt);

-- Chat & Message Indexes
CREATE INDEX IF NOT EXISTS idx_chat_initiator ON Chat(initiatorId);
CREATE INDEX IF NOT EXISTS idx_chat_recipient ON Chat(recipientId);
CREATE INDEX IF NOT EXISTS idx_chat_active ON Chat(isActive);
CREATE INDEX IF NOT EXISTS idx_chat_last_message ON Chat(lastMessageAt);

CREATE INDEX IF NOT EXISTS idx_message_chat ON Message(chatId);
CREATE INDEX IF NOT EXISTS idx_message_sender ON Message(senderId);
CREATE INDEX IF NOT EXISTS idx_message_read ON Message(isRead);
CREATE INDEX IF NOT EXISTS idx_message_created ON Message(createdAt);

-- Review Table Indexes
CREATE INDEX IF NOT EXISTS idx_review_author ON Review(authorId);
CREATE INDEX IF NOT EXISTS idx_review_service ON Review(serviceId);
CREATE INDEX IF NOT EXISTS idx_review_product ON Review(productId);
CREATE INDEX IF NOT EXISTS idx_review_shop ON Review(shopId);
CREATE INDEX IF NOT EXISTS idx_review_user ON Review(userId);
CREATE INDEX IF NOT EXISTS idx_review_rating ON Review(rating);
CREATE INDEX IF NOT EXISTS idx_review_verified ON Review(isVerified);
CREATE INDEX IF NOT EXISTS idx_review_created ON Review(createdAt);

-- Subscription Indexes
CREATE INDEX IF NOT EXISTS idx_provider_subscription_user ON ProviderSubscription(providerId);
CREATE INDEX IF NOT EXISTS idx_provider_subscription_active ON ProviderSubscription(isActive);
CREATE INDEX IF NOT EXISTS idx_provider_subscription_plan ON ProviderSubscription(planType);
CREATE INDEX IF NOT EXISTS idx_provider_subscription_expires ON ProviderSubscription(expiresAt);

CREATE INDEX IF NOT EXISTS idx_user_subscription_user ON UserSubscription(userId);
CREATE INDEX IF NOT EXISTS idx_user_subscription_active ON UserSubscription(isActive);
CREATE INDEX IF NOT EXISTS idx_user_subscription_expires ON UserSubscription(expiresAt);

-- Guide Plan Indexes
CREATE INDEX IF NOT EXISTS idx_guide_plan_user ON UserGuidePlan(userId);
CREATE INDEX IF NOT EXISTS idx_guide_plan_type ON UserGuidePlan(planType);
CREATE INDEX IF NOT EXISTS idx_guide_plan_active ON UserGuidePlan(isActive);
CREATE INDEX IF NOT EXISTS idx_guide_plan_pin ON UserGuidePlan(currentMonthPin);
CREATE INDEX IF NOT EXISTS idx_guide_plan_national_id ON UserGuidePlan(egyptianNationalId);

-- Offer Indexes
CREATE INDEX IF NOT EXISTS idx_offer_provider ON Offer(providerId);
CREATE INDEX IF NOT EXISTS idx_offer_shop ON Offer(shopId);
CREATE INDEX IF NOT EXISTS idx_offer_level ON Offer(level);
CREATE INDEX IF NOT EXISTS idx_offer_target_type ON Offer(targetType);
CREATE INDEX IF NOT EXISTS idx_offer_active ON Offer(isActive);
CREATE INDEX IF NOT EXISTS idx_offer_valid_from ON Offer(validFrom);
CREATE INDEX IF NOT EXISTS idx_offer_valid_until ON Offer(validUntil);

-- Payment Indexes
CREATE INDEX IF NOT EXISTS idx_payment_user ON Payment(userId);
CREATE INDEX IF NOT EXISTS idx_payment_status ON Payment(status);
CREATE INDEX IF NOT EXISTS idx_payment_plan_type ON Payment(planType);
CREATE INDEX IF NOT EXISTS idx_payment_paymob_order ON Payment(paymobOrderId);
CREATE INDEX IF NOT EXISTS idx_payment_created ON Payment(createdAt);

-- PIN Verification Indexes
CREATE INDEX IF NOT EXISTS idx_pin_verification_plan ON PinVerification(planId);
CREATE INDEX IF NOT EXISTS idx_pin_verification_user ON PinVerification(userId);
CREATE INDEX IF NOT EXISTS idx_pin_verification_pin ON PinVerification(pinUsed);
CREATE INDEX IF NOT EXISTS idx_pin_verification_month ON PinVerification(monthYear);
CREATE INDEX IF NOT EXISTS idx_pin_verification_verified ON PinVerification(verifiedAt);

-- Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_user_analytics_user ON UserAnalytics(userId);

-- Notification Indexes
CREATE INDEX IF NOT EXISTS idx_notification_user ON Notification(userId);
CREATE INDEX IF NOT EXISTS idx_notification_shop ON Notification(shopId);
CREATE INDEX IF NOT EXISTS idx_notification_type ON Notification(type);
CREATE INDEX IF NOT EXISTS idx_notification_read ON Notification(isRead);
CREATE INDEX IF NOT EXISTS idx_notification_created ON Notification(createdAt);

-- Category Indexes
CREATE INDEX IF NOT EXISTS idx_category_slug ON Category(slug);
CREATE INDEX IF NOT EXISTS idx_category_position ON Category(position);

CREATE INDEX IF NOT EXISTS idx_subcategory_category ON SubCategory(categoryId);

-- Tag Indexes
CREATE INDEX IF NOT EXISTS idx_tag_name ON Tag(name);

-- ==========================================
-- COMPOSITE INDEXES (Multi-column)
-- ==========================================

-- Service search optimization
CREATE INDEX IF NOT EXISTS idx_service_search_composite ON Service(city, available, deletedAt, price);
CREATE INDEX IF NOT EXISTS idx_service_category_search ON Service(subCategoryId, available, deletedAt);

-- Shop search optimization  
CREATE INDEX IF NOT EXISTS idx_shop_search_composite ON Shop(city, isVerified, deletedAt);

-- Product search optimization
CREATE INDEX IF NOT EXISTS idx_product_search_composite ON Product(shopId, isActive, deletedAt, price);

-- Booking filtering
CREATE INDEX IF NOT EXISTS idx_booking_user_status ON Booking(userId, status, createdAt);
CREATE INDEX IF NOT EXISTS idx_booking_service_date ON Booking(serviceId, startAt, status);

-- Order filtering
CREATE INDEX IF NOT EXISTS idx_order_user_status ON Order(userId, status, createdAt);

-- Review filtering
CREATE INDEX IF NOT EXISTS idx_review_target_rating ON Review(serviceId, rating, createdAt);
CREATE INDEX IF NOT EXISTS idx_review_shop_rating ON Review(shopId, rating, createdAt);

-- Chat performance
CREATE INDEX IF NOT EXISTS idx_chat_participants ON Chat(initiatorId, recipientId, isActive);

-- Message performance  
CREATE INDEX IF NOT EXISTS idx_message_chat_time ON Message(chatId, createdAt);

-- Offer filtering
CREATE INDEX IF NOT EXISTS idx_offer_active_dates ON Offer(isActive, validFrom, validUntil);

-- Payment filtering
CREATE INDEX IF NOT EXISTS idx_payment_user_status ON Payment(userId, status, createdAt);

-- ==========================================
-- CONSTRAINTS & DATA INTEGRITY
-- ==========================================

-- Email validation constraints (if not using Prisma validation)
-- ALTER TABLE User ADD CONSTRAINT chk_user_email_format 
--   CHECK (email IS NULL OR email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Phone validation constraints
-- ALTER TABLE User ADD CONSTRAINT chk_user_phone_format 
--   CHECK (phone IS NULL OR phone REGEXP '^\+?[1-9]\d{1,14}$');

-- Price constraints
ALTER TABLE Service ADD CONSTRAINT chk_service_price_positive 
  CHECK (price IS NULL OR price >= 0);

ALTER TABLE Product ADD CONSTRAINT chk_product_price_positive 
  CHECK (price >= 0);

-- Stock constraints
ALTER TABLE Product ADD CONSTRAINT chk_product_stock_non_negative 
  CHECK (stock >= 0);

-- Rating constraints
ALTER TABLE Review ADD CONSTRAINT chk_review_rating_range 
  CHECK (rating >= 1 AND rating <= 5);

-- Booking time constraints
ALTER TABLE Booking ADD CONSTRAINT chk_booking_time_order 
  CHECK (endAt > startAt);

-- Order total constraints
ALTER TABLE Order ADD CONSTRAINT chk_order_total_positive 
  CHECK (totalAmount >= 0);

-- PIN format constraints
ALTER TABLE UserGuidePlan ADD CONSTRAINT chk_pin_format 
  CHECK (currentMonthPin IS NULL OR currentMonthPin REGEXP '^[0-9]{4}-[0-9]{4}$');

-- Egyptian National ID constraints
ALTER TABLE UserGuidePlan ADD CONSTRAINT chk_national_id_format 
  CHECK (egyptianNationalId IS NULL OR LENGTH(egyptianNationalId) = 14);

-- ==========================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- ==========================================

DELIMITER //

-- Get active services with filters
CREATE PROCEDURE IF NOT EXISTS GetActiveServices(
    IN p_city VARCHAR(50),
    IN p_category VARCHAR(36),
    IN p_min_price DECIMAL(10,2),
    IN p_max_price DECIMAL(10,2),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT s.*, u.name as ownerName, u.isVerified as ownerVerified
    FROM Service s
    JOIN User u ON s.ownerUserId = u.id
    WHERE s.available = TRUE 
      AND s.deletedAt IS NULL
      AND (p_city IS NULL OR s.city = p_city)
      AND (p_category IS NULL OR s.subCategoryId = p_category)
      AND (p_min_price IS NULL OR s.price >= p_min_price)
      AND (p_max_price IS NULL OR s.price <= p_max_price)
    ORDER BY s.createdAt DESC
    LIMIT p_limit OFFSET p_offset;
END //

-- Get user booking statistics
CREATE PROCEDURE IF NOT EXISTS GetUserBookingStats(IN p_user_id VARCHAR(36))
BEGIN
    SELECT 
        COUNT(*) as totalBookings,
        SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmedBookings,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedBookings,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledBookings,
        AVG(price) as avgBookingPrice
    FROM Booking 
    WHERE userId = p_user_id;
END //

-- Get shop performance metrics
CREATE PROCEDURE IF NOT EXISTS GetShopMetrics(IN p_shop_id VARCHAR(36))
BEGIN
    SELECT 
        s.name,
        COUNT(DISTINCT srv.id) as totalServices,
        COUNT(DISTINCT p.id) as totalProducts,
        COUNT(DISTINCT b.id) as totalBookings,
        AVG(r.rating) as avgRating,
        COUNT(DISTINCT r.id) as totalReviews
    FROM Shop s
    LEFT JOIN Service srv ON s.id = srv.shopId AND srv.deletedAt IS NULL
    LEFT JOIN Product p ON s.id = p.shopId AND p.deletedAt IS NULL
    LEFT JOIN Booking b ON s.id = b.shopId
    LEFT JOIN Review r ON s.id = r.shopId
    WHERE s.id = p_shop_id
    GROUP BY s.id, s.name;
END //

-- Clean expired tokens and sessions
CREATE PROCEDURE IF NOT EXISTS CleanExpiredData()
BEGIN
    -- Clean expired PIN verifications (older than 1 year)
    DELETE FROM PinVerification 
    WHERE verifiedAt < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    -- Clean old notifications (older than 6 months)
    DELETE FROM Notification 
    WHERE createdAt < DATE_SUB(NOW(), INTERVAL 6 MONTH);
    
    -- Clean expired invite tokens
    DELETE FROM InviteToken 
    WHERE expiresAt IS NOT NULL AND expiresAt < NOW();
    
    -- Update expired subscriptions
    UPDATE ProviderSubscription 
    SET isActive = FALSE 
    WHERE expiresAt IS NOT NULL AND expiresAt < NOW() AND isActive = TRUE;
    
    UPDATE UserSubscription 
    SET isActive = FALSE 
    WHERE expiresAt IS NOT NULL AND expiresAt < NOW() AND isActive = TRUE;
END //

DELIMITER ;

-- ==========================================
-- VIEWS FOR COMMON QUERIES
-- ==========================================

-- Active services with owner info
CREATE VIEW IF NOT EXISTS ActiveServicesView AS
SELECT 
    s.*,
    u.name as ownerName,
    u.isVerified as ownerVerified,
    u.profilePic as ownerProfilePic,
    sh.name as shopName,
    sh.slug as shopSlug,
    cat.name as categoryName,
    subcat.name as subCategoryName
FROM Service s
JOIN User u ON s.ownerUserId = u.id
LEFT JOIN Shop sh ON s.shopId = sh.id
LEFT JOIN SubCategory subcat ON s.subCategoryId = subcat.id
LEFT JOIN Category cat ON subcat.categoryId = cat.id
WHERE s.available = TRUE AND s.deletedAt IS NULL;

-- Shop summary with metrics
CREATE VIEW IF NOT EXISTS ShopSummaryView AS
SELECT 
    s.*,
    u.name as ownerName,
    u.isVerified as ownerVerified,
    COUNT(DISTINCT srv.id) as serviceCount,
    COUNT(DISTINCT p.id) as productCount,
    ROUND(AVG(r.rating), 2) as avgRating,
    COUNT(DISTINCT r.id) as reviewCount
FROM Shop s
JOIN User u ON s.ownerId = u.id
LEFT JOIN Service srv ON s.id = srv.shopId AND srv.deletedAt IS NULL AND srv.available = TRUE
LEFT JOIN Product p ON s.id = p.shopId AND p.deletedAt IS NULL AND p.isActive = TRUE
LEFT JOIN Review r ON s.id = r.shopId
WHERE s.deletedAt IS NULL
GROUP BY s.id;

-- ==========================================
-- MAINTENANCE QUERIES
-- ==========================================

-- Create maintenance log table
CREATE TABLE IF NOT EXISTS MaintenanceLog (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    operation VARCHAR(100) NOT NULL,
    description TEXT,
    executedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    executionTime INT, -- in milliseconds
    recordsAffected INT
);

-- Log this optimization
INSERT INTO MaintenanceLog (operation, description, recordsAffected) 
VALUES ('DATABASE_OPTIMIZATION', 'Applied performance indexes and constraints', 0);

-- ==========================================
-- PERFORMANCE MONITORING QUERIES
-- ==========================================

-- Check index usage
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE,
    CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, INDEX_NAME;

-- Check table sizes
SELECT 
    TABLE_NAME,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS "Size (MB)",
    TABLE_ROWS
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;

-- ==========================================
-- BACKUP SCRIPT TEMPLATE
-- ==========================================

-- Use this command to backup the database:
-- mysqldump -u [username] -p[password] [database_name] > daleel_backup_$(date +%Y%m%d_%H%M%S).sql

-- To restore:
-- mysql -u [username] -p[password] [database_name] < daleel_backup_[timestamp].sql

-- ==========================================
-- OPTIMIZATION COMPLETE
-- ==========================================

SELECT 'Database optimization completed successfully! 🎉' as Status;

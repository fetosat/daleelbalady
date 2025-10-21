# Subscription Plan Views API

## Overview
This API provides four distinct subscription plan views, each tailored to different user tiers with varying levels of data access and features.

## Endpoints

### 1. Free Plan View - FreeListingView
**GET** `/api/plan-views/free-listing`

**Purpose:** Publicly visible listing for all verified or basic users/services  
**Access:** Public (no authentication required)  
**Data Level:** Basic service information with limited contact details

**Key Features:**
- Basic service information (name, category, city)
- Approximate map coordinates (2 decimal places)
- Masked phone numbers (last 3 digits hidden)
- Average rating and review count
- Basic social media presence indicators
- Cover and logo images

**Response Fields:**
- `serviceId`, `serviceName`, `ownerName`
- `mainCategory`, `subCategory`, `city`, `address`
- `mapLat`, `mapLon` (approximated)
- `phone` (masked), `socialLinks`, `rating`, `reviewsCount`
- `viewCount` (rounded), `invitationPoints` (always 0)
- `coverImage`, `logoImage`, `createdAt`

---

### 2. Verification Plan View - VerifiedListingView
**GET** `/api/plan-views/verified-listing`

**Purpose:** Enhanced view with verified badges and chat access  
**Access:** Requires verification or paid subscription  
**Data Level:** Full contact information and verification features

**Key Features:**
- All features from Free Plan
- Full contact information (unmasked phone, email, website)
- Verification badges and status
- Chat/messaging capabilities
- Enhanced review details
- Verification expiry dates

**Additional Response Fields:**
- `phone`, `email`, `website` (full details)
- `verified`, `verifiedBadge`, `verificationExpiry`
- `chatEnabled`, `canMessage`
- `recentReviews` (expanded with author details)

---

### 3. Services Plan View - ServiceBookingView
**GET** `/api/plan-views/service-booking`

**Purpose:** Advanced booking and scheduling features for service providers  
**Access:** Requires Services Plan subscription (`BOOKING_BASIC` or higher)  
**Data Level:** Complete booking system integration

**Key Features:**
- All features from previous tiers
- Online booking capabilities
- Schedule and availability management
- Client tracking and analytics
- Booking type configurations
- Follow-up management

**Additional Response Fields:**
- `bookingsEnabled`, `bookingTypes`
- `availabilitySchedule`, `workHours`
- `clientsCount`, `messagesCount`, `followupsCount`
- `basePrice`, `currency`, `duration`
- `recentBookings` (with client details)
- Booking analytics and metrics

---

### 4. Products Plan View - ProductListingView
**GET** `/api/plan-views/product-listing`

**Purpose:** Product-focused view with inventory and POS features  
**Access:** Requires Products Plan subscription (`PRODUCTS_PREMIUM` or higher)  
**Data Level:** Complete product management system

**Key Features:**
- Product catalog management
- Inventory tracking and stock levels
- Sales analytics and revenue data
- POS system integration
- Barcode scanning support
- Order management

**Response Fields:**
- `productId`, `productName`, `description`
- `price`, `currency`, `stock`, `sku`, `isActive`
- `shop` (complete shop information)
- `tags`, `rating`, `reviewsCount`, `recentReviews`
- `salesData` (total sales, revenue, AOV)
- `cashierEnabled`, `inventoryTracking`, `barcodeScanning`
- POS and business management features

---

## Query Parameters

### Common Parameters (All Endpoints)
- `city` - Filter by city name
- `category` - Filter by category name
- `limit` - Number of results per page (default: 20)
- `page` - Page number for pagination (default: 1)
- `sortBy` - Sort field (varies by endpoint)
- `sortOrder` - Sort direction ('asc' or 'desc')

### Endpoint-Specific Parameters

#### Verified Listing
- `verifiedOnly` - Show only verified services (true/false)
- `subCategory` - Filter by subcategory

#### Service Booking
- `availability` - Filter by availability ('all', 'available_now', 'today', etc.)
- `bookingType` - Filter by booking type

#### Product Listing
- `priceMin`, `priceMax` - Price range filters
- `inStock` - Stock filter ('all', 'available', 'out_of_stock')
- `shopId` - Filter by specific shop

---

## Authentication & Authorization

### Free Plan View
- No authentication required
- Public access for basic service discovery

### Verification Plan View
- Requires authentication (`auth` middleware)
- Must have verification status OR paid subscription
- Access validated through `authWithSubscription` middleware

### Services Plan View
- Requires authentication
- Must have provider subscription with booking capabilities
- Validates plan type: `BOOKING_BASIC`, `PRODUCTS_PREMIUM`, `TOP_BRONZE`, `TOP_SILVER`, `TOP_GOLD`

### Products Plan View
- Requires authentication
- Must have provider subscription with product listing capabilities
- Validates plan type: `PRODUCTS_PREMIUM`, `TOP_BRONZE`, `TOP_SILVER`, `TOP_GOLD`

---

## Response Format

All endpoints return a consistent response structure:

```json
{
  "success": true,
  "data": [...], // Array of items based on plan tier
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "planType": "FREE_PLAN", // Plan identifier
  "userBenefits": {...}, // Plan-specific benefits
  "message": "Descriptive message about the plan",
  "additionalFeatures": [...] // Available features for this tier
}
```

---

## Database Integration

The API integrates with the following Prisma models:
- `Service` - Main service data
- `User` - Service owners and customers  
- `Shop` - Shop information and addresses
- `Review` - Reviews and ratings
- `Category`/`SubCategory` - Service categorization
- `ServiceAvailability` - Booking schedules
- `Booking` - Appointment data
- `Product` - Product information
- `UserSubscription`/`ProviderSubscription` - Subscription data
- `UserAnalytics` - Analytics and metrics

---

## Installation & Setup

1. The routes are defined in `/routes/plan-views.js`
2. Added to server configuration in `server.js`:
   ```javascript
   import planViewsRoutes from "./routes/plan-views.js";
   app.use('/api/plan-views', planViewsRoutes);
   ```
3. All endpoints are now available under `/api/plan-views/`

---

## Error Handling

All endpoints include comprehensive error handling:
- Authentication/authorization errors (403)
- Database query errors (500)
- Invalid parameter errors (400)
- Subscription requirement errors with upgrade suggestions

Each error response includes:
- Success status (false)
- Descriptive error message
- Current user/subscription status where applicable
- Suggested upgrade paths for access restrictions

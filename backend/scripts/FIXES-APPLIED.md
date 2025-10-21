# Test Listings Script - Fixes Applied

## Overview
The `create-test-listings.js` script has been completely rewritten to match the actual Prisma schema. The script was failing because it was trying to use fields that don't exist in the database models.

## Date Fixed
2025-01-09

## Critical Issues Fixed

### 1. **Service Model Structure** ❌ → ✅
**Problem**: The script tried to create services with fields like `name`, `description`, `email`, `website`, `isVerified` directly on the Service model.

**Reality**: According to the Prisma schema:
- Service model does NOT have `name` or `description` at the root level
- These fields exist in the `service_translation` model (relation)
- Service only has: `embeddingText`, `phone`, `city`, `locationLat`, `locationLon`, `price`, `durationMins`, `currency`, etc.
- Fields like `email`, `website`, `isVerified` belong to the `Shop` model

**Fix**: 
- Created `service_translation` records first with `name_en`, `name_ar`, `description_en`, `description_ar`
- Linked services to translations via `translationId`
- Moved business-level info (email, website, verified status) to Shop records
- Used `ownerUserId` instead of `userId` for service ownership
- Used `shopId` to link services to shops for VERIFICATION, SERVICES, and PRODUCTS plans

### 2. **Provider Subscription Model** ❌ → ✅
**Problem**: Script used `userId` and invalid plan types like "FREE", "VERIFICATION", "SERVICES", "PRODUCTS"

**Reality**: 
- The field is `providerId`, not `userId`
- Valid enum values are: `BASIC_FREE`, `BOOKING_BASIC`, `PRODUCTS_PREMIUM`, `TOP_BRONZE`, `TOP_SILVER`, `TOP_GOLD`
- Required fields: `providerId`, `planType`, `pricePerYear`, `canTakeBookings`, `canListProducts`, `isActive`
- Invalid fields removed: `status`, `startDate`, `endDate`, `bookingLimit`, `productLimit`

**Fix**:
- Changed all `userId` to `providerId`
- Updated plan types:
  - "FREE" → N/A (no subscription created)
  - "VERIFICATION" → `BASIC_FREE`
  - "SERVICES" → `BOOKING_BASIC`
  - "PRODUCTS" → `PRODUCTS_PREMIUM`
- Added required fields: `pricePerYear`, `isActive`
- Removed invalid fields

### 3. **Service Availability Model** ❌ → ✅
**Problem**: Script tried to use fields like `isAvailable` and `slots` (JSON array)

**Reality**:
- No `isAvailable` field
- No `slots` field (this was meant to be a JSON structure)
- Valid fields: `serviceId`, `dayOfWeek` (enum), `startTime`, `endTime`, `isRecurring`, `timezone`

**Fix**:
- Removed `isAvailable` and `slots` fields
- Used correct WeekDay enum values: `SUNDAY`, `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`
- Set `isRecurring: true` for weekly schedules
- Used simple time strings like "09:00" and "17:00"

### 4. **Product Model** ❌ → ✅
**Problem**: Script used non-existent fields

**Reality**:
- Does NOT have: `compareAtPrice`, `category`, `isAvailable`, `image`, `images`, `tags` (as array), `specifications`, `sellerId`
- Valid fields: `name`, `description`, `price`, `currency`, `stock`, `sku`, `isActive`, `embeddingText`, `shopId`, `listerId`

**Fix**:
- Removed all invalid fields
- Changed `isAvailable` to `isActive`
- Changed `sellerId` to `listerId`
- Moved specifications into the description text
- Simplified product data structure

### 5. **Review Model** ❌ → ✅
**Problem**: Used `reviewerName` field and no author relationship

**Reality**:
- Must have `authorId` (required relation to User)
- No `reviewerName` field
- Valid fields: `id`, `authorId`, `rating`, `comment`, `serviceId`, `productId`, `shopId`, `createdAt`

**Fix**:
- Created reviewer users for each review
- Used `authorId` instead of `reviewerName`
- Properly linked reviews to services or shops

### 6. **Package.json Configuration** ⚠️ → ✅
**Problem**: Warning about module type not specified

**Fix**:
- Added `"type": "module"` to package.json to properly support ES modules

## Script Flow After Fixes

### FREE Plan Listings
1. Create user with CUSTOMER role
2. Create `service_translation` with bilingual names/descriptions
3. Create `service` with translation link
4. Add reviews (each with a new reviewer user)

### VERIFICATION Plan Listings
1. Create user with PROVIDER role
2. Create `shop` with verified badge, email, website
3. Create `service_translation`
4. Create `service` linked to shop
5. Create `providerSubscription` with `BASIC_FREE` plan
6. Add reviews to shop

### SERVICES Plan Listings
1. Create user with PROVIDER role
2. Create `shop` with booking info
3. Create `service_translation`
4. Create `service` with price and duration
5. Create `providerSubscription` with `BOOKING_BASIC` plan (1000 EGP/year)
6. Create `serviceAvailability` for each day of the week
7. Add reviews to shop

### PRODUCTS Plan Listings
1. Create user with PROVIDER role
2. Create `shop` with e-commerce setup
3. Create `providerSubscription` with `PRODUCTS_PREMIUM` plan (2000 EGP/year)
4. Create 3-7 products with proper schema fields
5. Add reviews to shop

## Running the Script

```bash
cd /var/www/daleelai-backend
node scripts/create-test-listings.js
```

Or locally on Windows:
```powershell
cd C:\Users\WDAGUtilityAccount\Desktop\daleelbalady\backend
node scripts/create-test-listings.js
```

## Expected Output

```
🚀 Starting test listings generation...

📋 Creating FREE Plan Listings...
✅ Created FREE listing: Dr. Ahmed Hassan - Cardiology Clinic
✅ Created FREE listing: Math Masters Tutoring
✅ Created FREE listing: Quick Burger
✅ Created FREE listing: Luxury Spa & Wellness

📋 Creating VERIFICATION Plan Listings...
✅ Created VERIFIED listing: Dr. Ahmed Hassan - Cardiology Clinic
✅ Created VERIFIED listing: Math Masters Tutoring
✅ Created VERIFIED listing: Pizza Palace
✅ Created VERIFIED listing: Elegance Hair Salon

📋 Creating SERVICES Plan Listings...
✅ Created SERVICES listing with booking: Cairo Dental Center
✅ Created SERVICES listing with booking: Math Masters Tutoring
✅ Created SERVICES listing with booking: Pizza Palace
✅ Created SERVICES listing with booking: Luxury Spa & Wellness

📋 Creating PRODUCTS Plan Listings...
✅ Created PRODUCTS listing with 5 products: Fashion House Boutique
✅ Created PRODUCTS listing with 4 products: Tech Electronics Store
✅ Created PRODUCTS listing with 6 products: Book Corner Library
✅ Created PRODUCTS listing with 3 products: Home Essentials Shop

✨ Successfully created 16 test listings!

📊 Summary:
- FREE Plan: 4 listings (basic info, masked contact)
- VERIFICATION Plan: 4 listings (verified badge, full contact)
- SERVICES Plan: 4 listings (booking system, availability)
- PRODUCTS Plan: 4 shops with products (e-commerce)

🔐 Test User Credentials:
Password for all test users: test123456

Emails:
  FREE: free-user-1@daleelbalady.com
  VERIFICATION: verification-user-1@daleelbalady.com
  SERVICES: services-user-1@daleelbalady.com
  PRODUCTS: products-user-1@daleelbalady.com
```

## Database Tables Populated

After running the script, the following tables will have test data:

1. **User** - 16+ test users (4 providers + reviewers)
2. **Shop** - 12 shops (VERIFICATION, SERVICES, PRODUCTS plans)
3. **Service** - 16 services (all plan types)
4. **service_translation** - 16 translations
5. **ProviderSubscription** - 12 subscriptions
6. **ServiceAvailability** - 28 availability records (7 days × 4 services)
7. **Product** - 15-25 products (3-7 per shop)
8. **Review** - 32-96 reviews (2-6 per listing)

## Testing the Data

You can verify the data was created correctly:

```sql
-- Check users
SELECT id, name, email, role, isVerified FROM User WHERE email LIKE '%daleelbalady.com';

-- Check shops
SELECT id, name, email, isVerified, ownerId FROM Shop;

-- Check services
SELECT s.id, st.name_en, s.price, s.city, s.shopId 
FROM Service s 
LEFT JOIN service_translation st ON s.translationId = st.id;

-- Check subscriptions
SELECT id, providerId, planType, pricePerYear, canTakeBookings, canListProducts 
FROM ProviderSubscription;

-- Check products
SELECT id, name, price, stock, shopId FROM Product;

-- Check reviews
SELECT r.id, r.rating, r.comment, u.name as author_name 
FROM Review r 
JOIN User u ON r.authorId = u.id;
```

## Next Steps

1. ✅ Script now creates data correctly matching the schema
2. ✅ All plan types are properly differentiated
3. ✅ Realistic Egyptian city locations and bilingual content
4. ✅ Proper relationships between all models
5. Test the frontend to ensure listings display correctly
6. Test booking functionality for SERVICES plan listings
7. Test product shopping for PRODUCTS plan listings
8. Verify search and filtering works with the test data

## Troubleshooting

If you still encounter errors:

1. **Check your Prisma schema** - Run `npx prisma db pull` to ensure your schema matches the database
2. **Regenerate Prisma Client** - Run `npx prisma generate`
3. **Check database connection** - Verify DATABASE_URL in .env
4. **Clear existing data** - If needed, manually delete test users/shops before running again
5. **Check logs** - The script outputs detailed error messages for debugging


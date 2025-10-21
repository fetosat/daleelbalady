# Run Test Listings Script - Quick Guide

## ✅ All Fixes Have Been Applied!

The script has been completely rewritten to match your Prisma schema. All the issues causing the errors have been resolved.

## 🚀 How to Run

### On Your Remote Server

```bash
# SSH into your server
ssh root@mail

# Navigate to backend directory
cd /var/www/daleelai-backend

# Run the script
node scripts/create-test-listings.js
```

## 📋 What Was Fixed

1. ✅ **Service model** - Now creates translations and links properly
2. ✅ **Shop model** - Properly handles email, website, verified status
3. ✅ **ProviderSubscription** - Uses correct field names and enum values
4. ✅ **ServiceAvailability** - Matches actual schema fields
5. ✅ **Product model** - Uses only valid fields
6. ✅ **Review model** - Creates reviewer users with correct authorId
7. ✅ **Package.json** - Added "type": "module" to avoid warnings

## 📊 Expected Results

The script will create:

- **16 test listings** across 4 plan types
- **4 FREE** listings (basic services)
- **4 VERIFICATION** listings (verified shops with services)
- **4 SERVICES** listings (bookable services with availability)
- **4 PRODUCTS** listings (shops with 3-7 products each)
- **30-50+ reviews** distributed across all listings
- **28 availability schedules** (7 days × 4 bookable services)
- **12 provider subscriptions** with correct plan types

## 🔑 Test User Logins

After the script runs, you can log in with these accounts:

| Plan Type     | Email                                       | Password    |
|---------------|---------------------------------------------|-------------|
| FREE          | free-user-1@daleelbalady.com                | test123456  |
| VERIFICATION  | verification-user-1@daleelbalady.com        | test123456  |
| SERVICES      | services-user-1@daleelbalady.com            | test123456  |
| PRODUCTS      | products-user-1@daleelbalady.com            | test123456  |

## ✨ What Each Plan Type Creates

### FREE Plan
- ✅ Basic service listing
- ✅ No shop (just service)
- ✅ No subscription
- ✅ Customer role user
- ❌ No email/website visibility
- ❌ No verified badge
- ❌ No booking system
- ❌ No products

### VERIFICATION Plan
- ✅ Verified shop with service
- ✅ Email & website visible
- ✅ Verified badge (isVerified: true)
- ✅ BASIC_FREE subscription (0 EGP/year)
- ✅ Provider role user
- ❌ No booking system
- ❌ No products

### SERVICES Plan
- ✅ Verified shop with service
- ✅ Email & website visible
- ✅ Verified badge
- ✅ BOOKING_BASIC subscription (1,000 EGP/year)
- ✅ Provider role user
- ✅ Booking system enabled (canTakeBookings: true)
- ✅ 7-day availability schedule
- ✅ Price & duration set
- ❌ No products

### PRODUCTS Plan
- ✅ Verified shop
- ✅ Email & website visible
- ✅ Verified badge
- ✅ PRODUCTS_PREMIUM subscription (2,000 EGP/year)
- ✅ Provider role user
- ✅ Booking enabled
- ✅ Products enabled (canListProducts: true)
- ✅ 3-7 products with inventory

## 🧪 Verify the Data

After running the script, check the database:

```sql
-- Count created items
SELECT 'Users' as Table_Name, COUNT(*) as Count FROM User WHERE email LIKE '%@daleelbalady.com'
UNION ALL
SELECT 'Shops', COUNT(*) FROM Shop
UNION ALL
SELECT 'Services', COUNT(*) FROM Service
UNION ALL
SELECT 'Translations', COUNT(*) FROM service_translation
UNION ALL
SELECT 'Subscriptions', COUNT(*) FROM ProviderSubscription
UNION ALL
SELECT 'Products', COUNT(*) FROM Product
UNION ALL
SELECT 'Reviews', COUNT(*) FROM Review
UNION ALL
SELECT 'Availabilities', COUNT(*) FROM ServiceAvailability;

-- View a sample service with translation
SELECT 
  s.id,
  st.name_en,
  st.name_ar,
  s.price,
  s.city,
  s.phone,
  sh.email,
  sh.website,
  sh.isVerified
FROM Service s
LEFT JOIN service_translation st ON s.translationId = st.id
LEFT JOIN Shop sh ON s.shopId = sh.id
LIMIT 5;

-- View subscriptions
SELECT 
  ps.id,
  u.email,
  ps.planType,
  ps.pricePerYear,
  ps.canTakeBookings,
  ps.canListProducts,
  ps.isActive
FROM ProviderSubscription ps
JOIN User u ON ps.providerId = u.id;
```

## 🎉 Success Criteria

The script should complete WITHOUT errors and display:

```
✨ Successfully created 16 test listings!

📊 Summary:
- FREE Plan: 4 listings (basic info, masked contact)
- VERIFICATION Plan: 4 listings (verified badge, full contact)
- SERVICES Plan: 4 listings (booking system, availability)
- PRODUCTS Plan: 4 shops with products (e-commerce)
```

## ❌ If You Still Get Errors

1. Make sure your database connection is working
2. Check that your Prisma schema is up to date: `npx prisma db pull`
3. Regenerate Prisma client: `npx prisma generate`
4. Check the detailed error message - it will tell you which field is invalid
5. Read `FIXES-APPLIED.md` for detailed information about what was changed

## 📝 Notes

- All test data uses realistic Egyptian cities
- Bilingual content (English & Arabic) is included
- Phone numbers follow Egyptian format (+2010xxxxxxxx)
- Reviews are from randomly created reviewer accounts
- Coordinates are generated within Egypt's geographic bounds
- All passwords are: `test123456`

## 🔄 Re-running the Script

If you need to run the script again:

1. It will skip creating users that already exist (email uniqueness)
2. New services/shops will be created each time
3. Consider clearing test data first if needed:

```sql
-- Be careful! This deletes ALL test users and their related data
DELETE FROM User WHERE email LIKE '%@daleelbalady.com';
```

## 📚 Additional Documentation

- See `FIXES-APPLIED.md` for detailed technical information
- See `README-TEST-LISTINGS.md` for original documentation
- See `QUICK-START-TEST-DATA.md` for a quick overview

---

**Ready to run?** Just execute: `node scripts/create-test-listings.js` 🚀


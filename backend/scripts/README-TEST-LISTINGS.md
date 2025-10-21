# Test Listings Generator

## Overview

This script generates comprehensive test data for all subscription plan types in the Daleelbalady platform. It creates realistic listings, users, reviews, and related data to facilitate development, testing, and demonstration.

## Features

### Plan Types Covered

1. **FREE Plan** (4 listings)
   - Basic business information
   - Masked phone numbers
   - Limited contact details
   - No premium features

2. **VERIFICATION Plan** (4 listings)
   - Verified badge
   - Full contact details (phone, email, website)
   - Chat enabled
   - Enhanced credibility

3. **SERVICES Plan** (4 listings)
   - All verification features
   - Booking system enabled
   - Availability schedules (Mon-Sat, 9am-5pm)
   - Service pricing and duration
   - Client tracking ready

4. **PRODUCTS Plan** (4 shops)
   - All verification features
   - E-commerce enabled
   - 3-7 products per shop
   - Product specifications
   - Inventory management
   - SKU tracking

## Data Generated

### For Each Listing:
- ✅ User account with appropriate role
- ✅ Business/service information
- ✅ Location data (Egyptian cities + coordinates)
- ✅ Contact information (phone, email, website)
- ✅ Images (cover, logo)
- ✅ Arabic translations
- ✅ 2-6 customer reviews (4-5 stars)
- ✅ Provider subscription (for paid plans)

### Additional Data:
- **Services Plan:** Availability schedules with time slots
- **Products Plan:** Multiple products with pricing, stock, specifications

## Usage

### Run the Script

```bash
# From backend directory
cd backend
node scripts/create-test-listings.js
```

### Expected Output

```
🚀 Starting test listings generation...

📋 Creating FREE Plan Listings...

✅ Created FREE listing: Dr. Ahmed Hassan - Cardiology Clinic
✅ Created FREE listing: English Excellence Academy
✅ Created FREE listing: Al-Masry Restaurant
✅ Created FREE listing: Elegance Hair Salon

📋 Creating VERIFICATION Plan Listings...

✅ Created VERIFIED listing: Cairo Dental Center
✅ Created VERIFIED listing: Math Masters Tutoring
✅ Created VERIFIED listing: Pizza Palace
✅ Created VERIFIED listing: Luxury Spa & Wellness

📋 Creating SERVICES Plan Listings...

✅ Created SERVICES listing with booking: Kids Health Pediatrics
✅ Created SERVICES listing with booking: Music & Arts School
✅ Created SERVICES listing with booking: Golden Dragon Chinese
✅ Created SERVICES listing with booking: Perfect Nails Studio

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

## Test User Credentials

### Login Credentials
All test users share the same password: **`test123456`**

### User Emails by Plan Type

| Plan Type | Email Pattern | Example |
|-----------|---------------|---------|
| FREE | `free-user-{1-4}@daleelbalady.com` | `free-user-1@daleelbalady.com` |
| VERIFICATION | `verification-user-{1-4}@daleelbalady.com` | `verification-user-1@daleelbalady.com` |
| SERVICES | `services-user-{1-4}@daleelbalady.com` | `services-user-1@daleelbalady.com` |
| PRODUCTS | `products-user-{1-4}@daleelbalady.com` | `products-user-1@daleelbalady.com` |

## Categories & Businesses

### Healthcare
- Dr. Ahmed Hassan - Cardiology Clinic
- Cairo Dental Center
- Kids Health Pediatrics
- Family Medical Clinic

### Education
- English Excellence Academy
- Math Masters Tutoring
- Music & Arts School
- SAT Prep Center

### Restaurants
- Al-Masry Restaurant
- Pizza Palace
- Golden Dragon Chinese
- Quick Burger

### Beauty & Wellness
- Elegance Hair Salon
- Luxury Spa & Wellness
- Perfect Nails Studio
- Classic Barbershop

### Retail
- Fashion House Boutique
- Tech Electronics Store
- Book Corner Library
- Home Essentials Shop

### Automotive
- Auto Pro Repair Shop
- Shine Car Wash
- Tire Express Center
- Quick Lube Service

## Data Structure

### Service Fields
```javascript
{
  name: "Business Name",
  city: "Cairo",
  locationLat: 30.0444,
  locationLon: 31.2357,
  phone: "+201012345678",
  email: "contact@business.com",
  website: "https://www.business.com",
  description: "Professional services...",
  coverImage: "https://...",
  logoImage: "https://...",
  isVerified: true/false,
  translation: {
    name_en: "English Name",
    name_ar: "الاسم بالعربية",
    description_en: "English Description",
    description_ar: "الوصف بالعربية"
  }
}
```

### Product Fields
```javascript
{
  name: "Product Name",
  description: "Product description",
  price: 299,
  compareAtPrice: 359, // 20% discount
  currency: "EGP",
  stock: 50,
  sku: "SKU-1234567890-1",
  category: "Electronics",
  isAvailable: true,
  images: ["url1", "url2"],
  tags: ["electronics", "quality", "egypt"],
  specifications: {
    "Brand": "Brand Name",
    "Origin": "Egypt",
    "Quality": "Premium",
    "Warranty": "1 Year"
  }
}
```

## Availability Schedule Example

For SERVICES plan listings:

```javascript
{
  monday: {
    isAvailable: true,
    startTime: "09:00",
    endTime: "17:00",
    slots: [
      { time: "09:00", available: true },
      { time: "10:00", available: true },
      { time: "11:00", available: true },
      { time: "12:00", available: true },
      { time: "14:00", available: true },
      { time: "15:00", available: true },
      { time: "16:00", available: true }
    ]
  },
  // ... same for tuesday through saturday
}
```

## Troubleshooting

### Error: User already exists
The script handles duplicate users gracefully. If a user with the same email exists, it will reuse that user for creating listings.

### Error: Database connection failed
Ensure your database is running and the connection string in `.env` is correct:
```bash
DATABASE_URL="your-database-url"
```

### Error: Prisma client not generated
Run:
```bash
npx prisma generate
```

## Customization

### Change Number of Listings
Edit line 442 in `create-test-listings.js`:
```javascript
for (let i = 0; i < 4; i++) { // Change 4 to desired number
```

### Add More Categories
Add to the `CATEGORIES` object (line 27):
```javascript
fitness: {
  name: "Fitness & Sports",
  nameAr: "اللياقة والرياضة",
  subcategories: ["Gym", "Yoga", "Personal Training"]
}
```

### Change Default Password
Edit line 134:
```javascript
const hashedPassword = await bcrypt.hash("test123456", salt);
// Change "test123456" to your desired password
```

## Database Impact

This script will create:
- **~16 users** (4 per plan type)
- **16 listings** (services/shops)
- **~15-30 products** (for PRODUCTS plan shops)
- **~60 reviews** (~4 reviews per listing)
- **~24 availability schedules** (for SERVICES plan)
- **~8 provider subscriptions** (for paid plans)

**Total records:** ~125-145 database entries

## Cleanup

To remove test data:

```sql
-- Delete test users and related data (cascades)
DELETE FROM "User" WHERE email LIKE '%@daleelbalady.com';

-- Or delete by plan type
DELETE FROM "User" WHERE email LIKE 'free-user-%@daleelbalady.com';
DELETE FROM "User" WHERE email LIKE 'verification-user-%@daleelbalady.com';
DELETE FROM "User" WHERE email LIKE 'services-user-%@daleelbalady.com';
DELETE FROM "User" WHERE email LIKE 'products-user-%@daleelbalady.com';
```

## Related Scripts

- `create-test-user.js` - Creates a single test user
- `populate-service-locations.js` - Populates location data
- `populate-shop-locations.js` - Populates shop locations

## Support

For issues or questions:
1. Check the console output for specific error messages
2. Verify database connection
3. Ensure Prisma schema is up to date
4. Check that all required dependencies are installed

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready


# Quick Start: Generate Test Data

## 🚀 One-Command Setup

```bash
cd backend
node scripts/create-test-listings.js
```

## 📊 What You'll Get

- **16 Test Listings** across 4 plan types
- **16 Test Users** with login credentials
- **20-30 Products** in shops
- **60+ Reviews** on listings
- **Complete Booking System** for service listings

## 🔐 Login Credentials

**Password (all users):** `test123456`

**User Emails:**
```
FREE Plan:
  free-user-1@daleelbalady.com

VERIFICATION Plan:
  verification-user-1@daleelbalady.com

SERVICES Plan (with Booking):
  services-user-1@daleelbalady.com

PRODUCTS Plan (E-commerce):
  products-user-1@daleelbalady.com
```

## ✨ Test Each Plan Type

### 1. FREE Plan
**Features to Test:**
- Basic listing view
- Masked phone number (+201234XXX)
- Upgrade CTAs
- Limited information

**Example Listing:** Dr. Ahmed Hassan - Cardiology Clinic

### 2. VERIFICATION Plan
**Features to Test:**
- Verified badge display
- Full phone number visible
- Email and website links
- Direct messaging button

**Example Listing:** Cairo Dental Center

### 3. SERVICES Plan
**Features to Test:**
- Online booking system
- Availability calendar
- Time slot selection
- Booking confirmation
- Service pricing

**Example Listing:** Kids Health Pediatrics

### 4. PRODUCTS Plan
**Features to Test:**
- Product catalog
- Add to cart
- Stock management
- Product specifications
- Price and discounts

**Example Listing:** Fashion House Boutique

## 🗂️ Data Structure

### Locations
- 15 Egyptian cities (Cairo, Alexandria, Giza, etc.)
- Realistic GPS coordinates
- Full addresses

### Categories
- Healthcare (Doctors, Dentists, etc.)
- Education (Tutoring, Courses)
- Restaurants (Egyptian, Italian, Chinese)
- Beauty & Wellness (Salons, Spas)
- Retail (Clothing, Electronics, Books)
- Automotive (Repair, Wash, Tires)

### Translations
- Full Arabic support
- English + Arabic names
- Bilingual descriptions

## 📝 What Gets Created

```
Users: 16
├── FREE Plan: 4 users
├── VERIFICATION Plan: 4 users
├── SERVICES Plan: 4 users
└── PRODUCTS Plan: 4 users

Listings: 16
├── Services: 12 (FREE, VERIFICATION, SERVICES)
└── Shops: 4 (PRODUCTS with inventory)

Reviews: ~60
├── 4-5 star ratings
├── Realistic comments
└── Random dates (last 30 days)

Products: ~20-30
├── 3-7 products per shop
├── Pricing with discounts
├── Stock quantities
└── Specifications

Availability: ~24 schedules
└── Mon-Sat, 9am-5pm with time slots

Subscriptions: 12
└── Active subscriptions for paid plans
```

## 🧪 Testing Workflows

### Test Free → Verification Upgrade
1. Login as `free-user-1@daleelbalady.com`
2. View limited features
3. Click upgrade CTAs
4. Compare with `verification-user-1@daleelbalady.com`

### Test Service Booking
1. Login as any user
2. Browse services-user listings
3. Check availability calendar
4. Select time slot
5. Complete booking

### Test E-commerce
1. Login as any user
2. Browse products-user shops
3. View product details
4. Add to cart
5. Proceed to checkout

### Test Admin Features
1. Login as admin
2. View all test listings
3. Verify plan types
4. Check subscriptions
5. Review booking schedules

## 🛠️ Troubleshooting

### Script Fails to Run
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Check database connection
npx prisma db push
```

### Duplicate Entries
The script handles duplicates gracefully - it will reuse existing users with same emails.

### Clear Test Data
```bash
# In PostgreSQL/MySQL console
DELETE FROM "User" WHERE email LIKE '%@daleelbalady.com';
```

## 📚 Full Documentation

For detailed information, see:
- `scripts/README-TEST-LISTINGS.md` - Complete documentation
- `scripts/create-test-listings.js` - Source code with comments

## 🎯 Next Steps

After generating test data:

1. **Frontend Testing**
   - Visit listing pages
   - Test plan-specific features
   - Verify UI/UX for each tier

2. **API Testing**
   - Test GET /api/services/:id
   - Test POST /api/bookings
   - Test POST /api/cart

3. **Admin Testing**
   - Review user management
   - Check subscription status
   - View booking schedules

4. **Mobile Testing**
   - Responsive design
   - Touch interactions
   - Mobile payments

## 💡 Pro Tips

1. **Use different browsers** for different user types
2. **Test Arabic/RTL** with right-to-left layout
3. **Check email formatting** for notifications
4. **Test edge cases** like out-of-stock products
5. **Verify analytics tracking** for view counts

---

**Need Help?** Check the full documentation in `scripts/README-TEST-LISTINGS.md`

**Found Issues?** Report them with the specific user email and listing ID

**Ready to Deploy?** Clean test data before production!

---

**Generated:** December 2024  
**Version:** 1.0.0  
**Status:** ✅ Ready to Use


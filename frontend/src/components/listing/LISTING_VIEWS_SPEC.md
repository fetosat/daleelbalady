# Listing Views Specification

## Overview

This document provides comprehensive specifications for all listing view components in the Daleelbalady platform. Each view corresponds to a subscription plan tier and determines what information and features are displayed.

---

## 🧩 1. FreeListingView - Free Plan

### Purpose
Publicly visible listing for all verified or basic users/services, showing only **essential business information** with **limited contact details**.

### Data Sources
- **Service** (primary entity)
- **User** (owner/provider)
- **Shop** (if applicable)
- **Review** (ratings and feedback)
- **SubCategory & Category** (classification)
- **Analytics** (view counts)
- **Referral** (invitation points)

### Key Fields

| Field | Source | Type | Description |
|-------|--------|------|-------------|
| `serviceId` | Service.id | string | Unique service identifier |
| `serviceName` | Service.translation.name or fallback | string | Service name (with i18n support) |
| `ownerName` | User.name | string | Owner's public name |
| `mainCategory` | Category.name | string | Human-readable main category |
| `subCategory` | SubCategory.name | string | Human-readable subcategory |
| `city` | Service.city | string | Location city |
| `address` | Shop.address / Service.city | string | Full text address |
| `mapLat` | Service.locationLat | number | Map latitude coordinate |
| `mapLon` | Service.locationLon | number | Map longitude coordinate |
| `phone` | Service.phone | string | **MASKED** contact number (e.g., +201234XXX) |
| `socialLinks` | Service.design / User | object | Social media links |
| `rating` | AVG(Review.rating) | number | Average rating (0-5) |
| `reviewsCount` | COUNT(Review.id) | number | Total number of reviews |
| `viewCount` | Analytics.views | number | Number of profile views |
| `invitationPoints` | Referral.points | number | Points earned from referrals |
| `coverImage` | Service.coverImage | string (URL) | Banner/hero image |
| `logoImage` | Service.logoImage | string (URL) | Logo/profile picture |

### TypeScript Interface

```typescript
interface FreeListingData {
  // Core identifiers
  id: string
  serviceId?: string
  
  // Names and descriptions
  name: string
  serviceName?: string
  ownerName?: string
  description?: string
  translation?: {
    name_en?: string
    name_ar?: string
    description_en?: string
    description_ar?: string
  }
  
  // Categories
  mainCategory?: string
  subCategory?: string
  category?: string | { en: string; ar: string }
  
  // Location (coordinates for map)
  city?: string
  address?: string
  locationLat?: number
  locationLon?: number
  mapLat?: number
  mapLon?: number
  
  // Contact (MASKED for free tier)
  phone?: string // Displayed as XXX-XXX-X123
  website?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  
  // Engagement metrics
  rating?: number
  avgRating?: number
  reviewsCount?: number
  viewCount?: number
  invitationPoints?: number
  
  // Media
  coverImage?: string
  logoImage?: string
  
  // Related data
  reviews?: Review[]
  services?: Service[]
  _count?: {
    services?: number
    reviews?: number
  }
}
```

### Features
- ✅ Public visibility
- ✅ Basic info display
- ✅ **Masked** phone number
- ✅ Limited contact details
- ✅ Reviews preview (first 3)
- ✅ Services list (if available)
- ✅ Social media links
- ✅ Map preview (locked)
- ❌ No direct chat/messaging
- ❌ No full contact access
- ❌ No booking functionality
- ❌ No product sales

### UI Elements
- Prominent upgrade notice/CTA
- Locked features indicators
- "Upgrade to unlock" buttons
- Limited contact information display

---

## 🏅 2. VerifiedListingView - Verification Plan

### Purpose
Adds **verified badge** and **chat access** for verified users/services. Shows full contact details with messaging capabilities.

### Data Sources
Extends FreeListingView with:
- **UserSubscription** (verification status)
- **ProviderSubscription** (verification expiry)
- **Chat** (messaging capability)

### Additional Fields

| Field | Source | Type | Description |
|-------|--------|------|-------------|
| `verified` | User.isVerified / Shop.isVerified | boolean | Verification status |
| `verifiedBadge` | User.verifiedBadge | string | Badge type (gold, verified_business, etc.) |
| `chatEnabled` | true (when verified) | boolean | Enables direct messaging |
| `verificationExpiry` | UserSubscription / ProviderSubscription | Date | Date of badge expiry |
| `phone` | Service.phone | string | **FULL** contact number (unmasked) |
| `email` | Service.email / User.email | string | **FULL** email address |

### TypeScript Interface

```typescript
interface VerifiedListingData extends FreeListingData {
  // Verification details
  isVerified: boolean
  verifiedBadge?: string // 'gold' | 'verified_business' | 'trusted'
  verificationExpiry?: string // ISO date
  
  // Full contact (unmasked)
  phone: string // Full number: +201234567890
  email?: string
  
  // Chat capability
  chatEnabled: boolean
  ownerUser?: {
    id: string
    name: string
    isVerified: boolean
  }
}
```

### Features
Everything from Free Plan, PLUS:
- ✅ **Verified badge** display
- ✅ **Full phone number** (unmasked)
- ✅ **Full email address**
- ✅ **Direct chat/messaging**
- ✅ "Start Chat" button
- ✅ Enhanced credibility
- ❌ No booking system
- ❌ No product sales

### UI Elements
- Prominent verified badge (green checkmark)
- "Start Chat" button (prominent)
- Full contact information
- No upgrade prompts
- Enhanced trust indicators

---

## ⚙️ 3. ServiceBookingView - Services Plan

### Purpose
Enables **advanced features** for premium service providers — bookings, availability scheduling, client tracking, appointment management, etc.

### Data Sources
Extends VerifiedListingView with:
- **Service** (detailed service info)
- **ServiceAvailability** (working hours/schedule)
- **Booking** (appointment data)
- **Customer** (client tracking)
- **Chat** (client messages)

### Additional Fields

| Field | Source | Type | Description |
|-------|--------|------|-------------|
| `serviceId` | Service.id | string | Service reference |
| `ownerName` | User.name | string | Provider name |
| `bookingsEnabled` | Boolean (from subscription) | boolean | Feature flag for bookings |
| `availabilitySchedule` | ServiceAvailability (JSON) | object | Working hours and availability |
| `bookingTypes` | Derived from services | string[] | Types: ["Clinic Visit", "Home Visit", "Consultation"] |
| `workHours` | ServiceAvailability | object | Opening/closing times per day |
| `clientsCount` | COUNT(DISTINCT Booking.userId) | number | Unique client count |
| `messagesCount` | COUNT(Chat.messages) | number | Chat activity volume |
| `followupsCount` | COUNT(Booking WHERE status='followup') | number | Client follow-ups needed |
| `createdAt` | Service.createdAt | Date | Date service was added |
| `price` | Service.price | number | Service price |
| `duration` | Service.duration / durationMins | number | Service duration in minutes |
| `currency` | Service.currency | string | Price currency (e.g., 'EGP', 'USD') |

### TypeScript Interface

```typescript
interface ServiceBookingData extends VerifiedListingData {
  // Service details
  serviceId: string
  price?: number
  currency?: string
  duration?: number // in minutes
  durationMins?: number
  
  // Booking system
  bookingsEnabled: boolean
  availabilitySchedule?: {
    [day: string]: { // 'monday', 'tuesday', etc.
      isAvailable: boolean
      slots: Array<{
        startTime: string // 'HH:mm'
        endTime: string // 'HH:mm'
        maxBookings: number
      }>
    }
  }
  bookingTypes?: string[]
  workHours?: {
    [day: string]: {
      open: string // 'HH:mm'
      close: string // 'HH:mm'
    }
  }
  
  // Client metrics
  clientsCount?: number
  messagesCount?: number
  followupsCount?: number
  
  // Metadata
  createdAt: string
}
```

### Features
Everything from Verification Plan, PLUS:
- ✅ **Online booking system**
- ✅ **Availability calendar**
- ✅ **Appointment scheduling**
- ✅ **Client management**
- ✅ **Booking types** (clinic visit, home visit, etc.)
- ✅ **Working hours** display
- ✅ **Client tracking** (total clients, messages)
- ✅ **Follow-up management**
- ✅ **Service pricing** display
- ❌ No product inventory

### UI Elements
- "Book Now" button (prominent)
- Availability calendar/schedule
- Booking type selector
- Time slot picker
- Client count badges
- Service pricing cards
- Appointment confirmation modal

---

## 🛍️ 4. ProductListingView - Products Plan

### Purpose
Used for the **Products Plan** (same price tier as Services, but product-focused). Enables e-commerce features for selling physical/digital products.

### Data Sources
Extends VerifiedListingView with:
- **Product** (inventory)
- **Shop** (store info)
- **Review** (product reviews)
- **Order** (sales tracking)
- **Cart** (shopping cart)

### Additional Fields

| Field | Source | Type | Description |
|-------|--------|------|-------------|
| `productId` | Product.id | string | Unique product identifier |
| `productName` | Product.name | string | Product name |
| `price` | Product.price | number | Product price |
| `compareAtPrice` | Product.compareAtPrice | number | Original price (for discounts) |
| `stock` | Product.stock | number | Inventory count |
| `sku` | Product.sku | string | Stock Keeping Unit |
| `shopName` | Shop.name | string | Shop/store name |
| `coverImage` | Product.image / Shop.logo | string (URL) | Main product image |
| `images` | Product.images | string[] | Product image gallery |
| `tags` | Product.tags | string[] | Product keywords/tags |
| `specifications` | Product.specifications | object | Product specs (size, color, etc.) |
| `reviewsCount` | COUNT(Review.id) | number | Total product reviews |
| `salesCount` | COUNT(Order.items WHERE productId) | number | Units sold |
| `cashierEnabled` | Boolean (from plan) | boolean | POS system access flag |
| `isAvailable` | Product.isAvailable | boolean | Product availability status |
| `category` | Product.category | string | Product category |

### TypeScript Interface

```typescript
interface ProductListingData extends VerifiedListingData {
  // Product details
  productId?: string
  productName?: string
  sku?: string
  
  // Pricing
  price: number
  compareAtPrice?: number // For showing discounts
  currency?: string
  
  // Inventory
  stock: number
  isAvailable: boolean
  
  // Shop info
  shopName?: string
  shop?: {
    id: string
    name: string
    logoImage?: string
    city?: string
  }
  
  // Media
  images?: string[]
  coverImage?: string
  
  // Metadata
  tags?: string[]
  specifications?: {
    [key: string]: string // e.g., { "Size": "Large", "Color": "Blue" }
  }
  
  // Metrics
  salesCount?: number
  reviewsCount?: number
  
  // E-commerce features
  cashierEnabled?: boolean
  
  // Products array (if listing multiple products)
  products?: Array<{
    id: string
    name: string
    price: number
    stock: number
    image?: string
  }>
}
```

### Features
Everything from Verification Plan, PLUS:
- ✅ **Product catalog**
- ✅ **Shopping cart**
- ✅ **Inventory management**
- ✅ **Product specifications**
- ✅ **Image gallery**
- ✅ **Price & stock display**
- ✅ **SKU tracking**
- ✅ **Product tags**
- ✅ **Sales analytics**
- ✅ **POS system** (cashier)
- ✅ **Product reviews**
- ❌ No service bookings

### UI Elements
- "Add to Cart" button
- "Buy Now" button
- Stock indicator (in stock / out of stock)
- Price with discount display
- Product image gallery
- Specifications table
- Quantity selector
- Product reviews section
- Related products carousel

---

## Plan Comparison Matrix

| Feature | Free | Verification | Services | Products |
|---------|------|--------------|----------|----------|
| **Price** | $0 | $15/mo | $50/mo | $50/mo |
| **Listing Visibility** | ✅ | ✅ | ✅ | ✅ |
| **Basic Info** | ✅ | ✅ | ✅ | ✅ |
| **Full Phone** | ❌ | ✅ | ✅ | ✅ |
| **Full Email** | ❌ | ✅ | ✅ | ✅ |
| **Verified Badge** | ❌ | ✅ | ✅ | ✅ |
| **Direct Chat** | ❌ | ✅ | ✅ | ✅ |
| **Bookings** | ❌ | ❌ | ✅ | ❌ |
| **Availability Schedule** | ❌ | ❌ | ✅ | ❌ |
| **Client Tracking** | ❌ | ❌ | ✅ | ❌ |
| **Product Sales** | ❌ | ❌ | ❌ | ✅ |
| **Inventory Management** | ❌ | ❌ | ❌ | ✅ |
| **Shopping Cart** | ❌ | ❌ | ❌ | ✅ |
| **POS System** | ❌ | ❌ | ❌ | ✅ |

---

## Implementation Status

| Component | Status | Lines of Code | Features |
|-----------|--------|---------------|----------|
| **FreeListingView** | ✅ Complete | 562 | Basic info, masked contact, upgrade CTAs |
| **VerifiedListingView** | ✅ Complete | ~600 | Full contact, chat, verified badge |
| **ServiceBookingView** | ✅ Complete | ~700 | Bookings, calendar, availability |
| **ProductListingView** | ✅ Complete | ~650 | E-commerce, cart, inventory |

---

## Data Flow Diagram

```
API Response
    ↓
/listing/[id] Page
    ↓
Determine Plan Type (FREE, VERIFICATION, SERVICES, PRODUCTS)
    ↓
Route to Appropriate View
    ├→ FreeListingView
    ├→ VerifiedListingView
    ├→ ServiceBookingView
    └→ ProductListingView
```

---

## Usage Examples

### Free Plan Example
```typescript
<FreeListingView 
  data={{
    id: "service123",
    name: "Dr. Ahmed Hassan - Cardiologist",
    ownerName: "Dr. Ahmed Hassan",
    mainCategory: "Healthcare",
    subCategory: "Cardiology",
    city: "Cairo",
    phone: "+201234567890", // Will be masked
    rating: 4.8,
    reviewsCount: 127,
    viewCount: 1523,
    coverImage: "/images/clinic.jpg",
    logoImage: "/images/doctor.jpg"
  }}
  type="service"
/>
```

### Service Booking Example
```typescript
<ServiceBookingView 
  data={{
    ...verifiedData,
    bookingsEnabled: true,
    availabilitySchedule: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "12:00", maxBookings: 10 },
          { startTime: "14:00", endTime: "17:00", maxBookings: 10 }
        ]
      }
    },
    clientsCount: 45,
    messagesCount: 234,
    price: 500,
    currency: "EGP",
    duration: 45
  }}
  type="service"
/>
```

---

## API Integration Points

### Required Endpoints

1. **GET /api/services/:id** - Fetch service data
2. **GET /api/users/:id** - Fetch user/owner data
3. **GET /api/shops/:id** - Fetch shop data
4. **GET /api/products/:id** - Fetch product data
5. **GET /api/reviews?serviceId=:id** - Fetch reviews
6. **POST /api/bookings** - Create booking
7. **POST /api/cart** - Add to cart
8. **POST /api/chats** - Start chat

---

## Best Practices

1. **Always mask phone numbers** in FreeListingView
2. **Verify plan type** before showing premium features
3. **Show upgrade CTAs** prominently for free users
4. **Use proper loading states** for all API calls
5. **Handle errors gracefully** with fallback UI
6. **Implement proper access control** on backend
7. **Cache static data** (categories, etc.)
8. **Optimize images** (use Next.js Image component)

---

**Last Updated:** December 2024  
**Version:** 2.0.0  
**Status:** ✅ Production Ready


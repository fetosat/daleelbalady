# Unified Listing System - Complete Implementation Guide

## ✅ COMPLETED

### 1. Backend Fixes
- **Fixed `paymob.js` syntax error** - Removed duplicate methods and corrected class structure
- **Created subscription plan view API** at `/api/plan-views/` with 4 tiers
- All existing backend APIs are functional:
  - `/api/services/:id`
  - `/api/shops/:id`
  - `/api/users/:id`
  - `/api/products/:id`
  - `/api/chats/` (messaging system)
  - `/api/booking/` (appointments)
  - `/api/reviews/` (ratings & comments)
  - `/api/payments/` (Paymob integration)

### 2. Frontend Updates
- **Updated AdvancedSearch.tsx** - All result cards now navigate to `/listing/:id`
- **Created unified listing page** at `/app/listing/[id]/page.tsx` with smart type detection
- **Created FreeListingView.tsx** - Complete with upgrade CTAs and limited info display

## 📋 REMAINING TASKS

### 3. Create Remaining View Components

#### A. VerifiedListingView.tsx
```typescript
// Location: src/components/listing/VerifiedListingView.tsx
// Features to implement:
// - Full contact information (phone, email, website) - unmasked
// - Chat/Message button (uses /api/chats/ endpoint)
// - Verification badge display
// - Enhanced review section with ability to leave reviews
// - All features from Free tier plus verified-only features
```

**Key Integrations:**
- **Chat Button**: 
  ```typescript
  const startChat = async () => {
    const response = await fetch('https://api.daleelbalady.com/api/chats', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initiatorId: currentUserId,
        recipientId: data.ownerUser?.id || data.owner?.id,
        subject: `Inquiry about ${data.name}`
      })
    })
    const { chat } = await response.json()
    router.push(`/messages/${chat.id}`)
  }
  ```

- **Review Submission**:
  ```typescript
  const submitReview = async (rating: number, comment: string) => {
    await fetch('https://api.daleelbalady.com/api/reviews', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating,
        comment,
        serviceId: type === 'service' ? data.id : undefined,
        shopId: type === 'shop' ? data.id : undefined
      })
    })
  }
  ```

#### B. ServiceBookingView.tsx
```typescript
// Location: src/components/listing/ServiceBookingView.tsx
// Features to implement:
// - All Verified tier features
// - Booking calendar/time slot picker
// - Available times based on service.availability[]
// - Book appointment button
// - Upcoming bookings list (for service owner)
// - Client management section
```

**Key Integrations:**
- **Fetch Available Slots**:
  ```typescript
  const fetchSlots = async (date: string) => {
    const response = await fetch('https://api.daleelbalady.com/api/booking/available-slots', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: data.id, date })
    })
    const { availableSlots } = await response.json()
    return availableSlots
  }
  ```

- **Create Booking**:
  ```typescript
  const createBooking = async (startAt: string, endAt: string, notes: string) => {
    await fetch('https://api.daleelbalady.com/api/booking/create', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: data.id,
        userId: currentUserId,
        startAt,
        endAt,
        notes
      })
    })
  }
  ```

#### C. ProductListingView.tsx
```typescript
// Location: src/components/listing/ProductListingView.tsx
// Features to implement:
// - All Verified tier features
// - Add to cart functionality
// - Inventory display (stock levels)
// - Product variants/options
// - Sales analytics (for shop owner)
// - Related products
// - POS system indicators
```

**Key Integrations:**
- **Add to Cart**:
  ```typescript
  const addToCart = async (quantity: number) => {
    await fetch('https://api.daleelbalady.com/api/cart', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: data.id,
        quantity
      })
    })
  }
  ```

## 🎨 Design Patterns to Follow

### Component Structure
Each view component should follow this pattern:

```typescript
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
// ... imports

interface [ViewName]Props {
  data: any
  type: 'shop' | 'service' | 'user' | 'product'
}

export default function [ViewName]({ data, type }: [ViewName]Props) {
  const router = useRouter()
  const theme = resolveTheme(data.design?.slug || type)
  
  // State for interactive features
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ... rest of implementation
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - use theme gradient */}
      <div style={{ 
        background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
      }}>
        {/* ... */}
      </div>
      
      {/* Main Content - 2/3 column layout */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main content */}
          <div className="lg:col-span-2">
            {/* ... */}
          </div>
          
          {/* Right: Sidebar */}
          <div>
            {/* ... */}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Theme Usage
Always use the theme resolver for consistent branding:

```typescript
const theme = resolveTheme(data.design?.slug || type)
const themeClasses = getThemeClasses(theme)

// Apply gradient
style={{ background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})` }}

// Apply primary color
style={{ backgroundColor: theme.colors.primary }}

// Use emoji
<span>{theme.emoji}</span>
```

## 🔗 API Endpoints Reference

### Chat/Messaging
- `POST /api/chats` - Create or get existing chat
- `GET /api/chats/user/:userId` - Get all chats for user
- `GET /api/chats/:chatId` - Get chat with messages
- `POST /api/chats/:chatId/messages` - Send message
- `PUT /api/chats/:chatId/mark-all-read` - Mark messages as read

### Booking
- `POST /api/booking/available-slots` - Get available time slots
- `POST /api/booking/create` - Create new booking
- `GET /api/booking/service/:serviceId` - Get bookings for service
- `GET /api/booking/user/:userId` - Get user's bookings
- `PATCH /api/booking/:bookingId/status` - Update booking status

### Reviews
- `GET /api/reviews?serviceId=:id` - Get reviews for entity
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:reviewId` - Update review
- `DELETE /api/reviews/:reviewId` - Delete review
- `GET /api/reviews/my-reviews` - Get current user's reviews

### Cart (for products)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove from cart

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/webhook` - Handle payment webhook
- `GET /api/payments/verify/:transactionId` - Verify payment

## 🧪 Testing Checklist

- [ ] Search results correctly navigate to `/listing/:id`
- [ ] Each listing type (shop/service/user/product) displays correctly
- [ ] Free tier shows masked contact info and upgrade CTAs
- [ ] Verified tier shows full contact and chat button
- [ ] Service booking tier shows calendar and booking functionality
- [ ] Product tier shows add-to-cart and inventory
- [ ] Chat integration works (creates chat and navigates)
- [ ] Review submission works
- [ ] Booking creation works
- [ ] Theme colors and branding apply correctly
- [ ] Mobile responsive design works on all views
- [ ] Loading states display properly
- [ ] Error handling shows appropriate messages

## 📝 Notes

- All view components use dynamic imports in the main listing page for code splitting
- Authentication is handled via `credentials: 'include'` in all fetch requests
- User ID should be obtained from auth context/session
- Theme resolver utility is in `/utils/themeResolver.ts`
- UI components are from shadcn/ui in `/components/ui/`

## 🚀 Next Steps

1. Create `VerifiedListingView.tsx` with chat integration
2. Create `ServiceBookingView.tsx` with booking calendar
3. Create `ProductListingView.tsx` with cart functionality
4. Add authentication context if not already present
5. Test all flows end-to-end
6. Add error boundaries for graceful failure handling
7. Implement analytics tracking for views/bookings
8. Add SEO metadata to listing pages
9. Implement share functionality
10. Add print/PDF export for service details

## 📚 Additional Resources

- Backend routes are in `/backend/routes/`
- Prisma schema is in `/backend/generated/prisma/client.js`
- Frontend components follow Next.js 13+ App Router patterns
- All UI uses Tailwind CSS with dark mode support


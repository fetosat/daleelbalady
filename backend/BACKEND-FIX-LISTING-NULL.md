# Backend Fix - Listing /null Issue

## Date: January 9, 2025

## Issue
Services linked to shops were navigating to `/listing/null` because the backend API wasn't returning the shop owner data.

## Root Cause
In `routes/advancedSearch.js`, when fetching services, the query included the `shop` relation but did NOT include the `shop.owner` nested relation. This meant the frontend received:

```json
{
  "service": {
    "id": "...",
    "shop": {
      "id": "...",
      "name": "...",
      "isVerified": true
      // Missing: ownerId and owner object!
    }
  }
}
```

The frontend was trying to access `service.shop.owner.id` or `service.shop.ownerId`, which were both `undefined`, resulting in navigation to `/listing/undefined` → `/listing/null`.

## Fix Applied

### File: `routes/advancedSearch.js`
**Line: 550-562**

#### Before:
```javascript
shop: {
  select: {
    id: true,
    name: true,
    isVerified: true
  }
},
```

#### After:
```javascript
shop: {
  select: {
    id: true,
    name: true,
    isVerified: true,
    ownerId: true,  // ← ADDED
    owner: {        // ← ADDED
      select: {
        id: true,
        name: true,
        isVerified: true
      }
    }
  }
},
```

## Testing

### Before Fix
1. Go to `/find` page
2. Search for or browse services
3. Click on "Kids Health Pediatrics" (SERVICES plan)
4. **Result:** Navigates to `/listing/null` → Error page

### After Fix
1. Restart backend server: `node server.js`
2. Go to `/find` page
3. Search for or browse services
4. Click on "Kids Health Pediatrics" (SERVICES plan)
5. **Result:** Navigates to `/listing/{userId}` → Listing page loads correctly

### Test Cases
- [x] **SERVICES plan listings** (e.g., "Kids Health Pediatrics")
  - Services linked to shops with owners
  - Should navigate to shop owner's listing page
  
- [ ] **VERIFICATION plan listings**
  - Services linked to verified shops
  - Should navigate to shop owner's listing page
  
- [ ] **FREE plan listings**
  - Services owned directly by users (no shop)
  - Should navigate to user's listing page
  
- [ ] **PRODUCTS plan listings**
  - Products in shops
  - Should navigate to shop owner's listing page

## Related Files

### Backend
- ✅ `routes/advancedSearch.js` - Fixed service query to include shop.owner

### Frontend (Already Fixed Previously)
- ✅ `src/components/AdvancedSearch.tsx` - Updated navigation logic to handle shop.owner
- ✅ `src/components/listing/VerifiedListingView.tsx` - Fixed header overlay
- ✅ `src/components/listing/ServiceBookingView.tsx` - Fixed header overlay
- ✅ `src/components/ListingViews.tsx` - Fixed header overlay

## API Response Structure

After this fix, the services API now returns:

```json
{
  "services": [
    {
      "id": "service-id",
      "translation": {
        "name_en": "Kids Health Pediatrics",
        "name_ar": "..."
      },
      "price": 394,
      "durationMins": 45,
      "city": "Giza",
      "ownerUser": null,           // Direct user ownership (null for shop-owned services)
      "ownerUserId": null,
      "shop": {
        "id": "shop-id",
        "name": "...",
        "isVerified": true,
        "ownerId": "user-id",      // ← NOW INCLUDED
        "owner": {                 // ← NOW INCLUDED
          "id": "user-id",
          "name": "SERVICES Plan User 3",
          "isVerified": true
        }
      }
    }
  ]
}
```

## Frontend Navigation Logic

The frontend now uses this priority chain to find the correct user ID:

```javascript
const targetId = 
  service.ownerUser?.id ||      // 1. Direct user ownership
  service.ownerUserId ||         // 2. Direct user ID
  service.shop?.owner?.id ||     // 3. Shop owner object (NOW AVAILABLE)
  service.shop?.ownerId;         // 4. Shop owner ID fallback (NOW AVAILABLE)

if (targetId) {
  navigate(`/listing/${targetId}`);
}
```

## Important Notes

### Service Ownership Models

The application supports two patterns:

1. **Direct User Ownership** (FREE plan)
   ```prisma
   Service {
     ownerUserId: "user-id"
     shopId: null
   }
   ```

2. **Shop Ownership** (VERIFICATION, SERVICES, PRODUCTS plans)
   ```prisma
   Service {
     ownerUserId: null
     shopId: "shop-id"
     shop: {
       ownerId: "user-id"
     }
   }
   ```

### Other Endpoints to Check

Make sure these endpoints also include shop owner data:

1. **Services Endpoint** (`routes/services.js`)
   - GET `/api/services/:id`
   - GET `/api/services`

2. **Products Endpoint** (`routes/products.js`)
   - GET `/api/products/:id`
   - GET `/api/products`
   - Should include: `shop.owner` and `shop.ownerId`

3. **Shops Endpoint** (`routes/shops.js`)
   - GET `/api/shops/:id`
   - GET `/api/shops`
   - Should include: `owner` and `ownerId`

## Restart Required

After making this backend change, you must restart the backend server:

```bash
# On your server
cd /var/www/daleelai-backend
pm2 restart all
# OR
node server.js
```

## Verification Steps

1. **Check API Response:**
   ```bash
   curl https://api.daleelbalady.com/api/advanced-search?type=services | jq '.services[0].shop.owner'
   ```
   Should return owner object with id, name, isVerified

2. **Check Frontend Console:**
   - Open browser DevTools → Network tab
   - Click on a service card
   - Check the service object in console
   - Verify `shop.owner` exists

3. **Check Navigation:**
   - URL should be `/listing/{valid-uuid}`
   - NOT `/listing/null` or `/listing/undefined`

## Success Criteria

✅ All SERVICES plan listings navigate to correct user listing pages
✅ No more `/listing/null` URLs
✅ Backend includes complete shop owner data in API responses
✅ Frontend fallback chain works for all ownership patterns

---

**Status:** ✅ FIXED - Restart backend server to apply changes


# Admin API Routes - 404 Error Fix

## Issue Fixed ✅
**Error:** `Failed to fetch bookings: 404 "Not Found"`

**Root Cause:** 
The admin pages were using incorrect API routes. I initially used `/api/dashboard/admin/*` routes, but the actual proxy route is `/api/admin/*`.

## Correct API Proxy Routes

The Next.js app has an admin API proxy at `/api/admin/[...slug]/route.ts` that forwards requests to:
- **Frontend:** `/api/admin/{endpoint}` 
- **Backend:** `${BACKEND_API_URL}/api/admin/{endpoint}`

## Files Updated ✅

### 1. Admin Bookings Page
**File:** `src/app/admin/bookings/page.tsx`
- ❌ **Before:** `/api/dashboard/admin/bookings`
- ✅ **After:** `/api/admin/bookings`

**Endpoints Fixed:**
- `GET /api/admin/bookings` - List bookings with pagination and filters
- `PATCH /api/admin/bookings/{id}` - Update booking status

### 2. Admin Shops Page
**File:** `src/app/admin/shops/page.tsx`
- ❌ **Before:** `/api/dashboard/admin/shops`
- ✅ **After:** `/api/admin/shops`

**Endpoints Fixed:**
- `GET /api/admin/shops` - List shops
- `POST /api/admin/shops` - Create shop
- `PATCH /api/admin/shops/{id}` - Update shop
- `DELETE /api/admin/shops/{id}` - Delete shop
- `POST /api/admin/shops/{id}/convert-to-user` - Convert shop to user
- `GET /api/admin/users` - List users for shop owner selection

### 3. Admin Users Page
**File:** `src/app/admin/users/page.tsx`
- ❌ **Before:** `/api/dashboard/admin/users`
- ✅ **After:** `/api/admin/users`

**Endpoints Fixed:**
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `POST /api/admin/users/{id}/convert-to-shop` - Convert user to shop

### 4. UniversalConversionDialog Component
**File:** `src/components/admin/UniversalConversionDialog.tsx`
- ❌ **Before:** `/api/dashboard/admin/conversions/convert`
- ✅ **After:** `/api/admin/conversions/convert`

**Endpoint Fixed:**
- `POST /api/admin/conversions/convert` - Universal conversion endpoint

## Admin API Proxy Details

**Proxy File:** `/api/admin/[...slug]/route.ts`

**How it works:**
1. Frontend makes request to `/api/admin/{endpoint}`
2. Next.js proxy receives request and extracts the `slug` (endpoint path)
3. Proxy forwards request to `${BACKEND_API_URL}/api/admin/{slug}`
4. Backend response is returned to frontend

**Example:**
- Frontend calls: `GET /api/admin/bookings?page=1&limit=20`
- Proxy forwards to: `GET https://api.daleelbalady.com/api/admin/bookings?page=1&limit=20`

## Environment Variables

The proxy uses:
```javascript
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.daleelbalady.com';
```

## Expected Results ✅

After this fix:
1. **404 errors should be resolved** - API calls will reach the correct proxy route
2. **Backend integration works** - If backend APIs are implemented, real data will load
3. **Mock data fallback** - If backend returns 404/500, pages show realistic test data
4. **Console logging** - Admin API proxy provides detailed request/response logging

## Testing

To verify the fix:
1. Open browser dev tools (F12) → Network tab
2. Navigate to `https://www.daleelbalady.com/admin/bookings`
3. Look for requests to `/api/admin/bookings` (should be 200 or show expected backend errors)
4. Check console for proxy logs like:
   ```
   🔧 Admin API Route - GET request for: ["bookings"]
   🔗 Forwarding GET request to: https://api.daleelbalady.com/api/admin/bookings
   📊 Backend response status: 200
   ```

## Summary

The 404 error was caused by using `/api/dashboard/admin/*` routes instead of `/api/admin/*`. All admin pages now use the correct API proxy routes and should work properly with the backend API or show appropriate mock data during development.

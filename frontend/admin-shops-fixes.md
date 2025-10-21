# Admin Shops Page - Fixes Applied

## Issues Fixed

### 1. ✅ API Endpoint Updates
Updated all API calls from direct backend URLs to local proxy URLs:

**Before:**
- `https://api.daleelbalady.com/api/admin/shops` → `/api/admin/shops`
- `https://api.daleelbalady.com/api/admin/users` → `/api/admin/users`
- `https://api.daleelbalady.com/api/upload` → `/api/upload`

**After:** All API calls now use the local Next.js proxy routes

### 2. ✅ Added Proper Request Headers
All API requests now include:
- `Content-Type: application/json`
- `credentials: 'include'`
- Proper Authorization header with Bearer token

### 3. ✅ Enhanced Error Handling
- Added detailed error logging
- Added mock data fallback for development when API fails (404/500 errors)
- Better user feedback with specific error messages

### 4. ✅ Mock Data for Development
Added comprehensive mock data including:
- Shop information (name, description, phone, email, location)
- Owner details
- Statistics (_count for services, products, reviews)
- Verification status

## API Endpoints Now Used

### Shops API:
- `GET /api/admin/shops` - List shops with pagination
- `POST /api/admin/shops` - Create new shop
- `PATCH /api/admin/shops/{id}` - Update shop
- `DELETE /api/admin/shops/{id}` - Delete shop
- `POST /api/admin/shops/{id}/convert-to-user` - Convert shop to user

### Users API:
- `GET /api/admin/users` - List users for shop owner selection

### Upload API:
- `POST /api/upload` - Upload images (cover, logo, gallery)

## Features Available
1. **Shop Management**: Create, read, update, delete shops
2. **Image Upload**: Cover images, logos, and gallery images
3. **Location Picker**: Interactive map for setting shop location
4. **User Assignment**: Assign existing users as shop owners
5. **Verification Control**: Mark shops as verified/unverified
6. **Search & Pagination**: Find shops by name and navigate through pages
7. **Conversion**: Convert shops to users via UniversalConversionDialog

## Testing Status
- ✅ API calls updated to use local proxy
- ✅ Mock data fallback implemented for development
- ✅ Error handling improved
- ✅ Image upload endpoints corrected

## Expected Backend API Response Format

### GET /api/admin/shops
```json
{
  "shops": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "phone": "string", 
      "email": "string",
      "website": "string",
      "city": "string",
      "locationLat": number,
      "locationLon": number,
      "coverImage": "string",
      "logoImage": "string", 
      "galleryImages": ["string"],
      "isVerified": boolean,
      "owner": {
        "id": "string",
        "name": "string",
        "email": "string",
        "phone": "string"
      },
      "_count": {
        "services": number,
        "products": number,
        "reviews": number
      },
      "createdAt": "string"
    }
  ],
  "pagination": {
    "page": number,
    "pages": number,
    "total": number
  }
}
```

If the backend API is not implemented, the page will show mock data and display a notification that test data is being used.

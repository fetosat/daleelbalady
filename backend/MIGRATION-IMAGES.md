# Add Images to Shops and Services - Migration

## Database Changes
Added the following fields to Shop and Service models:
- `coverImage` (String?) - Cover banner image URL
- `logoImage` (String?) - Logo image URL  
- `galleryImages` (String? @db.Text) - JSON array of image URLs

## Migration Commands

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_images_to_shops_services

# Or use db push (no migration file)
npx prisma db push

# Restart backend server
```

## API Changes

### Admin Routes
**POST /api/admin/shops** - Now accepts: `coverImage`, `logoImage`, `galleryImages`  
**PATCH /api/admin/shops/:id** - Now accepts: `coverImage`, `logoImage`, `galleryImages`  
**POST /api/admin/services** - Now accepts: `coverImage`, `logoImage`, `galleryImages`  
**PATCH /api/admin/services/:id** - Now accepts: `coverImage`, `logoImage`, `galleryImages`

### Public Routes
**GET /api/shops/:slug** - Now returns image fields  
**GET /api/services/:id** - Now returns image fields

## Frontend Changes
- Admin shops page: Image upload UI added
- Admin services page: Image upload UI added
- Shop detail page: Displays images
- Service detail page: Displays images (both themes)

## Gallery Images Format
Gallery images stored as JSON string in database:
```json
["https://api.daleelbalady.com/uploads/img1.jpg", "https://api.daleelbalady.com/uploads/img2.jpg"]
```

Parse on frontend: `JSON.parse(shop.galleryImages || '[]')`


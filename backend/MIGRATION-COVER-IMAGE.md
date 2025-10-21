# Add Cover Image Field to User Model

## Database Migration Required

A new `coverImage` field has been added to the User model in Prisma schema.

### Steps to Apply Migration:

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Generate Prisma client with new field:**
   ```bash
   npx prisma generate
   ```

3. **Create and apply migration:**
   ```bash
   npx prisma migrate dev --name add_user_cover_image
   ```

   Or if you want to apply without creating a migration file:
   ```bash
   npx prisma db push
   ```

4. **Verify the migration:**
   ```bash
   npx prisma studio
   ```
   Check that the `User` table now has a `coverImage` column.

5. **Restart your backend server** to load the updated Prisma client.

## What Changed:

### Schema (prisma/schema.prisma):
```prisma
model User {
  ...
  profilePic    String?
  coverImage    String?  // NEW FIELD
  role          Role
  ...
}
```

### Backend Routes (routes/admin.js):
- ✅ GET `/api/admin/users` - Returns coverImage in user list
- ✅ GET `/api/admin/users/:id` - Returns coverImage in user details  
- ✅ POST `/api/admin/users` - Accepts coverImage when creating user
- ✅ PATCH `/api/admin/users/:id` - Updates coverImage

### Frontend:
- ✅ Admin Users Page - Cover image upload UI added
- ✅ Cover image preview (1200x400 recommended)
- ✅ Separate upload handler for cover images
- ✅ Save/update cover image to database

## Usage:

Once migrated, users can have:
- **Profile Picture**: Small circular avatar (current)
- **Cover Image**: Wide banner image at top of profile (new)

Both are stored as full URLs: `https://api.daleelbalady.com/uploads/filename.png`


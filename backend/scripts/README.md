# Category Import/Export Scripts

This directory contains scripts to manage categories and subcategories in the database.

## Files

- **`categories.json`** - Sample data file with categories and subcategories
- **`import-categories.js`** - Script to import categories from JSON file into database
- **`export-categories.js`** - Script to export categories from database to Markdown or JSON
- **`cleanup-category-relations.js`** - Script to disconnect all Service relations to categories/subcategories
- **`delete-all-categories.js`** - Script to delete all categories and subcategories from database

## Prerequisites

- Node.js installed
- Prisma database connection configured
- Database with Category and SubCategory tables

## Usage

### 1. Import Categories from JSON

```bash
# Import categories from the JSON file
npm run import-categories

# Or run directly
node scripts/import-categories.js
```

This will:
- Read `scripts/categories.json`
- Create or update categories in the database
- Create default design if none exists
- Handle duplicate entries (updates existing)

### 2. Export Categories to Markdown

```bash
# Export to markdown (default format)
npm run export-categories

# Or run directly
node scripts/export-categories.js
```

Output format:
```markdown
# Categories and Subcategories

## Category Name
*Category description*

  - **Sub Category 1** : `uuid-1`
  - **Sub Category 2** : `uuid-2`

## Another Category
  - **Sub Category 3** : `uuid-3`
```

### 3. Export Categories to JSON

```bash
# Export to JSON format
npm run export-categories-json

# Or run directly
node scripts/export-categories.js json categories-export.json
```

Output includes:
- Export metadata (date, counts)
- Full category and subcategory data with IDs
- Timestamps and relationships

### 4. Clean Up Category Relations (Before Deletion)

```bash
# Check what would be cleaned up (dry run)
npm run cleanup-categories-dry-run

# Clean up all Service relations to categories/subcategories
npm run cleanup-categories

# Or run directly
node scripts/cleanup-category-relations.js
node scripts/cleanup-category-relations.js --dry-run
```

This script:
- Disconnects all Service↔Category many-to-many relations
- Disconnects all Service↔SubCategory many-to-many relations  
- Sets SubCategory.serviceId to null
- Allows safe deletion of categories afterwards

### 5. Delete All Categories and Subcategories

```bash
# Check what would be deleted (dry run)
npm run delete-all-categories-dry-run

# Delete all categories and subcategories
npm run delete-all-categories

# Or run directly
node scripts/delete-all-categories.js
node scripts/delete-all-categories.js --dry-run
```

This script:
- Checks for any remaining relations (safety check)
- Deletes all subcategories first
- Deletes all categories
- Won't run if relations still exist

## Command Line Options

### Export Script Options

```bash
# Export to markdown (default)
node scripts/export-categories.js

# Export to markdown with custom filename
node scripts/export-categories.js markdown my-categories.md

# Export to JSON
node scripts/export-categories.js json

# Export to JSON with custom filename
node scripts/export-categories.js json my-categories.json
```

## Sample Data Structure

The `categories.json` file follows this structure:

```json
{
  "categories": [
    {
      "name": "Category Name",
      "slug": "category-slug",
      "description": "Category description",
      "subCategories": [
        {
          "name": "Subcategory Name",
          "slug": "subcategory-slug"
        }
      ]
    }
  ]
}
```

## Error Handling

Both scripts include:
- Database connection error handling
- File I/O error handling
- Detailed logging with emojis for easy reading
- Graceful exits with proper status codes

## Database Schema Requirements

Make sure your database has these models (as defined in Prisma schema):

```prisma
model Category {
  id            String        @id @default(uuid())
  name          String
  slug          String?       @unique
  description   String?
  subCategories SubCategory[]
  designId      String
  design        design        @relation(fields: [designId], references: [id])
}

model SubCategory {
  id         String   @id @default(uuid())
  name       String
  slug       String   @unique
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId String
}
```

The import script will automatically create a default design if none exists.

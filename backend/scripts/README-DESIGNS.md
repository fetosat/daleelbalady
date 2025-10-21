# Create Designs Script

## Purpose
This script automatically creates design entries in the database for all major categories in Daleel Balady. Each design provides a unique visual identity for products, services, shops, and user listings within its category.

## What It Does

1. **Reads Categories**: Loads all categories from `categories.json`
2. **Maps Designs**: Matches each category to its corresponding design template
3. **Creates Records**: Inserts design records into the `design` table
4. **Handles Duplicates**: Skips designs that already exist
5. **Reports Status**: Provides detailed feedback on created, skipped, and failed designs

## Usage

### Windows
```bash
# From project root
create-designs.bat
```

### Direct Node Execution
```bash
cd backend
node scripts/create-designs.js
```

## Design Templates Created

| Category | Design Name | Slug | Description |
|----------|-------------|------|-------------|
| الدليلك الطبي | Medical Professional | `medical-professional` | Healthcare-focused design with blue medical tones |
| الدليلك القانوني | Legal Authority | `legal-authority` | Professional legal design with navy and gold |
| الدليلك الهندسي | Engineering Blueprint | `engineering-blueprint` | Technical design with engineering elements |
| الدليلك الحرفي | Craftsman Workshop | `craftsman-workshop` | Rustic design with earth tones |
| الدليلك الورش | Industrial Workshop | `industrial-workshop` | Industrial design with metallic accents |
| الدليلك المصانع | Factory Industrial | `factory-industrial` | Heavy industrial with steel palette |
| الدليلك الشركات | Corporate Professional | `corporate-professional` | Modern corporate design |
| الدليلك للمطاعم | Restaurant Delicious | `restaurant-delicious` | Food-themed with warm colors |
| الدليلك الكافيهات | Cafe Cozy | `cafe-cozy` | Coffee-inspired browns and creams |
| الدليلك للمحلات | Retail Showcase | `retail-showcase` | Vibrant retail design |
| الدليل العقاري | Real Estate Luxury | `real-estate-luxury` | Elegant with gold and navy |
| الدليل للسيارات | Automotive Speed | `automotive-speed` | Dynamic with racing colors |
| الدليل للمصالح الحكوميه | Government Official | `government-official` | Formal government design |

## Output Example

```
🎨 Starting design creation process...

✅ Created design: Medical Professional (medical-professional) for category: الدليلك الطبي
✅ Created design: Legal Authority (legal-authority) for category: الدليلك القانوني
✅ Created design: Engineering Blueprint (engineering-blueprint) for category: الدليلك الهندسي
⏭️  Design already exists: Craftsman Workshop (craftsman-workshop)
...

============================================================
📊 Design Creation Summary:
============================================================
✅ Created: 10
⏭️  Skipped: 3
❌ Errors: 0
============================================================

✨ Design creation process completed!
```

## Database Schema

The script creates records in the `design` table:

```prisma
model design {
  id          String     @id @default(uuid())
  name        String
  description String     @db.Text
  slug        String     @unique
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  Service     Service[]
  Shop        Shop[]
  Product     Product[]
  categoryId  String
  Category    Category[] @relation("CategoryDesigns")
}
```

## Requirements

- ✅ Node.js installed
- ✅ Database connection configured (`DATABASE_URL` in `.env`)
- ✅ Prisma Client generated
- ✅ Categories exist in database (run category seed first)
- ✅ `categories.json` file exists in scripts folder

## Error Handling

The script handles:
- ✅ **Missing categories**: Logs warning and skips
- ✅ **Duplicate designs**: Detects and skips existing designs
- ✅ **Database errors**: Logs error details and continues
- ✅ **Missing design templates**: Warns about unmapped categories

## Extending

To add a new design:

1. **Add template** to `designTemplates` object in `create-designs.js`:
```javascript
'your-category-slug': {
  name: 'Your Design Name',
  description: 'Your design description...',
  slug: 'your-design-slug'
}
```

2. **Run the script** to create the design in database

3. **Create frontend components** in `frontend/src/designs/yourdesign/`

## Frontend Integration

After running this script, designs can be applied to entities:

```javascript
// Example: Creating a service with a design
const service = await prisma.service.create({
  data: {
    name: "My Service",
    design: {
      connect: { slug: "medical-professional" }
    }
    // ... other fields
  }
});
```

## Technical Notes

- **Module System**: This script uses ES modules (not CommonJS)
- **Top-level await**: Uses modern async/await for JSON loading
- **File extensions**: Imports require `.js` extensions

## Troubleshooting

### "Category not found in database"
- Run category seed script first: `node scripts/seed-categories.js`

### "ECONNREFUSED" or database connection errors
- Check `DATABASE_URL` in `.env` file
- Ensure MySQL/database server is running
- Verify database credentials

### "Prisma Client is not generated"
- Run: `npx prisma generate`

## Related Files

- `categories.json` - Source of category data
- `DESIGN_SYSTEM_GUIDE.md` - Complete design system documentation
- `frontend/src/designs/` - Frontend design implementations

## Author
Daleel Balady Development Team

## Last Updated
2025-10-10


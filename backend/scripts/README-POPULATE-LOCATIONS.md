# Location Population Scripts

Scripts to populate random coordinates for shops and services within Cairo bounds.

## Available Scripts

### 1. Populate Service Locations
```bash
node backend/scripts/populate-service-locations.js
```
or
```bash
node backend/scripts/populate-service-locations.js services
```
Updates all services with random coordinates within the specified bounds.

### 2. Populate Shop Locations
```bash
node backend/scripts/populate-shop-locations.js
```
Updates all shops with random coordinates within the specified bounds.

### 3. Populate All Locations (Services, Shops, Users, Products)
```bash
node backend/scripts/populate-service-locations.js all
```
Updates all entities at once.

## Coordinates Bounds

All scripts use the following Cairo area coordinates:

```javascript
{
  minLat: 30.749264468704027,  // Bottom left latitude
  maxLat: 30.76800728124096,   // Top left latitude
  minLong: 30.684312009001303, // Top left longitude
  maxLong: 30.71009865657588   // Top right longitude
}
```

## What Gets Updated

### Services
- Field: `locationLat`, `locationLon`
- Shows progress every 10 services
- Displays first 3 updates with details

### Shops
- Field: `locationLat`, `locationLon`
- Shows progress every 10 shops
- Displays first 3 updates with details

### Users (via "all" command)
- Field: `latitude`, `longitude`

### Products (via "all" command)
- Field: `latitude`, `longitude`
- Inherits shop location if shop has one, otherwise generates random

## Output Example

```
🏪 Starting to populate shop locations...
📍 Bounds: Lat [30.749264468704027, 30.76800728124096], Long [30.684312009001303, 30.71009865657588]

📊 Found 45 shops
📍 Shops without location: 45
✅ Shops with location: 0

🔄 Updating shops with random locations...

  ↳ Shop: مكتب محمد حسين مخلوف للمحاماة...
    Coordinates: 30.75632145, 30.69245632
  ↳ Shop: مكتب احمد خليل الفقى للمحاماة...
    Coordinates: 30.76123456, 30.70123456
  ↳ Shop: مكتب كريم السيد للمحاماة...
    Coordinates: 30.75987654, 30.68654321
✓ Updated 10/45 shops...
✓ Updated 20/45 shops...
✓ Updated 30/45 shops...
✓ Updated 40/45 shops...

═══════════════════════════════════════════════════
✅ Shop location population complete!
📊 Total shops: 45
✓ Successfully updated: 45
✗ Errors: 0
═══════════════════════════════════════════════════

🗺️  You can now view shops on the map in the /find page
```

## Notes

- Both scripts will **overwrite existing coordinates** if locations already exist
- Random coordinates are generated with 8 decimal places for precision
- Scripts will show a warning if some entities already have locations
- Make sure the backend is not running when executing these scripts (to avoid connection issues)


-- Step 1: Get the IDs of both designs
-- Run this first to see the designs
SELECT id, name, slug FROM design WHERE slug IN ('medical', 'medical-professional-ar');

-- Step 2: Update all records to use the main medical design
-- Replace 'ARABIC_DESIGN_ID' with the actual ID from step 1
-- Replace 'MAIN_DESIGN_ID' with the actual ID from step 1

-- Update services
UPDATE Service 
SET designId = 'MAIN_DESIGN_ID'
WHERE designId = 'ARABIC_DESIGN_ID';

-- Update shops
UPDATE Shop 
SET designId = 'MAIN_DESIGN_ID'
WHERE designId = 'ARABIC_DESIGN_ID';

-- Update products
UPDATE Product 
SET designId = 'MAIN_DESIGN_ID'
WHERE designId = 'ARABIC_DESIGN_ID';

-- Update categories
UPDATE Category 
SET designId = 'MAIN_DESIGN_ID'
WHERE designId = 'ARABIC_DESIGN_ID';

-- Step 3: Delete the duplicate design
DELETE FROM design WHERE id = 'ARABIC_DESIGN_ID';

-- Step 4: Verify
SELECT slug, COUNT(*) as count FROM design WHERE slug LIKE 'medical%' GROUP BY slug;


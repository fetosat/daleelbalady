-- Step 1: Find the medical design ID
-- Run this first to get the design ID
SELECT id, name, slug FROM design WHERE slug = 'medical';

-- Step 2: Update Services with medical-related keywords
-- Replace 'YOUR_DESIGN_ID_HERE' with the actual ID from step 1
UPDATE Service 
SET designId = 'YOUR_DESIGN_ID_HERE'
WHERE designId IS NULL 
  AND (
    embeddingText LIKE '%medical%' 
    OR embeddingText LIKE '%doctor%' 
    OR embeddingText LIKE '%clinic%' 
    OR embeddingText LIKE '%hospital%'
    OR embeddingText LIKE '%طبي%'
    OR embeddingText LIKE '%طبيب%'
    OR embeddingText LIKE '%دكتور%'
    OR embeddingText LIKE '%مستشفى%'
  );

-- Step 3: Update Shops with medical-related names
UPDATE Shop 
SET designId = 'YOUR_DESIGN_ID_HERE'
WHERE designId IS NULL 
  AND (
    name LIKE '%medical%' 
    OR name LIKE '%clinic%' 
    OR name LIKE '%hospital%'
    OR name LIKE '%pharmacy%'
    OR name LIKE '%طبي%'
    OR name LIKE '%عيادة%'
    OR name LIKE '%مستشفى%'
    OR name LIKE '%صيدلية%'
    OR description LIKE '%medical%'
  );

-- Step 4: Update Products with medical-related items
UPDATE Product 
SET designId = 'YOUR_DESIGN_ID_HERE'
WHERE designId IS NULL 
  AND (
    name LIKE '%medicine%' 
    OR name LIKE '%drug%' 
    OR name LIKE '%medical%'
    OR name LIKE '%دواء%'
    OR name LIKE '%علاج%'
    OR description LIKE '%medical%'
    OR embeddingText LIKE '%medical%'
  );

-- Step 5: Verify the updates
SELECT 'Services Updated' as TableName, COUNT(*) as Count 
FROM Service 
WHERE designId = 'YOUR_DESIGN_ID_HERE'
UNION ALL
SELECT 'Shops Updated', COUNT(*) 
FROM Shop 
WHERE designId = 'YOUR_DESIGN_ID_HERE'
UNION ALL
SELECT 'Products Updated', COUNT(*) 
FROM Product 
WHERE designId = 'YOUR_DESIGN_ID_HERE';


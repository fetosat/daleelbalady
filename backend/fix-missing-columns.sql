-- Add missing columns to User table
-- Run this in your MySQL database

USE daleelai;

-- Add googleId column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'User' 
     AND table_schema = 'daleelai' 
     AND column_name = 'googleId') > 0,
    'SELECT "googleId column already exists";',
    'ALTER TABLE `User` ADD COLUMN `googleId` VARCHAR(191) NULL UNIQUE;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add facebookId column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'User' 
     AND table_schema = 'daleelai' 
     AND column_name = 'facebookId') > 0,
    'SELECT "facebookId column already exists";',
    'ALTER TABLE `User` ADD COLUMN `facebookId` VARCHAR(191) NULL UNIQUE;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add authProvider column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'User' 
     AND table_schema = 'daleelai' 
     AND column_name = 'authProvider') > 0,
    'SELECT "authProvider column already exists";',
    'ALTER TABLE `User` ADD COLUMN `authProvider` VARCHAR(191) NULL;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if columns were added successfully
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE table_name = 'User' 
AND table_schema = 'daleelai' 
AND column_name IN ('googleId', 'facebookId', 'authProvider')
ORDER BY COLUMN_NAME;

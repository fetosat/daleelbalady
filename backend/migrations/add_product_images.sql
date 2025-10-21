-- Migration: Add images field to Product table and unique constraint to tags
-- Run this in your MySQL database

-- Add images column to Product table
ALTER TABLE `Product` ADD COLUMN `images` TEXT NULL COMMENT 'JSON array of image URLs';

-- Add unique constraint to tags name (prevent duplicate tag names)
ALTER TABLE `tags` ADD UNIQUE KEY `tags_name_key` (`name`);


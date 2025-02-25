/*
  # Add image support to blog posts

  1. Changes
    - Add `image_url` column to blogs table
    - Add `image_alt` column for accessibility
*/

ALTER TABLE blogs
ADD COLUMN image_url text,
ADD COLUMN image_alt text;
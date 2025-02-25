/*
  # Add profile fields

  1. Changes
    - Add academic_year and phone_number to users table
    - Add validation for phone number format
    - Add validation for academic year values

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE users
ADD COLUMN academic_year text CHECK (academic_year IN ('FE', 'SE', 'TE', 'BE', 'Alumni')),
ADD COLUMN phone_number text CHECK (phone_number ~ '^\+?[0-9]{10,12}$');
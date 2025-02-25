/*
  # Fix user registration policies

  1. Changes
    - Add policy to allow new user registration
    - Modify existing policies for better security

  2. Security
    - Enable RLS on users table
    - Allow authenticated users to read all profiles
    - Allow users to update their own profile
    - Allow new user registration during signup
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read all profiles" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Allow new user registration
CREATE POLICY "Enable insert for authentication" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to read all profiles
CREATE POLICY "Users can read all profiles"
ON users FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
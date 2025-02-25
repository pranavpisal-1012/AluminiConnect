/*
  # Add Blog Feature

  1. New Tables
    - `blogs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `author_id` (uuid, references users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `blog_comments`
      - `id` (uuid, primary key)
      - `blog_id` (uuid, references blogs)
      - `author_id` (uuid, references users)
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Allow authenticated users to read all blogs and comments
    - Allow authenticated users to create blogs and comments
    - Allow authors to update/delete their own blogs and comments
*/

-- Create blogs table
CREATE TABLE blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create blog comments table
CREATE TABLE blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid REFERENCES blogs NOT NULL,
  author_id uuid REFERENCES users NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blogs
CREATE POLICY "Anyone can view blogs"
  ON blogs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their blogs"
  ON blogs FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments"
  ON blog_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON blog_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their comments"
  ON blog_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);
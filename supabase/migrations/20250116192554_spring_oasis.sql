/*
  # Initial Alumni Connect Schema

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - full_name (text)
      - role (text) - 'student' or 'alumni'
      - graduation_year (integer)
      - bio (text)
      - created_at (timestamp)
      
    - jobs
      - id (uuid, primary key)
      - title (text)
      - company (text)
      - description (text)
      - type (text) - 'full-time', 'part-time', 'internship'
      - location (text)
      - posted_by (uuid, references users)
      - created_at (timestamp)
      
    - job_applications
      - id (uuid, primary key)
      - job_id (uuid, references jobs)
      - applicant_id (uuid, references users)
      - status (text) - 'pending', 'accepted', 'rejected'
      - created_at (timestamp)
      
    - mentorship_questions
      - id (uuid, primary key)
      - title (text)
      - content (text)
      - asked_by (uuid, references users)
      - created_at (timestamp)
      
    - mentorship_answers
      - id (uuid, primary key)
      - question_id (uuid, references mentorship_questions)
      - answered_by (uuid, references users)
      - content (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'alumni')),
  graduation_year integer NOT NULL,
  bio text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Jobs table
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('full-time', 'part-time', 'internship')),
  location text NOT NULL,
  posted_by uuid REFERENCES users NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Alumni can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'alumni'
    )
  );

-- Job applications table
CREATE TABLE job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs NOT NULL,
  applicant_id uuid REFERENCES users NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can apply to jobs"
  ON job_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'student'
    )
  );

CREATE POLICY "Users can view their own applications"
  ON job_applications FOR SELECT
  TO authenticated
  USING (applicant_id = auth.uid());

-- Mentorship questions table
CREATE TABLE mentorship_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  asked_by uuid REFERENCES users NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mentorship_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions"
  ON mentorship_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Students can ask questions"
  ON mentorship_questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'student'
    )
  );

-- Mentorship answers table
CREATE TABLE mentorship_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES mentorship_questions NOT NULL,
  answered_by uuid REFERENCES users NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mentorship_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view answers"
  ON mentorship_answers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Alumni can post answers"
  ON mentorship_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'alumni'
    )
  );
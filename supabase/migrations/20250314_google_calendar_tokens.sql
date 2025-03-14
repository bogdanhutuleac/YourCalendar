-- Create a table for storing Google Calendar tokens
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date BIGINT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own tokens
CREATE POLICY "Users can read their own tokens"
  ON google_calendar_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own tokens
CREATE POLICY "Users can insert their own tokens"
  ON google_calendar_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own tokens
CREATE POLICY "Users can update their own tokens"
  ON google_calendar_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own tokens
CREATE POLICY "Users can delete their own tokens"
  ON google_calendar_tokens
  FOR DELETE
  USING (auth.uid() = user_id); 
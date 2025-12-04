-- =====================================================
-- Global Notes Feature Migration
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- to add global notes functionality to your CRM
-- =====================================================

-- Create global notes table
CREATE TABLE IF NOT EXISTS gbs_crm_global_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gbs_crm_global_notes_user_id ON gbs_crm_global_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_gbs_crm_global_notes_created_at ON gbs_crm_global_notes(created_at DESC);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_gbs_crm_global_notes_updated_at ON gbs_crm_global_notes;
CREATE TRIGGER update_gbs_crm_global_notes_updated_at
  BEFORE UPDATE ON gbs_crm_global_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE gbs_crm_global_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own global notes" ON gbs_crm_global_notes;
DROP POLICY IF EXISTS "Users can insert their own global notes" ON gbs_crm_global_notes;
DROP POLICY IF EXISTS "Users can update their own global notes" ON gbs_crm_global_notes;
DROP POLICY IF EXISTS "Users can delete their own global notes" ON gbs_crm_global_notes;

-- Create RLS policies
CREATE POLICY "Users can view their own global notes"
  ON gbs_crm_global_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own global notes"
  ON gbs_crm_global_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own global notes"
  ON gbs_crm_global_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own global notes"
  ON gbs_crm_global_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Verify setup
SELECT 'Global notes table created successfully!' as message;


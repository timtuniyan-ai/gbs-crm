-- =====================================================
-- Mini CRM System - Complete Database Setup Script
-- =====================================================
-- Run this entire script in your Supabase SQL Editor
-- to set up the complete database structure
-- =====================================================

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Clients table
CREATE TABLE IF NOT EXISTS gbs_crm_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  credit_score TEXT NOT NULL,
  industry TEXT,
  date_organized DATE,
  estimated_yearly_revenue TEXT,
  estimated_monthly_revenue TEXT,
  project_type TEXT,
  budget TEXT,
  budget_purpose TEXT,
  lead_source TEXT,
  description_notes TEXT,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Notes table
CREATE TABLE IF NOT EXISTS gbs_crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES gbs_crm_clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS gbs_crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES gbs_crm_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('in-progress', 'completed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Global notes table (not tied to specific clients)
CREATE TABLE IF NOT EXISTS gbs_crm_global_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

-- Indexes for clients table
CREATE INDEX IF NOT EXISTS idx_gbs_crm_clients_user_id ON gbs_crm_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_gbs_crm_clients_archived ON gbs_crm_clients(archived);
CREATE INDEX IF NOT EXISTS idx_gbs_crm_clients_created_at ON gbs_crm_clients(created_at DESC);

-- Indexes for notes table
CREATE INDEX IF NOT EXISTS idx_gbs_crm_notes_client_id ON gbs_crm_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_gbs_crm_notes_created_at ON gbs_crm_notes(created_at DESC);

-- Indexes for tasks table
CREATE INDEX IF NOT EXISTS idx_gbs_crm_tasks_client_id ON gbs_crm_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_gbs_crm_tasks_status ON gbs_crm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_gbs_crm_tasks_due_date ON gbs_crm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_gbs_crm_tasks_priority ON gbs_crm_tasks(priority);

-- Indexes for global notes table
CREATE INDEX IF NOT EXISTS idx_gbs_crm_global_notes_user_id ON gbs_crm_global_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_gbs_crm_global_notes_created_at ON gbs_crm_global_notes(created_at DESC);

-- =====================================================
-- 3. CREATE TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for clients table
DROP TRIGGER IF EXISTS update_gbs_crm_clients_updated_at ON gbs_crm_clients;
CREATE TRIGGER update_gbs_crm_clients_updated_at
  BEFORE UPDATE ON gbs_crm_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for notes table
DROP TRIGGER IF EXISTS update_gbs_crm_notes_updated_at ON gbs_crm_notes;
CREATE TRIGGER update_gbs_crm_notes_updated_at
  BEFORE UPDATE ON gbs_crm_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for tasks table
DROP TRIGGER IF EXISTS update_gbs_crm_tasks_updated_at ON gbs_crm_tasks;
CREATE TRIGGER update_gbs_crm_tasks_updated_at
  BEFORE UPDATE ON gbs_crm_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for global notes table
DROP TRIGGER IF EXISTS update_gbs_crm_global_notes_updated_at ON gbs_crm_global_notes;
CREATE TRIGGER update_gbs_crm_global_notes_updated_at
  BEFORE UPDATE ON gbs_crm_global_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE gbs_crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE gbs_crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gbs_crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gbs_crm_global_notes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES - CLIENTS TABLE
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own clients" ON gbs_crm_clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON gbs_crm_clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON gbs_crm_clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON gbs_crm_clients;

-- Create new policies
CREATE POLICY "Users can view their own clients"
  ON gbs_crm_clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON gbs_crm_clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON gbs_crm_clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON gbs_crm_clients FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. CREATE RLS POLICIES - NOTES TABLE
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view notes for their clients" ON gbs_crm_notes;
DROP POLICY IF EXISTS "Users can insert notes for their clients" ON gbs_crm_notes;
DROP POLICY IF EXISTS "Users can update notes for their clients" ON gbs_crm_notes;
DROP POLICY IF EXISTS "Users can delete notes for their clients" ON gbs_crm_notes;

-- Create new policies
CREATE POLICY "Users can view notes for their clients"
  ON gbs_crm_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gbs_crm_clients
      WHERE gbs_crm_clients.id = gbs_crm_notes.client_id
      AND gbs_crm_clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert notes for their clients"
  ON gbs_crm_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gbs_crm_clients
      WHERE gbs_crm_clients.id = gbs_crm_notes.client_id
      AND gbs_crm_clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes for their clients"
  ON gbs_crm_notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gbs_crm_clients
      WHERE gbs_crm_clients.id = gbs_crm_notes.client_id
      AND gbs_crm_clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes for their clients"
  ON gbs_crm_notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gbs_crm_clients
      WHERE gbs_crm_clients.id = gbs_crm_notes.client_id
      AND gbs_crm_clients.user_id = auth.uid()
    )
  );

-- =====================================================
-- 7. CREATE RLS POLICIES - TASKS TABLE
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view tasks for their clients" ON gbs_crm_tasks;
DROP POLICY IF EXISTS "Users can insert tasks for their clients" ON gbs_crm_tasks;
DROP POLICY IF EXISTS "Users can update tasks for their clients" ON gbs_crm_tasks;
DROP POLICY IF EXISTS "Users can delete tasks for their clients" ON gbs_crm_tasks;

-- Create new policies
CREATE POLICY "Users can view tasks for their clients"
  ON gbs_crm_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gbs_crm_clients
      WHERE gbs_crm_clients.id = gbs_crm_tasks.client_id
      AND gbs_crm_clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tasks for their clients"
  ON gbs_crm_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gbs_crm_clients
      WHERE gbs_crm_clients.id = gbs_crm_tasks.client_id
      AND gbs_crm_clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks for their clients"
  ON gbs_crm_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gbs_crm_clients
      WHERE gbs_crm_clients.id = gbs_crm_tasks.client_id
      AND gbs_crm_clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks for their clients"
  ON gbs_crm_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gbs_crm_clients
      WHERE gbs_crm_clients.id = gbs_crm_tasks.client_id
      AND gbs_crm_clients.user_id = auth.uid()
    )
  );

-- =====================================================
-- 8. CREATE RLS POLICIES - GLOBAL NOTES TABLE
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own global notes" ON gbs_crm_global_notes;
DROP POLICY IF EXISTS "Users can insert their own global notes" ON gbs_crm_global_notes;
DROP POLICY IF EXISTS "Users can update their own global notes" ON gbs_crm_global_notes;
DROP POLICY IF EXISTS "Users can delete their own global notes" ON gbs_crm_global_notes;

-- Create new policies
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

-- =====================================================
-- 9. CREATE HELPER FUNCTIONS (OPTIONAL)
-- =====================================================

-- Function to get client statistics
CREATE OR REPLACE FUNCTION get_client_stats(client_uuid UUID)
RETURNS TABLE (
  notes_count BIGINT,
  tasks_count BIGINT,
  active_tasks_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM gbs_crm_notes WHERE client_id = client_uuid) as notes_count,
    (SELECT COUNT(*) FROM gbs_crm_tasks WHERE client_id = client_uuid) as tasks_count,
    (SELECT COUNT(*) FROM gbs_crm_tasks WHERE client_id = client_uuid AND status = 'in-progress') as active_tasks_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Verify the setup
SELECT 'Setup completed successfully!' as message;

-- Show created tables
SELECT 
  tablename, 
  schemaname 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('gbs_crm_clients', 'gbs_crm_notes', 'gbs_crm_tasks', 'gbs_crm_global_notes');

-- Show indexes
SELECT 
  indexname, 
  tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('gbs_crm_clients', 'gbs_crm_notes', 'gbs_crm_tasks', 'gbs_crm_global_notes')
ORDER BY tablename, indexname;

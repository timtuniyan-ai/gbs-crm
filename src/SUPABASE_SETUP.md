# Supabase Database Setup Guide

This guide describes the database structure required for the Mini CRM System.

## Database Tables

### 1. clients

Main table for storing client information.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  credit_score TEXT NOT NULL,
  
  -- Company Information
  industry TEXT,
  date_organized DATE,
  estimated_yearly_revenue TEXT,
  estimated_monthly_revenue TEXT,
  
  -- Project Details
  project_type TEXT,
  budget TEXT,
  budget_purpose TEXT,
  
  -- Lead Information
  lead_source TEXT,
  description_notes TEXT,
  
  -- System fields
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Optional: user_id for multi-user support
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

### 2. notes

Table for storing client notes with edit history.

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  
  -- Optional: user_id for tracking who created the note
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

### 3. tasks

Table for storing client-related tasks.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('in-progress', 'completed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  
  -- Optional: user_id for tracking who created the task
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

## Indexes

Create indexes for better query performance:

```sql
-- Index for client lookups by user
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_archived ON clients(archived);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- Index for notes by client
CREATE INDEX idx_notes_client_id ON notes(client_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);

-- Index for tasks by client and status
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

## Triggers

### Auto-update updated_at timestamp

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for clients table
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for notes table
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for tasks table
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Row Level Security (RLS)

Enable RLS and create policies for secure multi-user access:

```sql
-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policies for clients table
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for notes table
CREATE POLICY "Users can view notes for their clients"
  ON notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = notes.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert notes for their clients"
  ON notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = notes.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes for their clients"
  ON notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = notes.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes for their clients"
  ON notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = notes.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Policies for tasks table
CREATE POLICY "Users can view tasks for their clients"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = tasks.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tasks for their clients"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = tasks.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks for their clients"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = tasks.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks for their clients"
  ON tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = tasks.client_id
      AND clients.user_id = auth.uid()
    )
  );
```

## Helper Functions

### Get client with counts

```sql
CREATE OR REPLACE FUNCTION get_client_stats(client_uuid UUID)
RETURNS TABLE (
  notes_count BIGINT,
  tasks_count BIGINT,
  active_tasks_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM notes WHERE client_id = client_uuid) as notes_count,
    (SELECT COUNT(*) FROM tasks WHERE client_id = client_uuid) as tasks_count,
    (SELECT COUNT(*) FROM tasks WHERE client_id = client_uuid AND status = 'in-progress') as active_tasks_count;
END;
$$ LANGUAGE plpgsql;
```

## Setting Up in Supabase

### Step 1: Create Tables

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the table creation SQL from above
5. Run the query

### Step 2: Create Indexes

1. Copy and paste the index creation SQL
2. Run the query

### Step 3: Create Triggers

1. Copy and paste the trigger creation SQL
2. Run the query

### Step 4: Enable RLS and Create Policies

1. Copy and paste the RLS SQL
2. Run the query

### Step 5: Create Helper Functions (Optional)

1. Copy and paste the helper functions SQL
2. Run the query

## Environment Variables

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Quick Setup Script

For convenience, here's a complete script to run all setup at once:

```sql
-- Run this entire script in Supabase SQL Editor

-- 1. Create tables
CREATE TABLE clients (
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

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('in-progress', 'completed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Create indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_archived ON clients(archived);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX idx_notes_client_id ON notes(client_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- 3. Create triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for clients
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create RLS policies for notes
CREATE POLICY "Users can view notes for their clients"
  ON notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = notes.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert notes for their clients"
  ON notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = notes.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes for their clients"
  ON notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = notes.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes for their clients"
  ON notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = notes.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- 7. Create RLS policies for tasks
CREATE POLICY "Users can view tasks for their clients"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = tasks.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tasks for their clients"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = tasks.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks for their clients"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = tasks.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks for their clients"
  ON tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = tasks.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- 8. Create helper functions
CREATE OR REPLACE FUNCTION get_client_stats(client_uuid UUID)
RETURNS TABLE (
  notes_count BIGINT,
  tasks_count BIGINT,
  active_tasks_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM notes WHERE client_id = client_uuid) as notes_count,
    (SELECT COUNT(*) FROM tasks WHERE client_id = client_uuid) as tasks_count,
    (SELECT COUNT(*) FROM tasks WHERE client_id = client_uuid AND status = 'in-progress') as active_tasks_count;
END;
$$ LANGUAGE plpgsql;
```

## Notes

- All timestamp fields use `TIMESTAMPTZ` for timezone awareness
- The `user_id` field links records to authenticated users via Supabase Auth
- RLS policies ensure users can only access their own data
- ON DELETE CASCADE ensures related records are automatically deleted when a client is deleted
- The system supports multi-user scenarios out of the box

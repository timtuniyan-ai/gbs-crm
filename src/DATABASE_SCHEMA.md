# Database Schema Visualization

Visual representation of the Mini CRM database structure.

## Database Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Mini CRM Database                         │
│                    (PostgreSQL / Supabase)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │ clients │          │  notes  │          │  tasks  │
   └─────────┘          └─────────┘          └─────────┘
```

## Table Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  auth.users (Supabase Auth)                                     │
│  ├── id (UUID)                                                  │
│  └── [other auth fields]                                        │
│                                                                  │
└───┬──────────────────────────────────────────────────────────┬──┘
    │                                                          │
    │ user_id (FK)                                            │
    │                                                          │
    ▼                                                          │
┌─────────────────────────────────────┐                       │
│  clients                            │                       │
│  ├── id (PK, UUID)                 │                       │
│  ├── first_name                     │                       │
│  ├── last_name                      │                       │
│  ├── phone                          │                       │
│  ├── email                          │                       │
│  ├── business_name                  │                       │
│  ├── credit_score                   │                       │
│  ├── industry                       │                       │
│  ├── date_organized                 │                       │
│  ├── estimated_yearly_revenue       │                       │
│  ├── estimated_monthly_revenue      │                       │
│  ├── project_type                   │                       │
│  ├── budget                         │                       │
│  ├── budget_purpose                 │                       │
│  ├── lead_source                    │                       │
│  ├── description_notes              │                       │
│  ├── archived                       │                       │
│  ├── created_at                     │                       │
│  ├── updated_at                     │                       │
│  └── user_id (FK → auth.users)     │                       │
└──┬────────────────────────────────┬─┘                       │
   │                                │                          │
   │ client_id (FK)                 │ client_id (FK)          │
   │                                │                          │
   ▼                                ▼                          │
┌─────────────────────┐    ┌──────────────────────┐          │
│  notes              │    │  tasks               │          │
│  ├── id (PK, UUID) │    │  ├── id (PK, UUID)  │          │
│  ├── client_id (FK)│    │  ├── client_id (FK) │          │
│  ├── content        │    │  ├── title          │          │
│  ├── created_at     │    │  ├── description    │          │
│  ├── updated_at     │    │  ├── status         │          │
│  └── user_id (FK)  ─┼────┤  ├── priority       │          │
└─────────────────────┘    │  ├── due_date       │          │
                           │  ├── created_at     │          │
                           │  ├── updated_at     │          │
                           │  └── user_id (FK)  ─┼──────────┘
                           └──────────────────────┘
```

## Field Details

### 📋 clients Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique client identifier |
| `first_name` | TEXT | NOT NULL | Client's first name |
| `last_name` | TEXT | NOT NULL | Client's last name |
| `phone` | TEXT | NOT NULL | Contact phone number |
| `email` | TEXT | NOT NULL | Contact email address |
| `business_name` | TEXT | NOT NULL | Name of client's business |
| `credit_score` | TEXT | NOT NULL | Credit score value |
| `industry` | TEXT | NULL | Business industry |
| `date_organized` | DATE | NULL | Company organization date |
| `estimated_yearly_revenue` | TEXT | NULL | Estimated annual revenue |
| `estimated_monthly_revenue` | TEXT | NULL | Estimated monthly revenue |
| `project_type` | TEXT | NULL | Type of project |
| `budget` | TEXT | NULL | Project budget |
| `budget_purpose` | TEXT | NULL | Purpose of the budget |
| `lead_source` | TEXT | NULL | How client found us |
| `description_notes` | TEXT | NULL | Additional notes |
| `archived` | BOOLEAN | DEFAULT false | Archive status |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `user_id` | UUID | FK → auth.users(id), ON DELETE CASCADE | Owner user ID |

### 📝 notes Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique note identifier |
| `client_id` | UUID | FK → clients(id), NOT NULL, ON DELETE CASCADE | Associated client |
| `content` | TEXT | NOT NULL | Note content |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NULL | Last edit timestamp |
| `user_id` | UUID | FK → auth.users(id), ON DELETE CASCADE | Owner user ID |

### ✅ tasks Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique task identifier |
| `client_id` | UUID | FK → clients(id), NOT NULL, ON DELETE CASCADE | Associated client |
| `title` | TEXT | NOT NULL | Task title |
| `description` | TEXT | NULL | Task description |
| `status` | TEXT | NOT NULL, CHECK (in-progress, completed) | Task status |
| `priority` | TEXT | NOT NULL, CHECK (low, medium, high) | Task priority |
| `due_date` | TIMESTAMPTZ | NULL | Task deadline |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NULL | Last update timestamp |
| `user_id` | UUID | FK → auth.users(id), ON DELETE CASCADE | Owner user ID |

## Indexes

Performance optimization indexes:

```
clients table:
  ├── idx_clients_user_id ON (user_id)
  ├── idx_clients_archived ON (archived)
  └── idx_clients_created_at ON (created_at DESC)

notes table:
  ├── idx_notes_client_id ON (client_id)
  └── idx_notes_created_at ON (created_at DESC)

tasks table:
  ├── idx_tasks_client_id ON (client_id)
  ├── idx_tasks_status ON (status)
  ├── idx_tasks_due_date ON (due_date)
  └── idx_tasks_priority ON (priority)
```

## Triggers

Automatic timestamp management:

```sql
-- Function
update_updated_at_column()
  └── Sets updated_at = now()

-- Applied to:
  ├── clients (BEFORE UPDATE)
  ├── notes (BEFORE UPDATE)
  └── tasks (BEFORE UPDATE)
```

## Row Level Security (RLS)

### Security Model

```
┌──────────────────────────────────────┐
│         User Authentication          │
│         (Supabase Auth)             │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│      RLS Policy Evaluation           │
│                                      │
│  Does auth.uid() = record.user_id?  │
│                                      │
│  ├── YES → Grant Access              │
│  └── NO  → Deny Access               │
└──────────────────────────────────────┘
```

### RLS Policies

**clients table:**
- ✅ SELECT: Only own clients
- ✅ INSERT: Only with own user_id
- ✅ UPDATE: Only own clients
- ✅ DELETE: Only own clients

**notes table:**
- ✅ SELECT: Only notes for own clients
- ✅ INSERT: Only for own clients
- ✅ UPDATE: Only notes for own clients
- ✅ DELETE: Only notes for own clients

**tasks table:**
- ✅ SELECT: Only tasks for own clients
- ✅ INSERT: Only for own clients
- ✅ UPDATE: Only tasks for own clients
- ✅ DELETE: Only tasks for own clients

## Data Flow

### Creating a Client

```
1. User submits form
   ↓
2. Frontend calls clientsApi.create()
   ↓
3. Supabase validates auth token
   ↓
4. RLS checks auth.uid() = user_id
   ↓
5. INSERT into clients table
   ↓
6. Trigger sets created_at, updated_at
   ↓
7. Return new client data
   ↓
8. Frontend updates UI
```

### Creating a Note

```
1. User submits note
   ↓
2. Frontend calls notesApi.create(clientId, content)
   ↓
3. Supabase validates auth token
   ↓
4. RLS checks user owns the client
   ↓
5. INSERT into notes table
   ↓
6. Trigger sets created_at
   ↓
7. Return new note data
   ↓
8. Frontend updates UI
```

## Cascade Deletion

```
DELETE client
   ↓
   ├── Automatically deletes all notes for that client
   └── Automatically deletes all tasks for that client

DELETE user (from auth.users)
   ↓
   ├── Automatically deletes all their clients
   ├── Automatically deletes all their notes
   └── Automatically deletes all their tasks
```

## Example Queries

### Get all clients for current user
```sql
SELECT * FROM clients
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Get client with notes count
```sql
SELECT 
  c.*,
  COUNT(n.id) as notes_count
FROM clients c
LEFT JOIN notes n ON n.client_id = c.id
WHERE c.user_id = auth.uid()
GROUP BY c.id;
```

### Get active tasks with client info
```sql
SELECT 
  t.*,
  c.first_name,
  c.last_name,
  c.business_name
FROM tasks t
JOIN clients c ON c.id = t.client_id
WHERE t.status = 'in-progress'
  AND c.user_id = auth.uid()
ORDER BY t.priority DESC, t.due_date ASC;
```

## Storage Estimates

### Expected Data Growth

| Table | Avg Size per Row | Rows per User | Total per User |
|-------|-----------------|---------------|----------------|
| clients | ~1 KB | 10-100 | 10-100 KB |
| notes | ~500 B | 20-200 | 10-100 KB |
| tasks | ~400 B | 30-300 | 12-120 KB |
| **TOTAL** | | | **~32-320 KB** |

### Supabase Free Tier

- Database: 500 MB ✅
- Estimated users: ~1,500-15,000 (with average usage)
- More than sufficient for MVP and initial growth

## Performance Considerations

### Fast Queries (Indexed)
- ✅ Get clients by user_id
- ✅ Get notes by client_id
- ✅ Get tasks by client_id
- ✅ Get tasks by status
- ✅ Get tasks by priority
- ✅ Get items by created_at (sorted)

### Optimizations
- Indexes on frequently queried fields
- Cascade deletion for data integrity
- Foreign key constraints for referential integrity
- RLS policies at database level (faster than app-level checks)

## Security Features

```
┌─────────────────────────────────────────┐
│     Security Layers                     │
│                                         │
│  1. Authentication (Supabase Auth)     │
│     └── Email + Password               │
│                                         │
│  2. Authorization (RLS Policies)        │
│     └── User can only access own data  │
│                                         │
│  3. Data Validation                     │
│     ├── NOT NULL constraints            │
│     ├── CHECK constraints               │
│     └── Foreign key constraints         │
│                                         │
│  4. Cascade Deletion                    │
│     └── Prevent orphaned records        │
│                                         │
│  5. Automatic Timestamps                │
│     └── Audit trail                     │
└─────────────────────────────────────────┘
```

---

**Database Type**: PostgreSQL 15 (Supabase)  
**Charset**: UTF-8  
**Timezone**: UTC  
**Total Tables**: 3 (clients, notes, tasks)  
**Total Indexes**: 9  
**Total Triggers**: 3  
**Total RLS Policies**: 12  
**Security Level**: High (RLS enabled)  

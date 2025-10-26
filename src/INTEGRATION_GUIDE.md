# Supabase Integration Guide

This guide explains how to integrate Supabase with the Mini CRM System.

## Prerequisites

1. Supabase project created
2. Database setup completed (see `SUPABASE_SETUP.md`)
3. Environment variables configured

## Installation

Install the Supabase client library:

```bash
npm install @supabase/supabase-js
```

## Step 1: Create Supabase Client

Create a new file `/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Step 2: Create Database Types

Create `/lib/database.types.ts`:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          phone: string
          email: string
          business_name: string
          credit_score: string
          industry: string | null
          date_organized: string | null
          estimated_yearly_revenue: string | null
          estimated_monthly_revenue: string | null
          project_type: string | null
          budget: string | null
          budget_purpose: string | null
          lead_source: string | null
          description_notes: string | null
          archived: boolean
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          phone: string
          email: string
          business_name: string
          credit_score: string
          industry?: string | null
          date_organized?: string | null
          estimated_yearly_revenue?: string | null
          estimated_monthly_revenue?: string | null
          project_type?: string | null
          budget?: string | null
          budget_purpose?: string | null
          lead_source?: string | null
          description_notes?: string | null
          archived?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          phone?: string
          email?: string
          business_name?: string
          credit_score?: string
          industry?: string | null
          date_organized?: string | null
          estimated_yearly_revenue?: string | null
          estimated_monthly_revenue?: string | null
          project_type?: string | null
          budget?: string | null
          budget_purpose?: string | null
          lead_source?: string | null
          description_notes?: string | null
          archived?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      notes: {
        Row: {
          id: string
          client_id: string
          content: string
          created_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          client_id: string
          content: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          id?: string
          client_id?: string
          content?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      tasks: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string | null
          status: 'in-progress' | 'completed'
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          created_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description?: string | null
          status: 'in-progress' | 'completed'
          priority: 'low' | 'medium' | 'high'
          due_date?: string | null
          created_at?: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string | null
          status?: 'in-progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          created_at?: string
          updated_at?: string | null
          user_id?: string
        }
      }
    }
  }
}
```

## Step 3: Create API Service

Create `/lib/api.ts`:

```typescript
import { supabase } from './supabase'
import { Client, Note, Task } from '../types'

// Helper function to convert database row to Client
function dbToClient(row: any): Client {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    businessName: row.business_name,
    creditScore: row.credit_score,
    industry: row.industry,
    dateOrganized: row.date_organized,
    estimatedYearlyRevenue: row.estimated_yearly_revenue,
    estimatedMonthlyRevenue: row.estimated_monthly_revenue,
    projectType: row.project_type,
    budget: row.budget,
    budgetPurpose: row.budget_purpose,
    leadSource: row.lead_source,
    descriptionNotes: row.description_notes,
    archived: row.archived,
    createdAt: new Date(row.created_at),
  }
}

// Helper function to convert Client to database format
function clientToDb(client: Omit<Client, 'id' | 'createdAt'>) {
  return {
    first_name: client.firstName,
    last_name: client.lastName,
    phone: client.phone,
    email: client.email,
    business_name: client.businessName,
    credit_score: client.creditScore,
    industry: client.industry,
    date_organized: client.dateOrganized,
    estimated_yearly_revenue: client.estimatedYearlyRevenue,
    estimated_monthly_revenue: client.estimatedMonthlyRevenue,
    project_type: client.projectType,
    budget: client.budget,
    budget_purpose: client.budgetPurpose,
    lead_source: client.leadSource,
    description_notes: client.descriptionNotes,
    archived: client.archived || false,
  }
}

// Clients API
export const clientsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(dbToClient)
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return dbToClient(data)
  },

  async create(client: Omit<Client, 'id' | 'createdAt'>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...clientToDb(client),
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return dbToClient(data)
  },

  async update(id: string, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .update(clientToDb(updates as any))
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return dbToClient(data)
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async toggleArchive(id: string) {
    const client = await this.getById(id)
    return this.update(id, { archived: !client.archived })
  },
}

// Notes API
export const notesApi = {
  async getByClientId(clientId: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(note => ({
      id: note.id,
      clientId: note.client_id,
      content: note.content,
      createdAt: new Date(note.created_at),
      updatedAt: note.updated_at ? new Date(note.updated_at) : undefined,
    }))
  },

  async create(clientId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('notes')
      .insert({
        client_id: clientId,
        content,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return {
      id: data.id,
      clientId: data.client_id,
      content: data.content,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    }
  },

  async update(id: string, content: string) {
    const { data, error } = await supabase
      .from('notes')
      .update({ content })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return {
      id: data.id,
      clientId: data.client_id,
      content: data.content,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// Tasks API
export const tasksApi = {
  async getByClientId(clientId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(task => ({
      id: task.id,
      clientId: task.client_id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: task.updated_at ? new Date(task.updated_at) : undefined,
    }))
  },

  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(task => ({
      id: task.id,
      clientId: task.client_id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: task.updated_at ? new Date(task.updated_at) : undefined,
    }))
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        client_id: task.clientId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate?.toISOString(),
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return {
      id: data.id,
      clientId: data.client_id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    }
  },

  async update(id: string, updates: Partial<Task>) {
    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString()

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return {
      id: data.id,
      clientId: data.client_id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// Auth API
export const authApi = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  },
}
```

## Step 4: Update App.tsx

Replace the state management in `App.tsx` with Supabase calls:

```typescript
import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { LoginForm } from "./components/LoginForm";
import { Dashboard } from "./components/Dashboard";
import { AddClientModal } from "./components/AddClientModal";
import { ClientDetailsModal } from "./components/ClientDetailsModal";
import { Client, Note, Task } from "./types";
import { clientsApi, notesApi, tasksApi, authApi } from "./lib/api";
import { supabase } from "./lib/supabase";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [defaultTab, setDefaultTab] = useState<"info" | "notes" | "tasks">("info");
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    authApi.getSession().then(session => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    try {
      const [clientsData, tasksData] = await Promise.all([
        clientsApi.getAll(),
        tasksApi.getAll(),
      ]);
      setClients(clientsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogin = async () => {
    setIsLoggedIn(true);
    await loadData();
  };

  const handleLogout = async () => {
    await authApi.signOut();
    setIsLoggedIn(false);
    setClients([]);
    setNotes([]);
    setTasks([]);
  };

  const handleAddClient = async (clientData: Omit<Client, "id" | "createdAt">) => {
    try {
      const newClient = await clientsApi.create(clientData);
      setClients([newClient, ...clients]);
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleClientClick = async (client: Client, tab: "info" | "notes" | "tasks" = "info") => {
    setSelectedClient(client);
    setDefaultTab(tab);
    
    // Load notes for selected client
    try {
      const clientNotes = await notesApi.getByClientId(client.id);
      setNotes(clientNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleAddNote = async (content: string) => {
    if (!selectedClient) return;
    
    try {
      const newNote = await notesApi.create(selectedClient.id, content);
      setNotes([newNote, ...notes]);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      const updatedNote = await notesApi.update(noteId, content);
      setNotes(notes.map(note => note.id === noteId ? updatedNote : note));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await notesApi.delete(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleAddTask = async (taskData: Omit<Task, "id" | "clientId" | "createdAt">) => {
    if (!selectedClient) return;
    
    try {
      const newTask = await tasksApi.create({
        ...taskData,
        clientId: selectedClient.id,
      });
      setTasks([newTask, ...tasks]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await tasksApi.update(taskId, updates);
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleArchive = async (clientId: string) => {
    try {
      const updatedClient = await clientsApi.toggleArchive(clientId);
      setClients(clients.map(client => client.id === clientId ? updatedClient : client));
      if (selectedClient?.id === clientId) {
        setSelectedClient(updatedClient);
      }
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  const clientNotes = selectedClient 
    ? notes.filter(note => note.clientId === selectedClient.id)
    : [];

  const clientTasks = selectedClient 
    ? tasks.filter(task => task.clientId === selectedClient.id)
    : [];

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Dashboard
        clients={clients}
        tasks={tasks}
        onAddClientClick={() => setIsAddClientModalOpen(true)}
        onClientClick={handleClientClick}
        onToggleArchive={handleToggleArchive}
        onLogout={handleLogout}
      />

      <AddClientModal
        open={isAddClientModalOpen}
        onOpenChange={setIsAddClientModalOpen}
        onAddClient={handleAddClient}
      />

      <ClientDetailsModal
        client={selectedClient}
        open={!!selectedClient}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedClient(null);
            setDefaultTab("info");
          }
        }}
        notes={clientNotes}
        onAddNote={handleAddNote}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
        tasks={clientTasks}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onToggleArchive={handleToggleArchive}
        defaultTab={defaultTab}
      />
    </DndProvider>
  );
}
```

## Step 5: Update LoginForm Component

Update `components/LoginForm.tsx` to use real authentication:

```typescript
import { useState } from "react";
import { authApi } from "../lib/api";

interface LoginFormProps {
  onLogin: () => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await authApi.signUp(email, password);
        alert("Check your email for confirmation link!");
      } else {
        await authApi.signIn(email, password);
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... existing JSX with added email/password inputs
  );
}
```

## Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Real-time Updates (Optional)

Add real-time subscriptions to automatically update data:

```typescript
// In App.tsx, add after loading data:
useEffect(() => {
  if (!isLoggedIn) return;

  // Subscribe to clients changes
  const clientsSubscription = supabase
    .channel('clients-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'clients' },
      () => {
        loadData(); // Reload all data
      }
    )
    .subscribe();

  return () => {
    clientsSubscription.unsubscribe();
  };
}, [isLoggedIn]);
```

## Testing

1. Create a test account through the sign-up form
2. Verify email if email confirmation is enabled
3. Sign in and test all CRUD operations
4. Verify data persists after refresh
5. Test with multiple users to ensure RLS is working

## Troubleshooting

### Common Issues

1. **"Not authenticated" error**: Check if user is logged in before making requests
2. **RLS policy errors**: Ensure `user_id` is set correctly when creating records
3. **CORS errors**: Verify Supabase URL and check project settings
4. **Type errors**: Ensure database types match TypeScript types

### Debug Mode

Enable debug logging:

```typescript
// In lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  }
})
```

## Next Steps

1. Implement email confirmation flow
2. Add password reset functionality
3. Implement profile management
4. Add file upload for client documents
5. Create admin panel for user management
6. Add analytics and reporting features

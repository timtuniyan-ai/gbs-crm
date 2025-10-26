import { supabase } from './supabase'
import { Client, Note, Task } from '../src/types'

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
      .from('gbs_crm_clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(dbToClient)
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('gbs_crm_clients')
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
      .from('gbs_crm_clients')
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
      .from('gbs_crm_clients')
      .update(clientToDb(updates as any))
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return dbToClient(data)
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('gbs_crm_clients')
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
      .from('gbs_crm_notes')
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
      .from('gbs_crm_notes')
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
      .from('gbs_crm_notes')
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
      .from('gbs_crm_notes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// Tasks API
export const tasksApi = {
  async getByClientId(clientId: string) {
    const { data, error } = await supabase
      .from('gbs_crm_tasks')
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
      .from('gbs_crm_tasks')
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
      .from('gbs_crm_tasks')
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
      .from('gbs_crm_tasks')
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
      .from('gbs_crm_tasks')
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

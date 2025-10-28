import { supabase } from './supabase'
import { Client, Note, Task, Brief, BriefDocumentType, BriefLanguage } from '../src/types'

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
    industry: client.industry || null,
    date_organized: client.dateOrganized || null,
    estimated_yearly_revenue: client.estimatedYearlyRevenue || null,
    estimated_monthly_revenue: client.estimatedMonthlyRevenue || null,
    project_type: client.projectType || null,
    budget: client.budget || null,
    budget_purpose: client.budgetPurpose || null,
    lead_source: client.leadSource || null,
    description_notes: client.descriptionNotes || null,
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

// Helper function to convert database row to Brief
function dbToBrief(row: any): Brief {
  return {
    id: row.id,
    clientId: row.client_id,
    documentType: row.document_type,
    language: row.language,
    token: row.token,
    accessCode: row.access_code,
    status: row.status,
    currentStep: row.current_step,
    data: row.data || {},
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    createdBy: row.created_by,
  }
}

// Helper function to convert Brief to database format
function briefToDb(brief: Partial<Brief>) {
  return {
    client_id: brief.clientId,
    document_type: brief.documentType,
    language: brief.language,
    token: brief.token,
    access_code: brief.accessCode,
    status: brief.status,
    current_step: brief.currentStep,
    data: brief.data,
    completed_at: brief.completedAt?.toISOString(),
    created_by: brief.createdBy,
  }
}

// Generate random token and access code
function generateBriefCredentials() {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const accessCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  return { token, accessCode };
}

// Briefs API
export const briefsApi = {
  async getByClientId(clientId: string) {
    const { data, error } = await supabase
      .from('gbs_crm_briefs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(dbToBrief)
  },

  async getByToken(token: string) {
    const { data, error } = await supabase
      .from('gbs_crm_briefs')
      .select('*')
      .eq('token', token)
      .single()

    if (error) throw error
    return dbToBrief(data)
  },

  async create(clientId: string, documentType: BriefDocumentType, language: BriefLanguage) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { token, accessCode } = generateBriefCredentials()

    const { data, error } = await supabase
      .from('gbs_crm_briefs')
      .insert({
        client_id: clientId,
        document_type: documentType,
        language: language,
        token: token,
        access_code: accessCode,
        status: 'created',
        current_step: 0,
        data: {},
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return dbToBrief(data)
  },

  async verifyAccess(token: string, accessCode: string) {
    const { data, error } = await supabase
      .from('gbs_crm_briefs')
      .select('*')
      .eq('token', token)
      .eq('access_code', accessCode)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Invalid token or access code')
      }
      throw error
    }
    return dbToBrief(data)
  },

  async updateProgress(id: string, currentStep: number, data: Record<string, any>, status?: 'in_progress' | 'completed') {
    const updateData: any = {
      current_step: currentStep,
      data: data,
    }

    if (status) {
      updateData.status = status
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }
    }

    const { data: result, error } = await supabase
      .from('gbs_crm_briefs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return dbToBrief(result)
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('gbs_crm_briefs')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

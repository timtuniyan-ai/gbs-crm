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
      gbs_crm_clients: {
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
      gbs_crm_notes: {
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
      gbs_crm_tasks: {
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

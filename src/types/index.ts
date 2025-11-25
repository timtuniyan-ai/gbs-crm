export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  businessName: string;
  creditScore: string;
  // Description tab fields
  industry?: string;
  dateOrganized?: string;
  estimatedYearlyRevenue?: string;
  estimatedMonthlyRevenue?: string;
  projectType?: string;
  budget?: string;
  budgetPurpose?: string;
  leadSource?: string;
  descriptionNotes?: string;
  createdAt: Date;
  archived?: boolean;
}

export interface Note {
  id: string;
  clientId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Document {
  id: string;
  name: string;
  comment?: string;
  file_size: string;
  file_type: string;
  file_url: string;
  file_path: string;
  entity_type: 'client';
  entity_id: string;
  created_at: string;
  created_by: string;
  created_by_name: string;
}

export interface Task {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  status: "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export type BriefDocumentType = 'business_application' | 'marketing_brief' | 'technical_brief';
export type BriefLanguage = 'ru' | 'en';
export type BriefStatus = 'created' | 'in_progress' | 'completed';

export interface Brief {
  id: string;
  clientId: string;
  documentType: BriefDocumentType;
  language: BriefLanguage;
  token: string;
  accessCode: string;
  status: BriefStatus;
  currentStep: number;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  createdBy: string;
}

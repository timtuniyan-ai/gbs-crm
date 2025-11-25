import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Client, Note, Task, Brief, BriefDocumentType, BriefLanguage, Document } from "../types";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { NotesSection } from "./NotesSection";
import { TasksSection } from "./TasksSection";
import { CreateBriefModal } from "./CreateBriefModal";
import { BriefDetailsModal } from "./BriefDetailsModal";
import { DocumentCard } from "./DocumentCard";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { Badge } from "./ui/badge";
import { Mail, Phone, Building2, FileText, User, Archive, ArchiveRestore, Plus, Edit, Upload } from "lucide-react";
import { formatDateTimeCompact, formatDate } from "../utils/dateUtils";
import { briefsApi } from "../../lib/api";
import { useDocuments } from "../hooks/useDocuments";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ClientDetailsModalProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  onAddNote: (content: string) => void;
  onUpdateNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id" | "clientId" | "createdAt">) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleArchive: (clientId: string) => void;
  onEditClient: () => void;
  defaultTab?: "info" | "notes" | "tasks" | "briefs" | "documents";
}

export function ClientDetailsModal({
  client,
  open,
  onOpenChange,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleArchive,
  onEditClient,
  defaultTab = "info",
}: ClientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showCreateBriefModal, setShowCreateBriefModal] = useState(false);
  const [showBriefDetailsModal, setShowBriefDetailsModal] = useState(false);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  
  // Documents state
  const [documentComment, setDocumentComment] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Documents hook
  const { 
    documents, 
    loading: documentsLoading, 
    uploadDocument, 
    deleteDocument 
  } = useDocuments('client', client?.id);

  // Update active tab when defaultTab changes
  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, open]);

  // Load briefs when modal opens
  useEffect(() => {
    if (open && client) {
      loadBriefs();
    }
  }, [open, client]);

  const loadBriefs = async () => {
    if (!client) return;
    try {
      const clientBriefs = await briefsApi.getByClientId(client.id);
      setBriefs(clientBriefs);
    } catch (error) {
      console.error('Error loading briefs:', error);
    }
  };

  if (!client) return null;

  const handleCreateBrief = async (documentType: BriefDocumentType, language: BriefLanguage) => {
    if (!client) throw new Error('No client selected');
    
    const brief = await briefsApi.create(client.id, documentType, language);
    const briefUrl = `${window.location.origin}/brief/${brief.token}`;
    
    // Reload briefs to show the new one
    await loadBriefs();
    
    return {
      token: brief.token,
      accessCode: brief.accessCode,
      briefUrl: briefUrl,
    };
  };

  const handleViewBrief = (brief: Brief) => {
    setSelectedBrief(brief);
    setShowBriefDetailsModal(true);
  };

  const handleDeleteBrief = async (briefId: string) => {
    await briefsApi.delete(briefId);
    await loadBriefs();
  };

  // Document handlers
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    let successCount = 0;
    let errorCount = 0;

    // Загружаем все файлы
    for (const file of fileArray) {
      const result = await uploadDocument({
        name: file.name,
        comment: documentComment || undefined,
        file: file,
        entity_type: 'client',
        entity_id: client.id
      });

      if (result.error) {
        console.error('Error uploading document:', result.error);
        errorCount++;
      } else {
        successCount++;
      }
    }

    // Показываем результат
    if (successCount > 0) {
      toast.success(`${successCount} document${successCount > 1 ? 's' : ''} uploaded successfully!`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to upload ${errorCount} document${errorCount > 1 ? 's' : ''}`);
    }

    // Сброс формы
    setDocumentComment('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      setDocumentToDelete(doc);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    const result = await deleteDocument(documentToDelete.id);
    if (result.error) {
      console.error('Error deleting document:', result.error);
      toast.error('Failed to delete document', {
        description: result.error
      });
    } else {
      toast.success('Document deleted successfully!');
    }
    
    setDocumentToDelete(null);
  };

  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowDocumentPreview(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none w-[95vw] sm:w-[92vw] h-[95vh] sm:h-[90vh] overflow-hidden border border-gray-200 flex flex-col p-0 bg-white">
        <DialogHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6 shrink-0 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-gray-900 text-lg">
                    {client.firstName} {client.lastName}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-xs">
                    Manage client information, notes, and tasks
                  </DialogDescription>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <div className="flex justify-center">
                  <TabsList className="inline-flex bg-gray-50 border border-gray-300 p-1 rounded-lg h-9 sm:h-10 shadow-sm">
                    <TabsTrigger value="info" className="rounded-md text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 sm:px-4 h-7 sm:h-8 transition-all text-gray-600 hover:bg-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Info</TabsTrigger>
                    <TabsTrigger value="notes" className="rounded-md text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 sm:px-4 h-7 sm:h-8 transition-all text-gray-600 hover:bg-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Notes</TabsTrigger>
                    <TabsTrigger value="tasks" className="rounded-md text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 sm:px-4 h-7 sm:h-8 transition-all text-gray-600 hover:bg-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Tasks</TabsTrigger>
                    <TabsTrigger value="briefs" className="rounded-md text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 sm:px-4 h-7 sm:h-8 transition-all text-gray-600 hover:bg-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Brief</TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-md text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 sm:px-4 h-7 sm:h-8 transition-all text-gray-600 hover:bg-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Docs</TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 mr-2 sm:mr-4">
              <Button 
                onClick={onEditClient}
                variant="outline"
                size="sm"
                className="shrink-0 h-8 sm:h-9"
              >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              
              <Button 
                onClick={() => onToggleArchive(client.id)}
                variant={client.archived ? "default" : "outline"}
                size="sm"
                className={`shrink-0 h-8 sm:h-9 ${
                  client.archived 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : ""
                }`}
              >
                {client.archived ? (
                  <>
                    <ArchiveRestore className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Restore</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Archive</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 overflow-hidden px-4 sm:px-6 pb-4 sm:pb-6">

          <TabsContent value="info" className="mt-4 overflow-y-auto flex-1">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Full Name</p>
                      <p className="text-sm text-gray-900 truncate">{client.firstName} {client.lastName}</p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Credit Score</p>
                      <p className="text-sm text-gray-900 truncate">{client.creditScore}</p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Business</p>
                      <p className="text-sm text-gray-900 truncate">{client.businessName}</p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Email</p>
                      <p className="text-sm text-gray-900 break-all">{client.email}</p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{client.phone}</p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Created Date</p>
                      <p className="text-sm text-gray-900">
                        {formatDateTimeCompact(client.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="text-xs text-gray-900">Additional Notes</h3>
                  </div>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {client.descriptionNotes || 'No notes available'}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Lead Source */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
                  <h3 className="text-xs text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Lead Source
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Source</p>
                      <p className="text-sm text-gray-900 truncate">{client.leadSource || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
                  <h3 className="text-xs text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Project Details
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Project Type</p>
                      <p className="text-sm text-gray-900 truncate">{client.projectType || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Budget</p>
                      <p className="text-sm text-gray-900 truncate">{client.budget || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Budget Purpose</p>
                      <p className="text-sm text-gray-900">{client.budgetPurpose || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
                  <h3 className="text-xs text-gray-900 mb-2 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    Company Information
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Industry</p>
                      <p className="text-sm text-gray-900 truncate">{client.industry || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-pink-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Date Organized</p>
                      <p className="text-sm text-gray-900 truncate">
                        {client.dateOrganized ? formatDate(client.dateOrganized) : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Estimated Yearly Revenue</p>
                      <p className="text-sm text-gray-900 truncate">{client.estimatedYearlyRevenue || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Estimated Monthly Revenue</p>
                      <p className="text-sm text-gray-900 truncate">{client.estimatedMonthlyRevenue || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </TabsContent>

<TabsContent value="notes" className="mt-4 overflow-y-auto flex-1">
            <NotesSection
              notes={notes}
              onAddNote={onAddNote}
              onUpdateNote={onUpdateNote}
              onDeleteNote={onDeleteNote}
            />
          </TabsContent>

          <TabsContent value="tasks" className="mt-4 overflow-y-auto flex-1">
            <TasksSection
              tasks={tasks}
              onAddTask={onAddTask}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          </TabsContent>

          <TabsContent value="briefs" className="mt-4 overflow-y-auto flex-1">
            {briefs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center py-12 max-w-md">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No briefs yet</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Create a personalized brief for the client. They will receive a unique link and PIN code to fill it out.
                  </p>
                  <Button
                    onClick={() => setShowCreateBriefModal(true)}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Brief
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Client Briefs</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Total: {briefs.length}</p>
                  </div>
                  <Button
                    onClick={() => setShowCreateBriefModal(true)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Brief
                  </Button>
                </div>

                <div className="space-y-3">
                  {briefs.map((brief) => (
                    <div key={brief.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={`shrink-0 font-normal ${
                                brief.status === 'completed' ? 'bg-green-500 text-white hover:bg-green-600' : 
                                brief.status === 'in_progress' ? 'bg-blue-500 text-white hover:bg-blue-600' : 
                                'bg-orange-500 text-white hover:bg-orange-600'
                              }`}
                            >
                              {brief.status === 'completed' ? '✓ Completed' : 
                               brief.status === 'in_progress' ? '● In Progress' : '○ Created'}
                            </Badge>
                            <span className="text-xs text-gray-500 shrink-0">
                              {brief.language === 'ru' ? '🇷🇺 Русский' : '🇺🇸 English'}
                            </span>
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-1.5 text-sm">
                            {brief.documentType === 'business_application' ? 'Business Application' :
                             brief.documentType === 'marketing_brief' ? 'Marketing Brief' :
                             'Technical Brief'}
                          </h4>
                          
                          <div className="flex flex-col gap-1">
                            <p className="text-xs text-gray-600">
                              Created: {formatDateTimeCompact(brief.createdAt)}
                            </p>
                            {brief.completedAt && (
                              <p className="text-xs text-green-600">
                                Completed: {formatDateTimeCompact(brief.completedAt)}
                              </p>
                            )}
                            {brief.status !== 'created' && (
                              <p className="text-xs text-gray-500 font-mono">
                                PIN: {brief.accessCode} • Шаг {brief.currentStep}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewBrief(brief)}
                          className="text-xs"
                        >
                          Open
                        </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="mt-4 overflow-y-auto flex-1">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-semibold text-gray-900">Documents ({documents?.length || 0})</h3>
                  </div>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </div>
              
              <div className="p-5">
                {/* Скрытый input для выбора файлов */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                />

                {/* Список документов */}
                {documentsLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading documents...
                  </div>
                ) : documents && documents.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {documents.map((document) => (
                      <DocumentCard
                        key={document.id}
                        document={document}
                        onPreview={handlePreviewDocument}
                        onDelete={handleDeleteDocument}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No documents yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Upload documents related to this client
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload First Document
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <CreateBriefModal
          open={showCreateBriefModal}
          onOpenChange={setShowCreateBriefModal}
          onCreateBrief={handleCreateBrief}
          clientName={`${client.firstName} ${client.lastName}`}
        />

        <BriefDetailsModal
          open={showBriefDetailsModal}
          onOpenChange={setShowBriefDetailsModal}
          brief={selectedBrief}
          onDelete={handleDeleteBrief}
        />

        <DocumentPreviewModal
          document={selectedDocument}
          open={showDocumentPreview}
          onOpenChange={setShowDocumentPreview}
        />

        <DeleteConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          onConfirm={confirmDeleteDocument}
          itemName={documentToDelete?.name}
        />
      </DialogContent>
    </Dialog>
  );
}

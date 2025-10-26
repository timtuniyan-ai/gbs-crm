import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Client, Note, Document, Task } from "../types";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { NotesSection } from "./NotesSection";
import { TasksSection } from "./TasksSection";
import { Badge } from "./ui/badge";
import { Mail, Phone, Building2, FileText, User, Archive, ArchiveRestore } from "lucide-react";
import { formatDateTimeCompact, formatDate } from "../utils/dateUtils";
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
  defaultTab?: "info" | "notes" | "tasks";
}

const AVAILABLE_DOCUMENTS: Document[] = [
  { id: "1", name: "Service Agreement", description: "Standard contract" },
  { id: "2", name: "Commercial Proposal", description: "Proposal for client" },
  { id: "3", name: "Work Completion Certificate", description: "Acceptance certificate" },
];

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
  defaultTab = "info",
}: ClientDetailsModalProps) {
  const [selectedDocument, setSelectedDocument] = useState<string>("");
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Update active tab when defaultTab changes
  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, open]);

  if (!client) return null;

  const handleGenerateDocument = () => {
    if (selectedDocument) {
      const doc = AVAILABLE_DOCUMENTS.find(d => d.id === selectedDocument);
      alert(`Generating document: ${doc?.name}\nFor client: ${client.firstName} ${client.lastName}`);
      setSelectedDocument("");
      setShowDocumentSelector(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none w-[92vw] h-[90vh] overflow-hidden border border-gray-200 flex flex-col p-0">
        <DialogHeader className="pb-3 px-6 pt-6 shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-gray-900 text-lg">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <span>{client.firstName} {client.lastName}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm ml-11">
            Manage client information, notes, and tasks
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 overflow-hidden px-6 pb-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg h-9 shrink-0">
            <TabsTrigger value="info" className="rounded-md text-sm data-[state=active]:bg-white">Information</TabsTrigger>
            <TabsTrigger value="notes" className="rounded-md text-sm data-[state=active]:bg-white">Notes</TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-md text-sm data-[state=active]:bg-white">Tasks</TabsTrigger>
          </TabsList>

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

                {/* Quick Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="text-xs text-gray-900">Quick Actions</h3>
                  </div>
                  
                  <div className="flex flex-col gap-2.5">
                    {!showDocumentSelector ? (
                      <Button 
                        onClick={() => setShowDocumentSelector(true)}
                        size="sm"
                        className="w-full"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Document
                      </Button>
                    ) : (
                      <div className="space-y-2.5">
                        <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                          <SelectTrigger className="bg-white h-9 border-gray-300 text-sm">
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_DOCUMENTS.map((doc) => (
                              <SelectItem key={doc.id} value={doc.id}>
                                <div>
                                  <div className="text-sm">{doc.name}</div>
                                  <div className="text-xs text-gray-500">{doc.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleGenerateDocument}
                            disabled={!selectedDocument}
                            size="sm"
                            className="flex-1"
                          >
                            Create
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowDocumentSelector(false);
                              setSelectedDocument("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => onToggleArchive(client.id)}
                      variant={client.archived ? "default" : "outline"}
                      size="sm"
                      className={`w-full transition-colors ${
                        client.archived 
                          ? "bg-green-600 hover:bg-green-700" 
                          : ""
                      }`}
                    >
                      {client.archived ? (
                        <>
                          <ArchiveRestore className="w-4 h-4 mr-2" />
                          Restore from Archive
                        </>
                      ) : (
                        <>
                          <Archive className="w-4 h-4 mr-2" />
                          Move to Archive
                        </>
                      )}
                    </Button>
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

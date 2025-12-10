import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { LoginForm } from "./components/LoginForm";
import { Dashboard } from "./components/Dashboard";
import { AddClientModal } from "./components/AddClientModal";
import { EditClientModal } from "./components/EditClientModal";
import { ClientDetailsModal } from "./components/ClientDetailsModal";
import { BriefPublicPage } from "./components/BriefPublicPage";
import { Toaster } from "./components/ui/sonner";
import { Client, Note, Task } from "./types";
import { clientsApi, notesApi, tasksApi, authApi } from "../lib/api";
import { supabase } from "../lib/supabase";
import { taskDueChecker } from "./utils/taskDueChecker";
import { useGlobalNotes } from "./hooks/useGlobalNotes";

function CRMApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [clients, setClients] = useState<Client[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [defaultTab, setDefaultTab] = useState<"info" | "notes" | "tasks" | "briefs" | "documents">("info");
  const [loading, setLoading] = useState(true);

  // Global notes hook
  const {
    notes: globalNotes,
    addNote: addGlobalNote,
    updateNote: updateGlobalNote,
    deleteNote: deleteGlobalNote,
  } = useGlobalNotes(userId);

  // Check authentication on mount
  useEffect(() => {
    authApi.getSession()
      .then(session => {
        setIsLoggedIn(!!session);
        setUserId(session?.user?.id);
        setLoading(false);
      })
      .catch(error => {
        setIsLoggedIn(false);
        setUserId(undefined);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  // Start task due checker when app loads
  useEffect(() => {
    taskDueChecker.startDailyCheck();
    
    // Добавляем в глобальную область для тестирования
    if (typeof window !== 'undefined') {
      (window as any).taskDueChecker = taskDueChecker;
      // Также добавляем telegramNotifications для отладки
      import('./utils/telegramNotifications').then(({ telegramNotifications }) => {
        (window as any).telegramNotifications = telegramNotifications;
      });
    }
    
    // Cleanup function to stop checker when component unmounts
    return () => {
      taskDueChecker.stop();
    };
  }, []);

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
    setUserId(undefined);
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

  const handleUpdateClient = async (clientId: string, updates: Partial<Omit<Client, "id" | "createdAt">>) => {
    try {
      const updatedClient = await clientsApi.update(clientId, updates);
      setClients(clients.map(client => client.id === clientId ? updatedClient : client));
      if (selectedClient?.id === clientId) {
        setSelectedClient(updatedClient);
      }
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleEditClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setClientToEdit(client);
      setIsEditClientModalOpen(true);
    }
  };

  const handleEditClientFromDetails = () => {
    if (selectedClient) {
      setClientToEdit(selectedClient);
      setIsEditClientModalOpen(true);
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
        globalNotes={globalNotes}
        onAddClientClick={() => setIsAddClientModalOpen(true)}
        onClientClick={handleClientClick}
        onToggleArchive={handleToggleArchive}
        onEditClient={handleEditClient}
        onLogout={handleLogout}
        onAddGlobalNote={addGlobalNote}
        onUpdateGlobalNote={updateGlobalNote}
        onDeleteGlobalNote={deleteGlobalNote}
      />

      <AddClientModal
        open={isAddClientModalOpen}
        onOpenChange={setIsAddClientModalOpen}
        onAddClient={handleAddClient}
      />

      <EditClientModal
        open={isEditClientModalOpen}
        onOpenChange={setIsEditClientModalOpen}
        client={clientToEdit}
        onUpdateClient={handleUpdateClient}
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
        onEditClient={handleEditClientFromDetails}
        defaultTab={defaultTab}
      />
    </DndProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<CRMApp />} />
        <Route path="/brief/:token" element={<BriefPublicPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

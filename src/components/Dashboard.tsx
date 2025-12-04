import { useState, useMemo } from "react";
import { useDrop } from "react-dnd";
import { Client, Task, GlobalNote } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ClientCard } from "./ClientCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Users, LogOut, Search, Archive, StickyNote } from "lucide-react";
import { GlobalNotesPanel } from "./GlobalNotesPanel";

interface DashboardProps {
  clients: Client[];
  tasks: Task[];
  globalNotes: GlobalNote[];
  onAddClientClick: () => void;
  onClientClick: (client: Client, defaultTab?: "info" | "notes" | "tasks" | "briefs" | "documents") => void;
  onToggleArchive: (clientId: string) => void;
  onEditClient: (clientId: string) => void;
  onLogout: () => void;
  onAddGlobalNote: (title: string, content: string) => Promise<void>;
  onUpdateGlobalNote: (id: string, title: string, content: string) => Promise<void>;
  onDeleteGlobalNote: (id: string) => Promise<void>;
}

export function Dashboard({ 
  clients, 
  tasks, 
  globalNotes,
  onAddClientClick, 
  onClientClick, 
  onToggleArchive, 
  onEditClient, 
  onLogout,
  onAddGlobalNote,
  onUpdateGlobalNote,
  onDeleteGlobalNote,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);

  // Drop zones for Active and Archive tabs
  const [{ isOverActive, canDropActive }, dropActive] = useDrop(() => ({
    accept: 'CLIENT_CARD',
    drop: (item: { clientId: string; isArchived: boolean }) => {
      if (item.isArchived) {
        onToggleArchive(item.clientId);
      }
    },
    canDrop: (item: { clientId: string; isArchived: boolean }) => {
      // Can drop if the card is currently archived (to unarchive it)
      return item.isArchived;
    },
    collect: (monitor) => ({
      isOverActive: monitor.isOver() && monitor.canDrop(),
      canDropActive: monitor.canDrop(),
    }),
  }), [onToggleArchive]);

  const [{ isOverArchive, canDropArchive }, dropArchive] = useDrop(() => ({
    accept: 'CLIENT_CARD',
    drop: (item: { clientId: string; isArchived: boolean }) => {
      if (!item.isArchived) {
        onToggleArchive(item.clientId);
      }
    },
    canDrop: (item: { clientId: string; isArchived: boolean }) => {
      // Can drop if the card is currently active (to archive it)
      return !item.isArchived;
    },
    collect: (monitor) => ({
      isOverArchive: monitor.isOver() && monitor.canDrop(),
      canDropArchive: monitor.canDrop(),
    }),
  }), [onToggleArchive]);

  // Separate active and archived clients
  const activeClients = useMemo(() => clients.filter(c => !c.archived), [clients]);
  const archivedClients = useMemo(() => clients.filter(c => c.archived), [clients]);

  // Filter clients based on search query and tab
  const filteredClients = useMemo(() => {
    const clientsToFilter = activeTab === "active" ? activeClients : archivedClients;
    
    if (!searchQuery.trim()) {
      return clientsToFilter;
    }

    const query = searchQuery.toLowerCase();
    return clientsToFilter.filter((client) => {
      return (
        client.firstName.toLowerCase().includes(query) ||
        client.lastName.toLowerCase().includes(query) ||
        client.businessName.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query)
      );
    });
  }, [activeClients, archivedClients, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Notes Button on Left Edge - скрывается когда панель открыта */}
      {!isNotesPanelOpen && (
        <button
          onClick={() => setIsNotesPanelOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-lg shadow-lg transition-all"
          title="Global Notes"
        >
          <StickyNote className="w-5 h-5" />
        </button>
      )}

      {/* Overlay - закрывает панель при клике вне её */}
      {isNotesPanelOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-30 transition-opacity duration-300"
          onClick={() => setIsNotesPanelOpen(false)}
        />
      )}

      {/* Global Notes Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 z-40 transform transition-transform duration-300 ease-in-out ${
          isNotesPanelOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <GlobalNotesPanel
          notes={globalNotes}
          onAddNote={onAddGlobalNote}
          onUpdateNote={onUpdateGlobalNote}
          onDeleteNote={onDeleteGlobalNote}
          onClose={() => setIsNotesPanelOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isNotesPanelOpen ? "ml-80" : "ml-0"
        }`}
      >
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shrink-0 border border-gray-200">
                <img src="/logo.svg" alt="GBS Logo" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h1 className="text-gray-900 tracking-tight">GRAND BUSINESS SOLUTIONS</h1>
                <p className="text-sm text-gray-500">Client Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                onClick={onAddClientClick} 
                size="sm" 
                className="sm:h-9 bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Client</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={onLogout} 
                size="sm" 
                className="sm:h-9 border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        {clients.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-gray-900 mb-2">No clients yet</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start building your client database by adding your first client card
            </p>
            <Button 
              onClick={onAddClientClick}
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Client
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "active" | "archived")} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-gray-50 border border-gray-300 p-1 rounded-lg h-10 shadow-sm">
                <div ref={dropActive}>
                  <TabsTrigger 
                    value="active" 
                    className={`rounded-md text-sm flex items-center gap-2 px-4 h-8 transition-all text-gray-600 hover:bg-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm ${
                      isOverActive ? 'ring-2 ring-blue-400 bg-blue-100' : ''
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Active ({activeClients.length})
                  </TabsTrigger>
                </div>
                <div ref={dropArchive}>
                  <TabsTrigger 
                    value="archived" 
                    className={`rounded-md text-sm flex items-center gap-2 px-4 h-8 transition-all text-gray-600 hover:bg-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm ${
                      isOverArchive ? 'ring-2 ring-gray-400 bg-gray-200' : ''
                    }`}
                  >
                    <Archive className="w-4 h-4" />
                    Archive ({archivedClients.length})
                  </TabsTrigger>
                </div>
              </TabsList>

              {(activeTab === "active" ? activeClients.length : archivedClients.length) > 0 && (
                <div className="relative max-w-md flex-1 ml-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, company, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <TabsContent value="active" className="mt-0">
              <div className="min-h-[400px] rounded-lg">
                {activeClients.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-gray-900 mb-2">No active clients</h2>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      {isOverActive ? "Drop here to unarchive" : "All your clients have been archived"}
                    </p>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-gray-900 mb-2">No results found</h2>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      Try adjusting your search query to find what you're looking for
                    </p>
                    <Button variant="outline" onClick={() => setSearchQuery("")} className="border-gray-300">
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClients.map((client) => (
                      <ClientCard
                        key={client.id}
                        client={client}
                        tasks={tasks}
                        onClick={() => onClientClick(client)}
                        onTaskBadgeClick={() => onClientClick(client, "tasks")}
                        onToggleArchive={onToggleArchive}
                        onEditClient={onEditClient}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="archived" className="mt-0">
              <div className="min-h-[400px] rounded-lg">
                {archivedClients.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Archive className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-gray-900 mb-2">No archived clients</h2>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      {isOverArchive ? "Drop here to archive" : "Clients you archive will appear here"}
                    </p>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-gray-900 mb-2">No results found</h2>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      Try adjusting your search query to find what you're looking for
                    </p>
                    <Button variant="outline" onClick={() => setSearchQuery("")} className="border-gray-300">
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClients.map((client) => (
                      <ClientCard
                        key={client.id}
                        client={client}
                        tasks={tasks}
                        onClick={() => onClientClick(client)}
                        onTaskBadgeClick={() => onClientClick(client, "tasks")}
                        onToggleArchive={onToggleArchive}
                        onEditClient={onEditClient}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
      </div>
    </div>
  );
}

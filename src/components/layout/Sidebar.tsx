import { useState, useEffect } from 'react';
import { MessageSquare, Upload, Settings, Moon, Sun, X, Plus, Trash2, FileText, Loader2 } from 'lucide-react';
import { UploadPanel } from '../upload/UploadPanel';
import { DocumentSelector } from '../chat/DocumentSelector';
import { getChatHistory, deleteChatSession } from '../../lib/api';
import { chatStorage } from '../../lib/chatStorage';
import type { ChatSession } from '../../types/chat';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectSession?: (sessionId: string) => void;
  currentSessionId?: string;
  onStartChatWithDocument?: (documentId: string, documentName: string) => void;
  refreshTrigger?: number;
}

export function Sidebar({ isOpen, onToggle, onSelectSession, currentSessionId, onStartChatWithDocument, refreshTrigger }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'upload' | 'settings'>('chat');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ id: string; name: string } | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  console.log('🎨 Sidebar rendered - activeTab:', activeTab, 'isOpen:', isOpen);

  useEffect(() => {
    if (activeTab === 'chat') {
      loadSessions();
    }
  }, [activeTab, refreshTrigger]);  // Re-load when refresh trigger changes

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const sessions = await getChatHistory();
      setChatSessions(sessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleNewChatClick = () => {
    setShowNewChatDialog(true);
    setSelectedDocument(null);
  };

  const handleCreateChat = () => {
    const newSession = chatStorage.createSession(
      selectedDocument ? `Chat: ${selectedDocument.name}` : undefined,
      selectedDocument?.id,
      selectedDocument?.name
    );
    // Don't save to storage yet - will be saved when first message is sent
    onSelectSession?.(newSession.id);
    setShowNewChatDialog(false);
    setSelectedDocument(null);
    
    if (selectedDocument) {
      toast.success(`Started new chat with ${selectedDocument.name}`);
    } else {
      toast.success('Started new chat');
    }
  };

  const handleCancelNewChat = () => {
    setShowNewChatDialog(false);
    setSelectedDocument(null);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this chat?')) {
      deleteChatSession(sessionId)
        .then(() => {
          loadSessions();
          toast.success('Chat deleted');
          if (currentSessionId === sessionId) {
            // Just create a temp session, don't save it
            const newSession = chatStorage.createSession();
            onSelectSession?.(newSession.id);
          }
        })
        .catch((error) => {
          console.error('Error deleting session:', error);
          toast.error('Failed to delete chat');
        });
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onToggle}
      />

      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50 fixed lg:relative h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeTab === 'chat' && 'Chat'}
            {activeTab === 'upload' && 'Upload'}
            {activeTab === 'settings' && 'Settings'}
          </h2>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === 'chat' && (
            <div className="p-2">
              {!showNewChatDialog ? (
                <>
                  <button
                    onClick={handleNewChatClick}
                    className="w-full flex items-center gap-2 px-3 py-2 mb-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Chat
                  </button>
                </>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      New Chat
                    </h3>
                    <button
                      onClick={handleCancelNewChat}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <DocumentSelector
                    selectedDocument={selectedDocument}
                    onSelect={(id, name) => setSelectedDocument(id && name ? { id, name } : null)}
                  />
                  
                  <button
                    onClick={handleCreateChat}
                    className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Create Chat
                  </button>
                </div>
              )}
              
              <div className="space-y-1">
                {loadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading...</span>
                  </div>
                ) : chatSessions.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No chat history yet. Start a new conversation!
                  </p>
                ) : (
                  chatSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => {
                        onSelectSession?.(session.id);
                        onToggle(); // Close sidebar after selecting
                      }}
                      className={`group flex items-start gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        currentSessionId === session.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{session.title}</p>
                        {session.documentName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                            <FileText className="w-3 h-3" />
                            {session.documentName}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-opacity flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'upload' && (
            <UploadPanel onStartChat={(docId, docName) => {
              onStartChatWithDocument?.(docId, docName);
              onToggle(); // Close sidebar after starting chat
            }} />
          )}
          
          {activeTab === 'settings' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Dark Mode
                </span>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Version 0.1.0
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

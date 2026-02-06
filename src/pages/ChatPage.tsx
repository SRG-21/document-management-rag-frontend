import { useState, useEffect, useCallback } from 'react';
import { ChatContainer } from '../components/chat/ChatContainer';
import { Layout } from '../components/layout/Layout';
import { getChatHistory, createChatSession } from '../lib/api';
import type { ChatSession } from '../types/chat';
import toast from 'react-hot-toast';

export function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [initialSessions, setInitialSessions] = useState<ChatSession[] | null>(null);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMostRecentSession = async () => {
      try {
        const sessions = await getChatHistory();
        setInitialSessions(sessions);
        if (sessions.length > 0) {
          setCurrentSessionId(sessions[0].id);
        } else {
          // No existing sessions - just set null, user will click New Chat
          setCurrentSessionId(null);
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
        setInitialSessions([]);
        setCurrentSessionId(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMostRecentSession();
  }, []);

  const handleSelectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const handleSessionUpdate = useCallback(() => {
    setSidebarRefreshTrigger(prev => prev + 1);
  }, []);

  const handleStartChatWithDocument = useCallback(async (documentId: string, documentName: string) => {
    try {
      const response = await createChatSession({
        document_id: documentId,
        document_name: documentName,
        title: `Chat: ${documentName}`
      });
      setCurrentSessionId(response.session_id);
      setSidebarRefreshTrigger(prev => prev + 1);
      toast.success(`Started new chat with ${documentName}`);
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create chat session');
    }
  }, []);

  // Handle creating a new empty chat
  const handleNewChat = useCallback(async () => {
    try {
      const response = await createChatSession();
      setCurrentSessionId(response.session_id);
      setSidebarRefreshTrigger(prev => prev + 1);
      toast.success('Started new chat');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create chat session');
    }
  }, []);

  // Show loading while fetching initial session
  if (isLoading) {
    return (
      <Layout 
        onSelectSession={handleSelectSession}
        currentSessionId={currentSessionId || ''}
        onStartChatWithDocument={handleStartChatWithDocument}
        onNewChat={handleNewChat}
        sidebarRefreshTrigger={sidebarRefreshTrigger}
        initialSessions={initialSessions}
      >
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  // Show empty state if no session selected
  if (currentSessionId === null) {
    return (
      <Layout 
        onSelectSession={handleSelectSession}
        currentSessionId={''}
        onStartChatWithDocument={handleStartChatWithDocument}
        onNewChat={handleNewChat}
        sidebarRefreshTrigger={sidebarRefreshTrigger}
        initialSessions={initialSessions}
      >
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-4">No chat history yet</p>
          <button
            onClick={handleNewChat}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Chat
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      onSelectSession={handleSelectSession}
      currentSessionId={currentSessionId}
      onStartChatWithDocument={handleStartChatWithDocument}
      onNewChat={handleNewChat}
      sidebarRefreshTrigger={sidebarRefreshTrigger}
      initialSessions={initialSessions}
    >
      <ChatContainer 
        key={currentSessionId}
        sessionId={currentSessionId}
        onSessionUpdate={handleSessionUpdate}
      />
    </Layout>
  );
}

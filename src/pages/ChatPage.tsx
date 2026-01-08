import { useState, useEffect, useCallback } from 'react';
import { ChatContainer } from '../components/chat/ChatContainer';
import { Layout } from '../components/layout/Layout';
import { chatStorage } from '../lib/chatStorage';
import { getChatHistory } from '../lib/api';
import { generateId } from '../lib/utils';
import toast from 'react-hot-toast';

export function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const newSession = chatStorage.createSession();
    return newSession.id;
  });

  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  const [hasLoadedInitialSession, setHasLoadedInitialSession] = useState(false);

  useEffect(() => {
    if (hasLoadedInitialSession) return;

    const loadMostRecentSession = async () => {
      try {
        const sessions = await getChatHistory();
        if (sessions.length > 0) {
          setCurrentSessionId(sessions[0].id);
        }
        setHasLoadedInitialSession(true);
      } catch (error) {
        console.error('Error loading sessions:', error);
        setHasLoadedInitialSession(true);
      }
    };
    
    loadMostRecentSession();
  }, [hasLoadedInitialSession]);

  const handleSelectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const handleSessionUpdate = useCallback(() => {
    setSidebarRefreshTrigger(prev => prev + 1);
  }, []);

  const handleStartChatWithDocument = useCallback((documentId: string, documentName: string) => {
    const sessionId = generateId();
    sessionStorage.setItem(`session_context_${sessionId}`, JSON.stringify({
      documentId,
      documentName,
      title: `Chat: ${documentName}`
    }));
    setHasLoadedInitialSession(true);
    setCurrentSessionId(sessionId);
    toast.success(`Started new chat with ${documentName}`);
  }, []);

  return (
    <Layout 
      onSelectSession={handleSelectSession}
      currentSessionId={currentSessionId}
      onStartChatWithDocument={handleStartChatWithDocument}
      sidebarRefreshTrigger={sidebarRefreshTrigger}
    >
      <ChatContainer 
        key={currentSessionId}
        sessionId={currentSessionId}
        onSessionUpdate={handleSessionUpdate}
      />
    </Layout>
  );
}

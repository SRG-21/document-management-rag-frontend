import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  onSelectSession?: (sessionId: string) => void;
  currentSessionId?: string;
  onStartChatWithDocument?: (documentId: string, documentName: string) => void;
  sidebarRefreshTrigger?: number;
}

export function Layout({ children, onSelectSession, currentSessionId, onStartChatWithDocument, sidebarRefreshTrigger }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onSelectSession={onSelectSession}
        currentSessionId={currentSessionId}
        onStartChatWithDocument={onStartChatWithDocument}
        refreshTrigger={sidebarRefreshTrigger}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

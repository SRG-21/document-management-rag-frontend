import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useSSE } from '../../hooks/useSSE';
import { generateId } from '../../lib/utils';
import { getChatSession } from '../../lib/api';
import type { Message, ChatSession } from '../../types/chat';
import { FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatContainerProps {
  sessionId?: string;
  onSessionUpdate?: () => void;
}

export function ChatContainer({ sessionId, onSessionUpdate }: ChatContainerProps) {
  const [currentSession, setCurrentSession] = useState<ChatSession>({
    id: sessionId || '',
    title: 'New Chat',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const [useContext] = useState(true);
  const [maxTokens] = useState(500);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { streamChat, isStreaming } = useSSE();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedFromApi = useRef(false);

  useEffect(() => {
    // Load session from backend
    if (!sessionId || hasLoadedFromApi.current) return;
    
    hasLoadedFromApi.current = true;
    
    const loadSession = async () => {
      setIsLoadingHistory(true);
      try {
        const apiSession = await getChatSession(sessionId);
        setMessages(apiSession.messages || []);
        setCurrentSession({
          id: apiSession.id,
          title: apiSession.title || 'New Chat',
          messages: apiSession.messages || [],
          documentId: apiSession.documentId,
          documentName: apiSession.documentName,
          createdAt: apiSession.createdAt,
          updatedAt: apiSession.updatedAt,
        });
      } catch {
        // Session just created, no messages yet - keep empty state
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadSession();
  }, [sessionId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAssistantMessage, scrollToBottom]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentAssistantMessage('');

    const chatRequest: any = {
      query: content.trim(),
      use_context: useContext,
      max_tokens: maxTokens,
      session_id: currentSession.id,
    };

    if (currentSession.documentId) {
      chatRequest.document_filter = currentSession.documentId;
    }

    const assistantMessageId = generateId();
    let fullResponse = '';

    await streamChat(
      chatRequest,
      (chunk) => {
        fullResponse += chunk;
        setCurrentAssistantMessage(fullResponse);
      },
      () => {
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentAssistantMessage('');
        onSessionUpdate?.();
      },
      (error) => {
        toast.error(`Error: ${error}`);
        setCurrentAssistantMessage('');
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="px-4 lg:px-8 py-3 flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentSession.title || 'New Chat'}
            </h2>
            {currentSession.documentName && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm">
                <FileText className="w-3 h-3" />
                {currentSession.documentName}
              </span>
            )}
          </div>
          {isLoadingHistory && (
            <span className="text-xs text-gray-500">Loading history...</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-4">
          <MessageList
            messages={messages}
            currentAssistantMessage={currentAssistantMessage}
            isStreaming={isStreaming}
            documentName={currentSession.documentName}
          />
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-4">
          {currentSession.documentName && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <FileText className="w-3 h-3" />
                Chatting with: {currentSession.documentName}
              </span>
            </div>
          )}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isStreaming}
          />
        </div>
      </div>
    </div>
  );
}

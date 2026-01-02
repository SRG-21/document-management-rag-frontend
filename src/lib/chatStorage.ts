import type { ChatSession, Message } from '../types/chat';
import { generateId } from './utils';

const STORAGE_KEY = 'chat_sessions';

export const chatStorage = {
  getSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      // Parse dates back from strings and filter out empty sessions
      return sessions
        .map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        .filter((session: ChatSession) => session.messages.length > 0); // Only return sessions with messages
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
  },

  saveSession(session: ChatSession): void {
    try {
      const sessions = this.getSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.unshift(session);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  },

  getSession(id: string): ChatSession | undefined {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === id);
  },

  deleteSession(id: string): void {
    try {
      const sessions = this.getSessions().filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  },

  createSession(title?: string, documentId?: string, documentName?: string): ChatSession {
    return {
      id: generateId(),
      title: title || 'New Chat',
      messages: [],
      documentId,
      documentName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  updateSessionTitle(sessionId: string, messages: Message[], documentId?: string, documentName?: string): void {
    let session = this.getSession(sessionId);
    
    // If session doesn't exist in storage yet, we need to create it
    // This happens when a new session is created but not saved yet
    if (!session && messages.length > 0) {
      // Create a new session entry
      const firstUserMessage = messages.find(m => m.role === 'user');
      session = {
        id: sessionId,
        title: firstUserMessage 
          ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
          : 'New Chat',
        messages: messages,
        documentId,
        documentName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.saveSession(session);
      return;
    }
    
    if (session && session.title === 'New Chat' && messages.length > 0) {
      // Use first user message as title (truncated)
      const firstUserMessage = messages.find(m => m.role === 'user');
      if (firstUserMessage) {
        session.title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
        session.messages = messages;
        session.updatedAt = new Date();
        this.saveSession(session);
      }
    } else if (session) {
      session.messages = messages;
      session.updatedAt = new Date();
      this.saveSession(session);
    }
  },
};

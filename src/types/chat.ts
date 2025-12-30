export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  query: string;
  document_filter?: string;  // For document-specific context
  use_context?: boolean;
  session_id?: string;  // Optional session ID for persistence
  max_tokens?: number;
}

export interface SSEChunk {
  chunk?: string;
  done?: boolean;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  documentId?: string;  // Reference to the document used for context
  documentName?: string; // Name of the document for display
  createdAt: Date;
  updatedAt: Date;
}

// Backend API response types
export interface ApiChatMessage {
  role: string;
  content: string;
  timestamp: string;
}

export interface ApiChatSession {
  session_id: string;
  user_id: string;
  title: string;
  messages: ApiChatMessage[];
  document_id?: string;      // Document used for context
  document_name?: string;    // Document name for display
  created_at: string;
  updated_at: string;
}

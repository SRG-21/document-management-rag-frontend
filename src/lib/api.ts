import axios from 'axios';
import { config } from './config';
import type { UploadResponse, EmbeddedDocument } from '../types/upload';
import type { ApiChatSession, ChatSession } from '../types/chat';
import { generateId } from './utils';

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((axiosConfig) => {
  const token = localStorage.getItem('auth_token');
  if (token && axiosConfig.headers) {
    axiosConfig.headers.Authorization = `Bearer ${token}`;
  }
  return axiosConfig;
});

// Auth response type
interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
}

// Auth API
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/auth/register', { email, password });
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await apiClient.post('/api/auth/logout');
};

// Helper to convert API session to frontend session
const convertApiSessionToSession = (apiSession: ApiChatSession): ChatSession => {
  return {
    id: apiSession.session_id,
    title: apiSession.title,
    messages: apiSession.messages.map(msg => ({
      id: generateId(),
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      timestamp: new Date(msg.timestamp),
    })),
    documentId: apiSession.document_id,
    documentName: apiSession.document_name,
    createdAt: new Date(apiSession.created_at),
    updatedAt: new Date(apiSession.updated_at),
  };
};

// Chat History API
export interface CreateSessionRequest {
  document_id?: string;
  document_name?: string;
  title?: string;
}

export interface CreateSessionResponse {
  session_id: string;
  title: string;
  document_id?: string;
  document_name?: string;
  created_at: string;
}

export const createChatSession = async (request?: CreateSessionRequest): Promise<CreateSessionResponse> => {
  const response = await apiClient.post('/api/chat/session', request || {});
  return response.data;
};

export const getChatHistory = async (): Promise<ChatSession[]> => {
  const response = await apiClient.get('/api/chat/history');
  return response.data.map(convertApiSessionToSession);
};

export const getChatSession = async (sessionId: string): Promise<ChatSession> => {
  const response = await apiClient.get(`/api/chat/history/${sessionId}`);
  return convertApiSessionToSession(response.data);
};

export const deleteChatSession = async (sessionId: string): Promise<void> => {
  await apiClient.delete(`/api/chat/history/${sessionId}`);
};

export const deleteAllChatHistory = async (): Promise<void> => {
  await apiClient.delete('/api/chat/history');
};

// Document API
export const uploadDocument = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/api/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data;
};

export const getEmbeddedDocuments = async (): Promise<EmbeddedDocument[]> => {
  try {
    console.log('🔍 Fetching embedded documents from:', `${config.apiUrl}/api/upload/documents`);
    const response = await apiClient.get('/api/upload/documents');
    console.log('✅ Documents response:', response.data);
    // Backend returns { "documents": [...], "total": number }
    return response.data.documents || [];
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        response: (error as any).response?.data,
        status: (error as any).response?.status,
      });
    }
    throw error;
  }
};

export const getDocumentInfo = async (documentName: string): Promise<EmbeddedDocument> => {
  const response = await apiClient.get(`/api/upload/documents/${documentName}`);
  return response.data;
};

export const deleteDocument = async (filename: string): Promise<void> => {
  await apiClient.delete(`/api/upload/documents/${filename}`);
};

export const deleteAllDocuments = async (): Promise<void> => {
  await apiClient.delete('/api/upload/documents');
};

export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

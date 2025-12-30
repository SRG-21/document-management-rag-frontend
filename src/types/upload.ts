export interface UploadResponse {
  filename: string;
  chunks_created: number;
  status: 'completed' | 'processing';
  message: string;
  timestamp: string;
}

export interface UploadedDocument {
  id: string;
  filename: string;
  uploadedAt: Date;
  chunks: number;
  status?: 'completed' | 'processing' | 'failed';
}

export interface EmbeddedDocument {
  document_name: string;
  chunk_count: number;
  uploaded_at: string;
  file_size: number;
}

export interface DocumentListResponse {
  documents: EmbeddedDocument[];
  total: number;
}

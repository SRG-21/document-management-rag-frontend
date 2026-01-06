import { File, X, MessageSquare } from 'lucide-react';
import type { UploadedDocument } from '../../types/upload';
import { formatDate } from '../../lib/utils';

interface DocumentListProps {
  documents: UploadedDocument[];
  onRemove: (id: string) => void;
  onStartChat?: (documentId: string, documentName: string) => void;
}

export function DocumentList({ documents, onRemove, onStartChat }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Uploaded Documents ({documents.length})
      </h3>
      
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
        >
          <File className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {doc.filename}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatDate(doc.uploadedAt)} • {doc.chunks} chunks
            </p>
          </div>
          
          {onStartChat && (
            <button
              onClick={() => onStartChat(doc.id, doc.filename)}
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Start chat with this document"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={() => onRemove(doc.id)}
            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Remove document"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}

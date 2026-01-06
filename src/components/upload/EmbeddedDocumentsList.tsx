import { useEffect, useState } from 'react';
import { File, X, Loader2, CheckCircle, MessageSquare, RefreshCw, Trash2 } from 'lucide-react';
import { getEmbeddedDocuments, deleteDocument, deleteAllDocuments } from '../../lib/api';
import type { EmbeddedDocument } from '../../types/upload';
import toast from 'react-hot-toast';

interface EmbeddedDocumentsListProps {
  onStartChat?: (documentId: string, documentName: string) => void;
  onRefresh?: () => void;
}

export function EmbeddedDocumentsList({ onStartChat, onRefresh }: EmbeddedDocumentsListProps) {
  const [documents, setDocuments] = useState<EmbeddedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  console.log('🎨 EmbeddedDocumentsList mounted/rendered');

  const loadDocuments = async () => {
    try {
      setLoading(true);
      console.log('📄 Loading embedded documents...');
      const docs = await getEmbeddedDocuments();
      console.log('📋 Loaded documents:', docs);
      setDocuments(docs);
      onRefresh?.();
    } catch (error) {
      console.error('❌ Error in loadDocuments:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete "${filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(filename);
      await deleteDocument(filename);
      setDocuments(prev => prev.filter(doc => doc.document_name !== filename));
      toast.success('Document deleted successfully');
      onRefresh?.();
    } catch (error) {
      toast.error('Failed to delete document');
      console.error('Error deleting document:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Delete all ${documents.length} documents? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingAll(true);
      await deleteAllDocuments();
      setDocuments([]);
      toast.success('All documents deleted successfully');
      onRefresh?.();
    } catch (error) {
      toast.error('Failed to delete all documents');
      console.error('Error deleting all documents:', error);
    } finally {
      setDeletingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading documents...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No embedded documents yet</p>
        <p className="text-xs mt-1">Upload a document to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Embedded Documents ({documents.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDocuments}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          {documents.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
              title="Delete all documents"
            >
              {deletingAll ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              <span>Delete All</span>
            </button>
          )}
        </div>
      </div>

      {documents.map((doc) => (
        <div
          key={doc.document_name}
          className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
        >
          <File className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {doc.document_name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>{doc.chunk_count} chunks</span>
              <span>•</span>
              <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {onStartChat && (
              <button
                onClick={() => {
                  console.log('🎯 EmbeddedDocumentsList: Start chat clicked for:', doc.document_name);
                  onStartChat(doc.document_name, doc.document_name);
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                title="Start chat with this document"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => handleDelete(doc.document_name)}
              disabled={deleting === doc.document_name}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
              title="Delete document"
            >
              {deleting === doc.document_name ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

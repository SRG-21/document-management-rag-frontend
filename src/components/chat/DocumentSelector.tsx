import { useState, useEffect } from 'react';
import { FileText, X, Loader2 } from 'lucide-react';
import { getEmbeddedDocuments } from '../../lib/api';
import type { EmbeddedDocument } from '../../types/upload';

interface DocumentSelectorProps {
  selectedDocument?: { id: string; name: string } | null;
  onSelect: (documentId: string | null, documentName: string | null) => void;
}

export function DocumentSelector({ selectedDocument, onSelect }: DocumentSelectorProps) {
  const [documents, setDocuments] = useState<EmbeddedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      console.log('📄 DocumentSelector: Loading documents...');
      const docs = await getEmbeddedDocuments();
      console.log('📋 DocumentSelector: Loaded documents:', docs);
      // All documents from this endpoint are embedded/completed
      setDocuments(docs);
    } catch (error) {
      console.error('❌ DocumentSelector: Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (doc: EmbeddedDocument) => {
    onSelect(doc.document_name, doc.document_name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null, null);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Document Context:
        </label>
        
        {selectedDocument ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 rounded-lg text-sm">
            <FileText className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{selectedDocument.name}</span>
            <button
              onClick={handleClear}
              className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Select document'}
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-64 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
            ) : documents.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No documents available. Upload documents first.
              </div>
            ) : (
              <div className="p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
                  Select a document for context
                </div>
                {documents.map((doc) => (
                  <button
                    key={doc.document_name}
                    onClick={() => handleSelect(doc)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {doc.document_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {doc.chunk_count} chunks • {(doc.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import { FileDropzone } from './FileDropzone';
import { DocumentList } from './DocumentList';
import { EmbeddedDocumentsList } from './EmbeddedDocumentsList';
import { uploadDocument } from '../../lib/api';
import { config } from '../../lib/config';
import { generateId } from '../../lib/utils';
import type { UploadedDocument } from '../../types/upload';
import { Upload, Database } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadPanelProps {
  onStartChat?: (documentId: string, documentName: string) => void;
}

export function UploadPanel({ onStartChat }: UploadPanelProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'embedded'>('embedded');

  console.log('🎨 UploadPanel rendered, activeTab:', activeTab);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!config.allowedFileTypes.includes(fileExt)) {
      toast.error(`File type not allowed. Allowed types: ${config.allowedFileTypes.join(', ')}`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > config.maxFileSizeMB) {
      toast.error(`File size exceeds ${config.maxFileSizeMB}MB limit`);
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadDocument(file);
      
      const newDoc: UploadedDocument = {
        id: generateId(),
        filename: response.filename,
        uploadedAt: new Date(),
        chunks: response.chunks_created,
      };

      setDocuments(prev => [...prev, newDoc]);
      toast.success(`${response.filename} uploaded successfully! (${response.chunks_created} chunks created)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast.success('Document removed from list');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 pt-4">
        <button
          onClick={() => setActiveTab('embedded')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'embedded'
              ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Embedded Documents
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'upload'
              ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload New
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'embedded' ? (
          <EmbeddedDocumentsList onStartChat={onStartChat} />
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Upload Documents
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload PDF, DOCX, or TXT files for vector embeddings
              </p>
            </div>

            <FileDropzone onFileSelect={handleFileUpload} isUploading={isUploading} />

            {documents.length > 0 && (
              <div className="mt-6">
                <DocumentList
                  documents={documents}
                  onRemove={handleRemoveDocument}
                  onStartChat={onStartChat}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

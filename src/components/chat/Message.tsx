import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, FileText } from 'lucide-react';
import type { Message as MessageType } from '../../types/chat';
import { formatDate } from '../../lib/utils';

interface MessageProps {
  message: MessageType;
  documentName?: string; // Document used for context
}

export function Message({ message, documentName }: MessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium opacity-75">
              {isUser ? 'You' : 'Assistant'}
            </span>
            {isAssistant && documentName && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-600/20 dark:bg-blue-400/20 rounded text-[10px] font-medium text-blue-700 dark:text-blue-300">
                <FileText className="w-3 h-3" />
                {documentName}
              </span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="opacity-50 hover:opacity-100 transition-opacity"
            title="Copy message"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'dark:prose-invert'}`}>
          <ReactMarkdown
            components={{
              code({ inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        <div className="text-xs opacity-50 mt-2">
          {formatDate(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

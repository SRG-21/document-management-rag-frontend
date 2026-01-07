import { Message } from './Message';
import { StreamingIndicator } from './StreamingIndicator';
import type { Message as MessageType } from '../../types/chat';

interface MessageListProps {
  messages: MessageType[];
  currentAssistantMessage: string;
  isStreaming: boolean;
  documentName?: string; // Document used for context
}

export function MessageList({ messages, currentAssistantMessage, isStreaming, documentName }: MessageListProps) {
  if (messages.length === 0 && !currentAssistantMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500 dark:text-gray-400 p-8">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <p className="text-lg font-medium">Start a conversation</p>
        <p className="text-sm text-center">Type a message below to begin chatting</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <Message key={message.id} message={message} documentName={documentName} />
      ))}
      
      {currentAssistantMessage && (
        <Message
          message={{
            id: 'streaming',
            role: 'assistant',
            content: currentAssistantMessage,
            timestamp: new Date(),
          }}
          documentName={documentName}
        />
      )}
      
      {isStreaming && !currentAssistantMessage && <StreamingIndicator />}
    </div>
  );
}

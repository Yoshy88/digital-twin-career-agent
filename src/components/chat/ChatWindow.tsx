'use client';

import { useChat } from '@/lib/hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export function ChatWindow() {
  const { messages, isLoading, error, append } = useChat({
    api: '/api/chat',
  });

  const handleFormSubmit = async (message: string) => {
    await append({
      id: '',
      content: message,
      role: 'user',
    });
  };

  return (
    <div className="w-full max-w-4xl h-screen sm:h-[600px] sm:max-h-[600px] flex flex-col rounded-none sm:rounded-2xl bg-white dark:bg-neutral-900 shadow-none sm:shadow-sm dark:sm:shadow-lg border-0 sm:border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="flex-none px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight">
          Career Twin
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Your AI-powered career advisor
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex-none px-4 sm:px-6 py-3 bg-red-50 dark:bg-red-950/20 border-t border-red-200 dark:border-red-900/30">
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 line-clamp-2">
            Error: {error}
          </p>
        </div>
      )}

      {/* Input */}
      <div className="flex-none border-t border-neutral-200 dark:border-neutral-800">
        <MessageInput onSubmit={handleFormSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}

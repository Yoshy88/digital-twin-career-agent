'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSubmit: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function MessageInput({ onSubmit, isLoading }: MessageInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await onSubmit(message);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 flex gap-2 sm:gap-3 bg-white dark:bg-neutral-900 w-full">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about your career..."
        disabled={isLoading}
        className="flex-1 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-neutral-900 dark:focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <Button
        type="submit"
        disabled={isLoading || !input.trim()}
        size="icon"
        className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-neutral-900 dark:bg-blue-600 hover:bg-neutral-800 dark:hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

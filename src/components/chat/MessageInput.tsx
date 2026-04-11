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
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-black">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        disabled={isLoading}
        className="flex-1"
      />
      <Button
        type="submit"
        disabled={isLoading || !input.trim()}
        size="icon"
        className="rounded-lg"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

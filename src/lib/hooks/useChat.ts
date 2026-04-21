'use client';

import { useState, useCallback } from 'react';
import { Message } from '@/lib/types';

interface UseChatOptions {
  api: string;
}

export function useChat({ api }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const append = useCallback(
    async (message: Message) => {
      // Add user message to the state
      const userMessage = { ...message, id: message.id || Date.now().toString() };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const messageHistory = [...messages, userMessage];
        const response = await fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: messageHistory,
            ...(conversationId ? { conversationId } : {}),
          }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
          let serverMessage = 'I could not process your message right now. Please try again.';

          try {
            const contentType = response.headers.get('content-type') ?? '';
            if (contentType.includes('application/json')) {
              const payload = await response.json();
              if (typeof payload?.error === 'string' && payload.error.trim()) {
                serverMessage = payload.error;
              }
            } else {
              const text = await response.text();
              if (text.trim()) {
                serverMessage = text;
              }
            }
          } catch {
            // Keep default serverMessage when parsing response fails.
          }

          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: serverMessage,
            },
          ]);

          return;
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const nextConversationId = response.headers.get('x-conversation-id');
        if (nextConversationId && nextConversationId !== conversationId) {
          setConversationId(nextConversationId);
        }

        let assistantMessage = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantMessage += chunk;
        }

        if (!assistantMessage.trim()) {
          throw new Error('Empty response from API');
          assistantMessage = 'Thanks for your message. I saved your request and Dwight will follow up shortly.';
        }

        // Add assistant message to the state
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: assistantMessage,
          },
        ]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Chat error:', errorMessage);
        setError(errorMessage);
        
        // Add error message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Error: ${errorMessage}`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, api, conversationId]
  );

  return {
    messages,
    isLoading,
    error,
    append,
  };
}

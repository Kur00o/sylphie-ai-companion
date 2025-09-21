import { useState, useRef, useEffect } from 'react';
import { sylphieAPI, type ChatMessage, type APIRequest } from '@/lib/api';

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  conversationId: string | null;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message to N8N backend
  const sendMessage = async (text: string): Promise<void> => {
    if (!text.trim() || isLoading) return;

    // Clear any previous errors
    setError(null);

    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare request for N8N - flexible format
      const request: APIRequest = {
        message: text.trim(),
        text: text.trim(),
        input: text.trim(),
        query: text.trim(),
        conversationId: conversationId || undefined,
        sessionId: conversationId || undefined,
        userId: 'sylphie-user', // You can make this dynamic if needed
      };

      // Send to N8N webhook
      const response = await sylphieAPI.sendMessage(request);

      if (response.status === 'error') {
        throw new Error(response.error || 'Unknown error occurred');
      }

      // Create AI response message
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
      };

      // Add AI response
      setMessages(prev => [...prev, aiMessage]);

      // Update conversation ID if provided
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

    } catch (err) {
      console.error('Chat error:', err);
      
      // Create error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all messages and reset conversation
  const clearMessages = () => {
    setMessages([]);
    setError(null);
    setConversationId(null);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    conversationId,
  };
};

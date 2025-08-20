import { useEffect, useState, useCallback, useRef } from 'react';
import { chatService, type ChatMessage } from '@/lib/chatService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export interface UseChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  error: string | null;
  sendMessage: (content: string) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
}

export const useChat = (conversationId?: number): UseChatReturn => {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const conversationIdRef = useRef<number | undefined>(conversationId);
  const connectionAttemptsRef = useRef(0);
  const maxConnectionAttempts = 2;

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    chatService.onMessage((message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    chatService.onConnectionChange((connected: boolean) => {
      setIsConnected(connected);
      setIsConnecting(false);
      if (connected) {
        setError(null);
        connectionAttemptsRef.current = 0;
        toast.success('Chat bağlantısı kuruldu');
      } else {
        toast.error('Chat bağlantısı kesildi');
      }
    });

    chatService.onError((errorMessage: string) => {
      setError(errorMessage);
      setIsConnecting(false);
      
      if (!errorMessage.includes('timeout') && !errorMessage.includes('Failed to connect')) {
        toast.error(errorMessage);
      }
    });

    return () => {
      chatService.onMessage(() => {});
      chatService.onConnectionChange(() => {});
      chatService.onError(() => {});
    };
  }, []);

  const connect = useCallback(async () => {
    if (!token) {
      setError('Authentication token not available');
      return;
    }

    if (isConnecting || isConnected) {
      return;
    }

    if (connectionAttemptsRef.current >= maxConnectionAttempts) {
      setError('Maksimum bağlantı denemesi aşıldı. Lütfen sayfayı yenileyin.');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      connectionAttemptsRef.current++;
      
      await chatService.connect(token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      setIsConnecting(false);
      
      if (!errorMessage.includes('timeout')) {
        toast.error(errorMessage);
      }
    }
  }, [token, isConnecting, isConnected]);

  useEffect(() => {
    if (isConnected && conversationId) {
      try {
        chatService.subscribeToConversation(conversationId);
        setMessages([]);
      } catch (error) {
        console.error('Failed to subscribe to conversation:', error);
        setError('Conversation\'a abone olunamadı');
      }
    }
  }, [isConnected, conversationId]);

  useEffect(() => {
    if (token && !isConnected && !isConnecting) {
      connect();
    }
  }, [token, isConnected, isConnecting, connect]);

  useEffect(() => {
    return () => {
      if (conversationIdRef.current) {
        chatService.unsubscribeFromCurrent();
      }
    };
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!conversationId) {
      setError('No active conversation');
      return;
    }

    if (!content.trim()) {
      return;
    }

    if (!isConnected) {
      setError('Chat bağlantısı yok. Mesaj gönderilemedi.');
      toast.error('Chat bağlantısı yok. Mesaj gönderilemedi.');
      return;
    }

    try {
      chatService.sendMessage(conversationId, content);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Mesaj gönderilemedi');
      toast.error('Mesaj gönderilemedi');
    }
  }, [conversationId, isConnected]);

  const disconnect = useCallback(() => {
    chatService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setMessages([]);
    setError(null);
    connectionAttemptsRef.current = 0;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isConnected,
    error,
    sendMessage,
    connect,
    disconnect,
    clearError,
  };
};

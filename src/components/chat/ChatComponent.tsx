import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useChat } from '@/hooks/useChat';
import { Send, Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useSendMessage, useConversationMessages, useMarkConversationRead } from '@/hooks/useMessages';
import { useAuthStore } from '@/store/authStore';

interface ChatComponentProps {
  conversationId?: number;
  conversationTitle?: string;
  className?: string;
}

export function ChatComponent({ 
  conversationId, 
  conversationTitle = 'Sohbet', 
  className = '' 
}: ChatComponentProps) {
  const { messages: wsMessages, isConnected, error, sendMessage, connect, clearError } = useChat(conversationId);
  const [inputValue, setInputValue] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendMessageMutation = useSendMessage();
  const { user } = useAuthStore();
  const { data: restMessages } = useConversationMessages(conversationId);
  const markRead = useMarkConversationRead();
  const hasMarkedRef = useRef<number | null>(null);

  const getSenderDisplayName = (params: { sender?: string; firstName?: string; lastName?: string; email?: string }) => {
    const full = [params.firstName, params.lastName].filter(Boolean).join(' ').trim();
    return full || params.sender || params.email || 'Kullanıcı';
  };

  const combinedMessages = (() => {
    const mappedRest = (restMessages || []).map((m) => ({
      id: String(m.id),
      sender: getSenderDisplayName({
        firstName: m.senderFirstName,
        lastName: m.senderLastName,
        email: m.senderEmail,
      }),
      content: m.content,
      timestamp: m.createdAt,
      conversationId: m.conversationId,
    }));
    const all = [...mappedRest, ...wsMessages];
    const seen = new Set<string>();
    const deduped: typeof all = [];
    for (const msg of all) {
      const key = msg.id ? `id:${msg.id}` : `hc:${msg.sender}|${msg.content}|${msg.timestamp?.slice(0,19)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(msg);
    }
    return deduped.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  })();

  useEffect(() => {
    if (conversationId && restMessages && hasMarkedRef.current !== conversationId) {
      hasMarkedRef.current = conversationId;
      markRead.mutate(conversationId);
    }
  }, [conversationId, restMessages, markRead]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [combinedMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    if (conversationId) {
      sendMessageMutation.mutate({ conversationId, content: inputValue.trim() });
      if (isConnected) {
        sendMessage(inputValue.trim());
      }
    }
    setInputValue('');
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRetryConnection = async () => {
    clearError();
    try {
      await connect();
    } catch (error) {
      console.error('Retry connection failed:', error);
    }
  };

  const getConnectionStatus = () => {
    if (error) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Bağlantı hatası</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetryConnection}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Yeniden dene
          </Button>
        </div>
      );
    }
    
    return (
      <div className={`flex items-center gap-2 ${isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
        {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        <span className="text-sm">{isConnected ? 'Canlı' : 'Bağlanıyor...'}</span>
      </div>
    );
  };
  const effectiveTitle = (() => {
    if (conversationTitle && conversationTitle !== 'Sohbet') return conversationTitle;
    const other = combinedMessages.find(m => {
      const me = user?.email || '';
      return m.sender && m.sender !== me;
    });
    return other?.sender || conversationTitle;
  })();

  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: tr 
      });
    } catch {
      return 'Az önce';
    }
  };

  const getInitials = (sender: string) => {
    return sender.charAt(0).toUpperCase();
  };

  const isInputDisabled = !conversationId || !!error;

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{effectiveTitle}</CardTitle>
          {getConnectionStatus()}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px] max-h-[500px]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Bağlantı Sorunu</span>
              </div>
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryConnection}
                className="text-red-700 border-red-300 hover:bg-red-50"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Yeniden Bağlan
              </Button>
            </div>
          )}
          
          {combinedMessages.length === 0 && !error ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-lg font-medium mb-2">Henüz mesaj yok</div>
                <div className="text-sm">İlk mesajınızı göndererek sohbeti başlatın</div>
              </div>
            </div>
          ) : (
            combinedMessages.map((message, index) => (
              <div key={message.id || index} className="flex items-start gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {getInitials(message.sender)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {message.sender}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isInputDisabled ? "Bağlantı bekleniyor..." : "Mesajınızı yazın..."}
              disabled={isInputDisabled}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isInputDisabled}
              size="icon"
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {!conversationId && (
            <div className="text-xs text-gray-500 mt-2 text-center">
              Sohbet başlatmak için bir konuşma seçin
            </div>
          )}
          
          {error && (
            <div className="text-xs text-red-500 mt-2 text-center">
              Mesaj göndermek için bağlantı kurulması gerekiyor
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useConversations, useMarkConversationRead } from '@/hooks/useMessages';
import { ChatComponent } from '@/components/chat/ChatComponent';
import type { Conversation } from '@/types';
import { MessageSquare } from 'lucide-react';

export function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: conversations, isLoading } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<number | undefined>(undefined);
  const markRead = useMarkConversationRead();
  const lastMarkedRef = useRef<number | null>(null);

  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      setActiveConversationId(Number(conversationId));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!activeConversationId && conversations && conversations.length > 0) {
      const firstId = conversations[0].id;
      setActiveConversationId(firstId);
      setSearchParams({ conversation: String(firstId) }, { replace: true });
    }
  }, [conversations, activeConversationId, setSearchParams]);

  const activeConversation: Conversation | undefined = useMemo(() => {
    if (conversations && activeConversationId) {
      return conversations.find((c) => c.id === activeConversationId);
    }
    if (!conversations && activeConversationId) {
      return { id: activeConversationId } as unknown as Conversation;
    }
    return undefined;
  }, [conversations, activeConversationId]);

  useEffect(() => {
    if (activeConversationId && lastMarkedRef.current !== activeConversationId) {
      lastMarkedRef.current = activeConversationId;
      markRead.mutate(activeConversationId);
    }
  }, [activeConversationId, markRead]);

  const getConversationTitle = (conversation: Conversation) => {
    const name = conversation.otherUserName?.trim();
    const company = conversation.otherUserCompany?.trim();
    if (name) return name;
    if (company) return company;
    if (conversation.otherUserId) return `Kullanıcı #${conversation.otherUserId}`;
    return 'Sohbet';
  };

  const getInitials = (conversation: Conversation) => {
    const name = getConversationTitle(conversation);
    return name.charAt(0).toUpperCase();
  };

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Container className="py-8">
          <PageHeader 
            title="Mesajlar" 
            description="Kullanıcılarla gerçek zamanlı mesajlaşın" 
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            <Card className="border-0 rounded-2xl shadow-sm lg:col-span-1">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="border-b p-4 font-medium flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Sohbetler</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {conversations?.length || 0}
                  </Badge>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : conversations?.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Henüz bir sohbet bulunmuyor</p>
                      <p className="text-xs mt-1">İlanlardan bir kullanıcıyla iletişime geçin</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {conversations?.map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => {
                            setActiveConversationId(conversation.id);
                            setSearchParams({ conversation: String(conversation.id) }, { replace: true });
                          }}
                          className={`w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                            conversation.id === activeConversationId ? 'bg-gray-50 border-r-2 border-primary' : ''
                          }`}
                        >
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="text-sm">
                              {getInitials(conversation)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium truncate text-gray-900">
                                {getConversationTitle(conversation)}
                              </div>
                              {conversation.unreadCount ? (
                                <Badge className="text-xs px-2 py-0.5">
                                  {conversation.unreadCount}
                                </Badge>
                              ) : null}
                            </div>
                            
                            {conversation.lastMessagePreview ? (
                              <div className="text-sm text-gray-500 truncate">
                                {conversation.lastMessagePreview}
                              </div>
                            ) : null}
                            
                            {conversation.updatedAt && (
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(conversation.updatedAt).toLocaleDateString('tr-TR', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
                    
            <div className="lg:col-span-3">
              {activeConversation ? (
                <ChatComponent
                  conversationId={activeConversation.id}
                  conversationTitle={getConversationTitle(activeConversation)}
                  className="h-full"
                />
              ) : (
                <Card className="border-0 rounded-2xl shadow-sm h-full">
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Sohbet seçin</h3>
                      <p className="text-sm">
                        Sol taraftan bir konuşma seçerek mesajlaşmaya başlayın
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Container>
      </div>
    </AuthGuard>
  );
}



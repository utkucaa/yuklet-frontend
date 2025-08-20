import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import type { Conversation, Message } from '@/types';

export const useConversations = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async (): Promise<Conversation[]> => {
      try {
        const res = await api.get('/messages/conversations');
        const rawList = res.data as Array<Record<string, unknown>>;
        const { user } = useAuthStore.getState();
        const currentUserId = user?.id;

        const normalized: Conversation[] = rawList.map((raw) => {
          const cast = raw as any;
          const user1Id = Number(cast.user1Id ?? cast.userOneId);
          const user2Id = Number(cast.user2Id ?? cast.userTwoId);
          const otherId = currentUserId && user1Id && user2Id
            ? (currentUserId === user1Id ? user2Id : user1Id)
            : Number(cast.otherUserId);
          const otherFirstName: string | undefined = cast.otherFirstName || cast.firstName || undefined;
          const otherLastName: string | undefined = cast.otherLastName || cast.lastName || undefined;
          const companyName: string | undefined = cast.companyName
            || cast.otherUserCompany
            || (currentUserId === user1Id ? cast.user2CompanyName : cast.user1CompanyName)
            || undefined;

          const combinedNameFromParts = [otherFirstName, otherLastName].filter(Boolean).join(' ').trim();
          const nameFromBackend = cast.otherUserName || (currentUserId === user1Id ? cast.user2Name : cast.user1Name);
          const otherName = combinedNameFromParts || nameFromBackend || companyName || undefined;
          const otherCompany = companyName;

          return {
            id: Number(cast.id),
            otherUserId: otherId || undefined,
            otherUserName: otherName,
            otherUserCompany: otherCompany,
            lastMessagePreview: cast.lastMessagePreview || undefined,
            unreadCount: Number(cast.unreadCount || 0) || undefined,
            updatedAt: String(cast.lastMessageDate || cast.updatedAt || cast.createdDate || '') || undefined,
          } as Conversation;
        });
        return normalized;
      } catch (error) {
        // Swallow errors to avoid retry storms when unauthorized
        return [];
      }
    },
    enabled: isAuthenticated,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 60 * 1000,
  });
};

export const useConversationMessages = (conversationId?: number) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['conversation', conversationId, 'messages'],
    queryFn: async (): Promise<Message[]> => {
      try {
        const res = await api.get(`/messages/conversation/${conversationId}`);
        return res.data as Message[];
      } catch (_error) {
        return [];
      }
    },
    enabled: isAuthenticated && !!conversationId,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 30 * 1000,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { otherUserId: number; cargoRequestId?: number }) => {
      try {
        const res = await api.post(`/messages/conversation`, undefined, { params });
        return res.data as Conversation;
      } catch (error) {
        console.log('Creating conversation failed:', error);
        // Fallback: mock data
        return { id: Date.now(), otherUserId: params.otherUserId } as Conversation;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { conversationId: number; content: string }) => {
      try {
        const res = await api.post('/messages', payload);
        console.log('Send message response:', res.data);
        return res.data as Message;
      } catch (error) {
        console.log('Send message failed:', error);
        throw error;
      }
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', message.conversationId, 'messages'] });
    },
  });
};

export const useMarkConversationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: number) => {
      try {
        const res = await api.put(`/messages/conversation/${conversationId}/mark-read`);
        console.log('Mark read response:', res.data);
      } catch (error) {
        console.log('Mark read failed:', error);
        // Endpoint yoksa sessizce geç
      }
    },
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId, 'messages'] });
    },
  });
};

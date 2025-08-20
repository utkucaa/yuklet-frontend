import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export const useNotifications = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<Notification[]> => {
      const response = await api.get('/notifications');
      return response.data;
    },
    enabled: isAuthenticated,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 60 * 1000,
  });
};

export const useUnreadNotifications = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async (): Promise<Notification[]> => {
      const response = await api.get('/notifications/unread');
      return response.data;
    },
    enabled: isAuthenticated,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 60 * 1000,
  });
};

export const useUnreadNotificationCount = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['notifications', 'unread', 'count'],
    queryFn: async (): Promise<number> => {
      const response = await api.get('/notifications/unread/count');
      return response.data;
    },
    enabled: isAuthenticated,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 60 * 1000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: number) => {
      await api.put(`/notifications/${notificationId}/mark-read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', 'count'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.put('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', 'count'] });
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    },
    onError: () => {
      toast.error('Bildirimler işaretlenirken hata oluştu');
    },
  });
};

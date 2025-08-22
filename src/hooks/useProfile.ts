import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { UserProfile } from '@/types';
import toast from 'react-hot-toast';

export const useProfile = (userId: number) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<UserProfile> => {
      const response = await api.get(`/users/profile/${userId}`);
      return response.data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<UserProfile>): Promise<UserProfile> => {
      const response = await api.put('/users/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
      toast.success('Profil güncellendi');
    },
    onError: () => {
      toast.error('Profil güncellenirken hata oluştu');
    },
  });
};

// Tüm kullanıcıları getirme hook'u
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['all-users'],
    queryFn: async (): Promise<UserProfile[]> => {
      const response = await api.get('/admin/users');
      return response.data;
    },
  });
};

// Bekleyen kullanıcıları getirme hook'u
export const usePendingUsers = () => {
  return useQuery({
    queryKey: ['pending-users'],
    queryFn: async (): Promise<UserProfile[]> => {
      const response = await api.get('/admin/users/search?status=PENDING');
      return response.data;
    },
  });
};

// Kullanıcı onaylama hook'u
export const useApproveUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number): Promise<void> => {
      await api.put(`/admin/users/${userId}/status?status=ACTIVE`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      toast.success('Kullanıcı onaylandı');
    },
    onError: () => {
      toast.error('Kullanıcı onaylanırken hata oluştu');
    },
  });
};

// Kullanıcı reddetme hook'u
export const useRejectUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: number; reason?: string }): Promise<void> => {
      await api.put(`/admin/users/${userId}/status?status=REJECTED`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      toast.success('Kullanıcı reddedildi');
    },
    onError: () => {
      toast.error('Kullanıcı reddedilirken hata oluştu');
    },
  });
};

// Kullanıcı askıya alma hook'u
export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: number; reason?: string }): Promise<void> => {
      await api.put(`/admin/users/${userId}/status?status=SUSPENDED`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      toast.success('Kullanıcı askıya alındı');
    },
    onError: () => {
      toast.error('Kullanıcı askıya alınırken hata oluştu');
    },
  });
};

// Kullanıcı aktifleştirme hook'u
export const useActivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number): Promise<void> => {
      await api.put(`/admin/users/${userId}/status?status=ACTIVE`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      toast.success('Kullanıcı aktifleştirildi');
    },
    onError: () => {
      toast.error('Kullanıcı aktifleştirilirken hata oluştu');
    },
  });
};

// Kullanıcı silme hook'u
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number): Promise<void> => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      toast.success('Kullanıcı silindi');
    },
    onError: () => {
      toast.error('Kullanıcı silinirken hata oluştu');
    },
  });
};
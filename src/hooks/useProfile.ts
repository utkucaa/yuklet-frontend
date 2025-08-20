import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import type { UserProfile } from '@/types';
import toast from 'react-hot-toast';

export const useProfile = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<UserProfile> => {
      const response = await api.get('/users/profile');
      return response.data;
    },
    enabled: isAuthenticated,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setProfile } = useAuthStore();

  return useMutation({
    mutationFn: async (data: Partial<UserProfile>): Promise<UserProfile> => {
      const response = await api.put('/users/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      setProfile(data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profil başarıyla güncellendi!');
    },
    onError: () => {
      toast.error('Profil güncellenirken bir hata oluştu.');
    },
  });
};
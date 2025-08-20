import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

export interface Rating {
  id: number;
  ratedUserId: number;
  cargoRequestId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RatingStats {
  average: number;
  count: number;
}

export const useUserRatings = (userId: number) => {
  return useQuery({
    queryKey: ['ratings', 'user', userId],
    queryFn: async (): Promise<Rating[]> => {
      const response = await api.get(`/ratings/user/${userId}`);
      return response.data;
    },
  });
};

export const useMyRatings = () => {
  return useQuery({
    queryKey: ['ratings', 'my'],
    queryFn: async (): Promise<Rating[]> => {
      const response = await api.get('/ratings/my');
      return response.data;
    },
  });
};

export const useGivenRatings = () => {
  return useQuery({
    queryKey: ['ratings', 'given'],
    queryFn: async (): Promise<Rating[]> => {
      const response = await api.get('/ratings/given');
      return response.data;
    },
  });
};

export const useUserRatingStats = (userId: number) => {
  return useQuery({
    queryKey: ['ratings', 'user', userId, 'stats'],
    queryFn: async (): Promise<RatingStats> => {
      const [avgResponse, countResponse] = await Promise.all([
        api.get(`/ratings/user/${userId}/average`),
        api.get(`/ratings/user/${userId}/count`),
      ]);
      return {
        average: avgResponse.data,
        count: countResponse.data,
      };
    },
  });
};

export const useCreateRating = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      ratedUserId: number;
      cargoRequestId: number;
      rating: number;
      comment: string;
    }) => {
      const response = await api.post('/ratings', payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', 'user', data.ratedUserId] });
      queryClient.invalidateQueries({ queryKey: ['ratings', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['ratings', 'given'] });
      toast.success('Puanlama başarıyla gönderildi');
    },
    onError: () => {
      toast.error('Puanlama gönderilirken hata oluştu');
    },
  });
};

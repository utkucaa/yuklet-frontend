import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

export type EntityType = 'CARGO_REQUEST' | 'TRANSPORT_OFFER';

export interface Favorite {
  id: number;
  entityId: number;
  entityType: EntityType;
  createdAt: string;
}

export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async (): Promise<Favorite[]> => {
      const response = await api.get('/favorites');
      return response.data;
    },
  });
};

export const useFavoritesByType = (entityType: EntityType) => {
  return useQuery({
    queryKey: ['favorites', entityType],
    queryFn: async (): Promise<Favorite[]> => {
      const response = await api.get(`/favorites/type/${entityType}`);
      return response.data;
    },
  });
};

export const useCheckFavorite = (entityId: number, entityType: EntityType) => {
  return useQuery({
    queryKey: ['favorites', 'check', entityId, entityType],
    queryFn: async (): Promise<boolean> => {
      const response = await api.get(`/favorites/check?entityId=${entityId}&entityType=${entityType}`);
      return response.data;
    },
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entityId, entityType }: { entityId: number; entityType: EntityType }) => {
      const response = await api.post(`/favorites?entityId=${entityId}&entityType=${entityType}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Favorilere eklendi');
    },
    onError: () => {
      toast.error('Favorilere eklenirken hata oluştu');
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entityId, entityType }: { entityId: number; entityType: EntityType }) => {
      await api.delete(`/favorites?entityId=${entityId}&entityType=${entityType}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Favorilerden kaldırıldı');
    },
    onError: () => {
      toast.error('Favorilerden kaldırılırken hata oluştu');
    },
  });
};

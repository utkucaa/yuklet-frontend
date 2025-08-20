import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

export type VehicleType = 'TRUCK' | 'VAN' | 'TRAILER' | 'PICKUP';

export interface Vehicle {
  id: number;
  carrierId: number;
  vehicleType: VehicleType;
  plateNumber: string;
  maxWeightKg: number;
  hasCrane: boolean;
  hasTemperatureControl: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useMyVehicles = () => {
  return useQuery({
    queryKey: ['vehicles', 'my'],
    queryFn: async (): Promise<Vehicle[]> => {
      const response = await api.get('/vehicles/my');
      return response.data;
    },
  });
};

export const useCarrierVehicles = (carrierId: number) => {
  return useQuery({
    queryKey: ['vehicles', 'carrier', carrierId],
    queryFn: async (): Promise<Vehicle[]> => {
      const response = await api.get(`/vehicles/carrier/${carrierId}`);
      return response.data;
    },
  });
};

export const useVehicle = (vehicleId: number) => {
  return useQuery({
    queryKey: ['vehicles', vehicleId],
    queryFn: async (): Promise<Vehicle> => {
      const response = await api.get(`/vehicles/${vehicleId}`);
      return response.data;
    },
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      vehicleType: VehicleType;
      plateNumber: string;
      maxWeightKg: number;
      hasCrane: boolean;
      hasTemperatureControl: boolean;
    }) => {
      const response = await api.post('/vehicles', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'my'] });
      toast.success('Araç başarıyla eklendi');
    },
    onError: () => {
      toast.error('Araç eklenirken hata oluştu');
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: {
      id: number;
      vehicleType: VehicleType;
      plateNumber: string;
      maxWeightKg: number;
      hasCrane: boolean;
      hasTemperatureControl: boolean;
    }) => {
      const response = await api.put(`/vehicles/${id}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', data.id] });
      toast.success('Araç başarıyla güncellendi');
    },
    onError: () => {
      toast.error('Araç güncellenirken hata oluştu');
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicleId: number) => {
      await api.delete(`/vehicles/${vehicleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'my'] });
      toast.success('Araç başarıyla silindi');
    },
    onError: () => {
      toast.error('Araç silinirken hata oluştu');
    },
  });
};

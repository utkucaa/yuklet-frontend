import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

export type VerificationType = 'IDENTITY_DOCUMENT' | 'BUSINESS_LICENSE' | 'VEHICLE_REGISTRATION';

export interface Verification {
  id: number;
  userId: number;
  verificationType: VerificationType;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documentUrl?: string;
}

export const useMyVerifications = () => {
  return useQuery({
    queryKey: ['verification', 'my'],
    queryFn: async (): Promise<Verification[]> => {
      const response = await api.get('/verification/my');
      return response.data;
    },
  });
};

export const usePendingVerifications = () => {
  return useQuery({
    queryKey: ['verification', 'pending'],
    queryFn: async (): Promise<Verification[]> => {
      const response = await api.get('/verification/pending');
      return response.data;
    },
  });
};

export const useSubmitVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      verificationType: VerificationType;
      document: File;
    }) => {
      const formData = new FormData();
      formData.append('verificationType', payload.verificationType);
      formData.append('document', payload.document);
      
      const response = await api.post('/verification/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['verification', 'pending'] });
      toast.success('Doğrulama belgesi başarıyla gönderildi');
    },
    onError: () => {
      toast.error('Doğrulama belgesi gönderilirken hata oluştu');
    },
  });
};

export const useApproveVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (verificationId: number) => {
      const response = await api.put(`/verification/${verificationId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['verification', 'pending'] });
      toast.success('Doğrulama onaylandı');
    },
    onError: () => {
      toast.error('Doğrulama onaylanırken hata oluştu');
    },
  });
};

export const useRejectVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ verificationId, rejectionReason }: { verificationId: number; rejectionReason: string }) => {
      const response = await api.put(`/verification/${verificationId}/reject?rejectionReason=${encodeURIComponent(rejectionReason)}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['verification', 'pending'] });
      toast.success('Doğrulama reddedildi');
    },
    onError: () => {
      toast.error('Doğrulama reddedilirken hata oluştu');
    },
  });
};

export const useCheckVerification = (userId: number, verificationType: VerificationType) => {
  return useQuery({
    queryKey: ['verification', 'check', userId, verificationType],
    queryFn: async (): Promise<boolean> => {
      const response = await api.get(`/verification/check?userId=${userId}&verificationType=${verificationType}`);
      return response.data;
    },
  });
};

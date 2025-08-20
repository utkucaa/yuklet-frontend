import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

export type FileType = 'PROFILE_IMAGE' | 'IDENTITY_DOCUMENT' | 'VEHICLE_IMAGE' | 'CARGO_IMAGE';

export interface FileInfo {
  id: number;
  fileName: string;
  originalFileName: string;
  fileType: FileType;
  entityId: number;
  fileSize: number;
  mimeType: string;
  url: string;
  createdAt: string;
}

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      file: File;
      fileType: FileType;
      entityId: number;
    }) => {
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('fileType', payload.fileType);
      formData.append('entityId', payload.entityId.toString());
      
      const response = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Dosya başarıyla yüklendi');
    },
    onError: () => {
      toast.error('Dosya yüklenirken hata oluştu');
    },
  });
};

export const useEntityFiles = (entityId: number, fileType?: FileType) => {
  return useQuery({
    queryKey: ['files', 'entity', entityId, fileType],
    queryFn: async (): Promise<FileInfo[]> => {
      const params = fileType ? { fileType } : {};
      const response = await api.get(`/files/entity/${entityId}`, { params });
      return response.data;
    },
  });
};

export const useMyFiles = () => {
  return useQuery({
    queryKey: ['files', 'my'],
    queryFn: async (): Promise<FileInfo[]> => {
      const response = await api.get('/files/my');
      return response.data;
    },
  });
};

export const useFile = (fileId: number) => {
  return useQuery({
    queryKey: ['files', fileId],
    queryFn: async (): Promise<FileInfo> => {
      const response = await api.get(`/files/${fileId}`);
      return response.data;
    },
  });
};

export const useDownloadFile = () => {
  return useMutation({
    mutationFn: async (fileId: number) => {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    },
    onSuccess: (blob, fileId) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `file-${fileId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Dosya indiriliyor');
    },
    onError: () => {
      toast.error('Dosya indirilirken hata oluştu');
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: number) => {
      await api.delete(`/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Dosya başarıyla silindi');
    },
    onError: () => {
      toast.error('Dosya silinirken hata oluştu');
    },
  });
};

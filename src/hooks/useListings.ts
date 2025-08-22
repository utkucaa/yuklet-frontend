import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Listing, ListingResponse, SearchParams, UserProfile } from '@/types';
import toast from 'react-hot-toast';

function mapCargoToListing(cargo: any): Listing { // eslint-disable-line @typescript-eslint/no-explicit-any
  console.log('Raw cargo data:', cargo);
  const createdAt: string = cargo.createdAt || cargo.pickupDate || new Date().toISOString();
  const mapped: Listing = {
    id: cargo.id,
    type: 'LOAD' as const,
    title: cargo.title || `${cargo.pickupCity} → ${cargo.deliveryCity || 'Açık'}`,
    fromCity: cargo.pickupCity,
    toCity: cargo.deliveryCity,
    pickupDate: cargo.pickupDate,
    deliveryDate: cargo.deliveryDate,
    capacityTons: cargo.weightKg ? cargo.weightKg / 1000 : undefined,
    vehicleType: undefined,
    companyName: cargo.companyName,
    images: [],
    notes: cargo.description,
    createdAt,
    createdBy: cargo.createdBy || 0,
    isVerified: cargo.isVerified,
    isActive: cargo.status ? cargo.status !== 'CANCELLED' : true,
    contactPhone: cargo.contactPhone,
    createdByProfile: cargo.createdByProfile,
  };
  console.log('Mapped cargo listing:', mapped);
  return mapped;
}

function mapTransportOfferToListing(offer: any): Listing { // eslint-disable-line @typescript-eslint/no-explicit-any
  console.log('Raw transport offer data:', offer);
  const createdAt: string = offer.createdAt || offer.createdDate || offer.availableDate || new Date().toISOString();
  const mapped: Listing = {
    id: offer.id,
    type: 'CAPACITY' as const,
    title: offer.title || `Boş Kapasite: ${offer.fromCity} → ${offer.toCity || 'Açık'}`,
    fromCity: offer.fromCity,
    toCity: offer.toCity,
    pickupDate: offer.availableDate,
    capacityTons: offer.availableWeightKg ? offer.availableWeightKg / 1000 : undefined,
    vehicleType: offer.vehicleType,
    price: offer.suggestedPrice,
    currency: 'TRY',
    companyName: offer.companyName,
    images: [],
    notes: offer.description,
    createdAt,
    createdBy: offer.carrierId || offer.createdBy || 0,
    isVerified: offer.isVerified,
    isActive: offer.status ? offer.status !== 'CANCELLED' : true,
    contactPhone: offer.contactPhone,
    createdByProfile: offer.createdByProfile,
  };
  console.log('Mapped transport offer listing:', mapped);
  return mapped;
}

async function fetchUserProfile(userId: number): Promise<UserProfile | null> {
  const userEndpoints = [
    `/users/profile/${userId}`
  ];
  
  for (const userEndpoint of userEndpoints) {
    try {
      console.log('Trying user endpoint:', userEndpoint);
      const userResponse = await api.get(userEndpoint);
      console.log('User profile response:', userResponse.data);
      return userResponse.data;
    } catch (userError) {
      console.log('User endpoint failed:', userEndpoint, userError);
      continue;
    }
  }
  
  console.log('All user endpoints failed for ID:', userId);
  return null;
}

export const useListings = (params?: SearchParams) => {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: async (): Promise<ListingResponse> => {
      const activeType = params?.type || 'LOAD';
      if (activeType === 'LOAD') {
        const fromDate = params?.dateFrom ? `${params.dateFrom}T00:00:00` : undefined;
        const toDate = params?.dateTo ? `${params.dateTo}T23:59:59` : undefined;
        const query = {
          pickupCity: params?.fromCity,
          deliveryCity: params?.toCity,
          minWeight: params?.minCap ? params.minCap * 1000 : undefined,
          maxWeight: params?.maxCap ? params.maxCap * 1000 : undefined,
          minBudget: params?.minPrice,
          maxBudget: params?.maxPrice,
          fromDate,
          toDate,
          page: params?.page,
          size: params?.size,
        };
        const response = await api.get('/cargo/search', { params: query });
        const raw = response.data;
        const content: Listing[] = Array.isArray(raw?.content)
          ? raw.content.map(mapCargoToListing)
          : Array.isArray(raw)
            ? raw.map(mapCargoToListing)
            : [];
        return {
          content,
          totalElements: raw?.totalElements ?? content.length,
          totalPages: raw?.totalPages ?? 1,
          size: raw?.size ?? content.length,
          number: raw?.number ?? 0,
        };
      }

      const fromDate = params?.dateFrom ? `${params.dateFrom}T00:00:00` : undefined;
      const toDate = params?.dateTo ? `${params.dateTo}T23:59:59` : undefined;
      const query = {
        fromCity: params?.fromCity,
        toCity: params?.toCity,
        minWeight: params?.minCap ? params.minCap * 1000 : undefined,
        maxPrice: params?.maxPrice,
        fromDate,
        toDate,
        page: params?.page,
        size: params?.size,
      };
      const response = await api.get('/transport-offers/search', { params: query });
      const raw = response.data;
      const content: Listing[] = Array.isArray(raw?.content)
        ? raw.content.map(mapTransportOfferToListing)
        : Array.isArray(raw)
          ? raw.map(mapTransportOfferToListing)
          : [];
      return {
        content,
        totalElements: raw?.totalElements ?? content.length,
        totalPages: raw?.totalPages ?? 1,
        size: raw?.size ?? content.length,
        number: raw?.number ?? 0,
      };
    },
  });
};

export const useListing = (id: number) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async (): Promise<Listing> => {
      console.log('Fetching listing with ID:', id);
      
      const offerEndpoints = [
        `/transport-offers/${id}`  // cURL örneklerinde: /api/transport-offers/1 - DOĞRU ENDPOINT
      ];
      
      for (const endpoint of offerEndpoints) {
        try {
          console.log('Trying transport offer endpoint:', endpoint);
          const response = await api.get(endpoint);
          console.log('Transport offer response:', response.data);
          const listing = mapTransportOfferToListing(response.data);
          
          if (listing.createdBy && !listing.createdByProfile) {
            console.log('Fetching user profile for ID:', listing.createdBy);
            const userProfile = await fetchUserProfile(listing.createdBy);
            console.log('User profile result:', userProfile);
            if (userProfile) {
              listing.createdByProfile = userProfile;
              console.log('Updated listing with user profile:', listing.createdByProfile);
            } else {
              console.log('Failed to fetch user profile for ID:', listing.createdBy);
            }
          }
          
          return listing;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log('Transport offer endpoint failed:', endpoint, errorMessage);
          continue;
        }
      }
      
      const cargoEndpoints = [
        `/cargo/${id}`  // cURL örneklerinde: /api/cargo/1 - DOĞRU ENDPOINT
      ];
      
      for (const endpoint of cargoEndpoints) {
        try {
          console.log('Trying cargo endpoint:', endpoint);
          const response = await api.get(endpoint);
          console.log('Cargo response:', response.data);
          const listing = mapCargoToListing(response.data);
          
          if (listing.createdBy && !listing.createdByProfile) {
            console.log('Fetching user profile for ID:', listing.createdBy);
            const userProfile = await fetchUserProfile(listing.createdBy);
            console.log('User profile result:', userProfile);
            if (userProfile) {
              listing.createdByProfile = userProfile;
              console.log('Updated listing with user profile:', listing.createdByProfile);
            } else {
              console.log('Failed to fetch user profile for ID:', listing.createdBy);
            }
          }
          
          return listing;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log('Cargo endpoint failed:', endpoint, errorMessage);
          continue;
        }
      }
      

      
      throw new Error(`Listing not found with ID: ${id}`);
    },
  });
};

export const useCreateCargo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown): Promise<{ id: number }> => {
      const response = await api.post('/cargo', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Yük talebi oluşturuldu');
    },
    onError: () => {
      toast.error('Yük talebi oluşturulamadı');
    },
  });
};

export const useCreateTransportOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown): Promise<{ id: number }> => {
      const response = await api.post('/transport-offers', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Taşıma ilanı oluşturuldu');
    },
    onError: () => {
      toast.error('Taşıma ilanı oluşturulamadı');
    },
  });
};

    
export const useTransportOfferAction = (action: 'cancel' | 'complete') => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.put(`/transport-offers/${id}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success(`İlan ${action === 'cancel' ? 'iptal edildi' : 'tamamlandı'}`);
    },
  });
};

export const useCargoAction = (action: 'cancel' | 'complete') => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.put(`/cargo/${id}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success(`Yük ${action === 'cancel' ? 'iptal edildi' : 'tamamlandı'}`);
    },
  });
};

// İlan onaylama hook'u
export const useApproveListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, type }: { id: number; type: 'LOAD' | 'CAPACITY' }): Promise<void> => {
      // Admin API'leri kullanarak durum güncelleme
      const endpoint = type === 'LOAD' ? `/admin/cargo-requests/${id}/status?status=ACTIVE` : `/admin/transport-offers/${id}/status?status=ACTIVE`;
      await api.put(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['pending-listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      toast.success('İlan onaylandı');
    },
    onError: () => {
      toast.error('İlan onaylanırken hata oluştu');
    },
  });
};

// İlan reddetme hook'u
export const useRejectListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, type, reason }: { id: number; type: 'LOAD' | 'CAPACITY'; reason?: string }): Promise<void> => {
      // Admin API'leri kullanarak durum güncelleme
      const endpoint = type === 'LOAD' ? `/admin/cargo-requests/${id}/status?status=REJECTED` : `/admin/transport-offers/${id}/status?status=REJECTED`;
      await api.put(endpoint, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['pending-listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      toast.success('İlan reddedildi');
    },
    onError: () => {
      toast.error('İlan reddedilirken hata oluştu');
    },
  });
};

// İlan silme hook'u
export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, type }: { id: number; type: 'LOAD' | 'CAPACITY' }): Promise<void> => {
      // Admin API'leri kullanarak silme
      const endpoint = type === 'LOAD' ? `/admin/cargo-requests/${id}` : `/admin/transport-offers/${id}`;
      await api.delete(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['pending-listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      toast.success('İlan silindi');
    },
    onError: () => {
      toast.error('İlan silinirken hata oluştu');
    },
  });
};

// Bekleyen ilanları getirme hook'u
export const usePendingListings = () => {
  return useQuery({
    queryKey: ['pending-listings'],
    queryFn: async (): Promise<ListingResponse> => {
      try {
        // Admin API'lerini kullanarak bekleyen ilanları getir
        const [cargoResponse, transportResponse] = await Promise.all([
          api.get('/cargo/search', { params: { status: 'PENDING', size: 100 } }),
          api.get('/transport-offers/search', { params: { status: 'PENDING', size: 100 } })
        ]);

        const cargoListings = cargoResponse.data?.content?.map(mapCargoToListing) || [];
        const transportListings = transportResponse.data?.content?.map(mapTransportOfferToListing) || [];
        
        const allListings = [...cargoListings, ...transportListings];
        
        return {
          content: allListings,
          totalElements: allListings.length,
          totalPages: 1,
          size: allListings.length,
          number: 0,
        };
      } catch (error) {
        console.error('Bekleyen ilanlar getirilirken hata:', error);
        return {
          content: [],
          totalElements: 0,
          totalPages: 1,
          size: 0,
          number: 0,
        };
      }
    },
  });
};

// Admin için tüm ilanları getirme hook'u
export const useAdminAllListings = () => {
  return useQuery({
    queryKey: ['admin-listings'],
    queryFn: async (): Promise<ListingResponse> => {
      try {
        // Admin API'lerini kullanarak tüm ilanları getir
        const [cargoResponse, transportResponse] = await Promise.all([
          api.get('/admin/cargo-requests'),
          api.get('/admin/transport-offers')
        ]);

        const cargoListings = cargoResponse.data?.map(mapCargoToListing) || [];
        const transportListings = transportResponse.data?.map(mapTransportOfferToListing) || [];
        
        const allListings = [...cargoListings, ...transportListings];
        
        return {
          content: allListings,
          totalElements: allListings.length,
          totalPages: 1,
          size: allListings.length,
          number: 0,
        };
      } catch (error) {
        console.error('Admin ilanları getirilirken hata:', error);
        return {
          content: [],
          totalElements: 0,
          totalPages: 1,
          size: 0,
          number: 0,
        };
      }
    },
  });
};

// İlan durumu güncelleme hook'u
export const useUpdateListingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, type, status }: { id: number; type: 'LOAD' | 'CAPACITY'; status: string }): Promise<void> => {
      const endpoint = type === 'LOAD' ? `/admin/cargo-requests/${id}/status?status=${status}` : `/admin/transport-offers/${id}/status?status=${status}`;
      await api.put(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['pending-listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      toast.success('İlan durumu güncellendi');
    },
    onError: () => {
      toast.error('İlan durumu güncellenirken hata oluştu');
    },
  });
};

// Veritabanında olmayan ilanları silmek için yeni hook
export const useCleanupInvalidListings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<{ deletedCount: number; invalidIds: number[] }> => {
      try {
        // Önce tüm ilanları çek
        const cargoResponse = await api.get('/cargo/search', { params: { size: 1000 } });
        const transportResponse = await api.get('/transport-offers/search', { params: { size: 1000 } });
        
        const cargoListings = cargoResponse.data?.content || [];
        const transportListings = transportResponse.data?.content || [];
        
        const invalidIds: number[] = [];
        let deletedCount = 0;
        
        // Cargo ilanlarını kontrol et
        for (const cargo of cargoListings) {
          try {
            // Her ilanı tekrar kontrol et
            await api.get(`/cargo/${cargo.id}`);
          } catch (error) {
            // İlan bulunamadıysa silinecek listesine ekle
            invalidIds.push(cargo.id);
            try {
              await api.delete(`/cargo/${cargo.id}`);
              deletedCount++;
              console.log(`Geçersiz cargo ilanı silindi: ${cargo.id}`);
            } catch (deleteError) {
              console.error(`Cargo ilanı silinirken hata: ${cargo.id}`, deleteError);
            }
          }
        }
        
        // Transport offer ilanlarını kontrol et
        for (const transport of transportListings) {
          try {
            // Her ilanı tekrar kontrol et
            await api.get(`/transport-offers/${transport.id}`);
          } catch (error) {
            // İlan bulunamadıysa silinecek listesine ekle
            invalidIds.push(transport.id);
            try {
              await api.delete(`/transport-offers/${transport.id}`);
              deletedCount++;
              console.log(`Geçersiz transport offer ilanı silindi: ${transport.id}`);
            } catch (deleteError) {
              console.error(`Transport offer ilanı silinirken hata: ${transport.id}`, deleteError);
            }
          }
        }
        
        return { deletedCount, invalidIds };
      } catch (error) {
        console.error('İlan temizleme işlemi sırasında hata:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success(`${result.deletedCount} geçersiz ilan silindi`);
      console.log('Silinen geçersiz ilan ID\'leri:', result.invalidIds);
    },
    onError: (error) => {
      toast.error('İlan temizleme işlemi başarısız oldu');
      console.error('İlan temizleme hatası:', error);
    },
  });
};
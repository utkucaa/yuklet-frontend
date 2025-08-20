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
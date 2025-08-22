import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

// Admin istatistikleri için interface'ler
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalListings: number;
  activeListings: number;
  totalCargo: number;
  totalCapacity: number;
  monthlyRevenue: number;
  verifiedUsers: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  verifiedUsers: number;
  newUsersThisMonth: number;
  userTypes: {
    USER: number;
    CARRIER: number;
    ADMIN: number;
  };
}

export interface CargoStats {
  totalCargo: number;
  activeCargo: number;
  pendingCargo: number;
  completedCargo: number;
  cancelledCargo: number;
  averagePrice: number;
  totalWeight: number;
}

export interface TransportStats {
  totalOffers: number;
  activeOffers: number;
  pendingOffers: number;
  completedOffers: number;
  cancelledOffers: number;
  averagePrice: number;
  totalCapacity: number;
}

export interface RevenueStats {
  monthlyRevenue: number;
  totalRevenue: number;
  averageTransactionValue: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

// Dashboard istatistikleri
export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async (): Promise<AdminStats> => {
      const response = await api.get('/admin/stats/dashboard');
      return response.data;
    },
  });
};

// Platform genel bakış
export const useAdminOverviewStats = () => {
  return useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: async (): Promise<AdminStats> => {
      const response = await api.get('/admin/stats/overview');
      return response.data;
    },
  });
};

// Kullanıcı istatistikleri
export const useAdminUserStats = () => {
  return useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async (): Promise<UserStats> => {
      const response = await api.get('/admin/stats/users');
      return response.data;
    },
  });
};

// Yük istatistikleri
export const useAdminCargoStats = () => {
  return useQuery({
    queryKey: ['admin-cargo-stats'],
    queryFn: async (): Promise<CargoStats> => {
      const response = await api.get('/admin/stats/cargo');
      return response.data;
    },
  });
};

// Taşıma istatistikleri
export const useAdminTransportStats = () => {
  return useQuery({
    queryKey: ['admin-transport-stats'],
    queryFn: async (): Promise<TransportStats> => {
      const response = await api.get('/admin/stats/transport');
      return response.data;
    },
  });
};

// Gelir istatistikleri
export const useAdminRevenueStats = () => {
  return useQuery({
    queryKey: ['admin-revenue-stats'],
    queryFn: async (): Promise<RevenueStats> => {
      const response = await api.get('/admin/stats/revenue');
      return response.data;
    },
  });
};

// Sistem sağlığı
export const useAdminSystemHealth = () => {
  return useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async (): Promise<{ status: string; uptime: number; version: string }> => {
      const response = await api.get('/admin/system/health');
      return response.data;
    },
  });
};

// Günlük rapor
export const useAdminDailyReport = () => {
  return useQuery({
    queryKey: ['admin-daily-report'],
    queryFn: async (): Promise<any> => {
      const response = await api.get('/admin/reports/daily');
      return response.data;
    },
  });
};

// Aylık rapor
export const useAdminMonthlyReport = () => {
  return useQuery({
    queryKey: ['admin-monthly-report'],
    queryFn: async (): Promise<any> => {
      const response = await api.get('/admin/reports/monthly');
      return response.data;
    },
  });
};

// Kullanıcı raporu
export const useAdminUserReport = () => {
  return useQuery({
    queryKey: ['admin-user-report'],
    queryFn: async (): Promise<any> => {
      const response = await api.get('/admin/reports/users');
      return response.data;
    },
  });
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import type { AuthResponse, User, UserProfile } from '@/types';
import toast from 'react-hot-toast';

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  userType: 'SHIPPER' | 'CARRIER';
  phone?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  city?: string;
}

export const useAuth = () => {
  const { setAuth, logout, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const normalizeUser = (raw: any): User => {
    const roleFromBackend = raw?.role || raw?.userType;
    const createdAt = raw?.createdAt || raw?.created_date || new Date().toISOString();
    return {
      id: Number(raw?.id ?? raw?.userId),
      email: String(raw?.email || ''),
      role: roleFromBackend as User['role'],
      createdAt: String(createdAt),
    };
  };

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData): Promise<AuthResponse> => {
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    onSuccess: async (data) => {
      try {
        if (data.user && data.token) {
          const user = normalizeUser(data.user);
          setAuth(user, data.profile || null, data.token);
        } else if (data.token) {
          localStorage.setItem('auth-token', data.token);
          const me = await api.get('/users/me');
          const user = normalizeUser(me.data);
          setAuth(user, null, data.token);
        }
        toast.success('Başarıyla giriş yaptınız!');
        queryClient.invalidateQueries({ queryKey: ['user'] });
      } catch {
        toast.error('Giriş sonrası kullanıcı bilgileri alınamadı.');
      }
    },
    onError: () => {
      toast.error('Giriş yapılırken bir hata oluştu.');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: async (data) => {
      try {
        if (data.user && data.token) {
          const user = normalizeUser(data.user);
          setAuth(user, data.profile || null, data.token);
        } else if (data.token) {
          localStorage.setItem('auth-token', data.token);
          const me = await api.get('/users/me');
          const user = normalizeUser(me.data);
          setAuth(user, null, data.token);
        }
        toast.success('Başarıyla kayıt oldunuz!');
        queryClient.invalidateQueries({ queryKey: ['user'] });
      } catch {
        toast.error('Kayıt sonrası kullanıcı bilgileri alınamadı.');
      }
    },
    onError: () => {
      toast.error('Kayıt olurken bir hata oluştu.');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Some backends may not provide a logout endpoint; ensure client-side logout
      return Promise.resolve();
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Başarıyla çıkış yaptınız.');
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User> => {
      const response = await api.get('/users/me');
      return normalizeUser(response.data);
    },
    enabled: isAuthenticated,
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    currentUser,
    isAuthenticated,
    // Demo login helper for local development without backend
    loginDemo: (role: 'SHIPPER' | 'CARRIER') => {
      const now = new Date().toISOString();
      const user: User = {
        id: role === 'CARRIER' ? 200 : 100,
        email: role === 'CARRIER' ? 'carrier@demo.com' : 'shipper@demo.com',
        role,
        createdAt: now,
      };
      const profile: UserProfile = {
        id: role === 'CARRIER' ? 2 : 1,
        userId: user.id,
        firstName: role === 'CARRIER' ? 'Demo' : 'Demo',
        lastName: role === 'CARRIER' ? 'Nakliyeci' : 'Yük Sahibi',
        companyName: role === 'CARRIER' ? 'Demo Nakliyat' : undefined,
        city: 'İstanbul',
        phoneNumber: '+90 555 000 0000',
        isVerified: true,
      };
      setAuth(user, profile, 'demo-token');
      toast.success('Demo olarak giriş yapıldı');
    },
  };
};
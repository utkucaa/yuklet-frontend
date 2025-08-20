import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserProfile } from '@/types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, profile: UserProfile | null, token: string) => void;
  setProfile: (profile: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, profile, token) => {
        localStorage.setItem('auth-token', token);
        set({ user, profile, token, isAuthenticated: true });
      },
      setProfile: (profile) => set({ profile }),
      logout: () => {
        localStorage.removeItem('auth-token');
        set({ user: null, profile: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
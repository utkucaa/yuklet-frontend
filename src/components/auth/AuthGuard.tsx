import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/types';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: Role;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/login',
}: AuthGuardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
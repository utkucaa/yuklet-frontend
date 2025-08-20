import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { queryClient } from '@/lib/queryClient';
import i18n from '@/lib/i18n';
import { router } from '@/routes';

interface AppProvidersProps {
  children?: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        {children || <RouterProvider router={router} />}
      </I18nextProvider>
    </QueryClientProvider>
  );
}
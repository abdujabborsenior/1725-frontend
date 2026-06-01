'use client';

import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/auth.store';

function AuthHydrator() {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator />
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(26, 23, 64, 0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            fontSize: '14px',
            backdropFilter: 'blur(20px)',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#00f5a0', secondary: '#0f0c29' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#0f0c29' } },
          duration: 3000,
        }}
      />
    </QueryClientProvider>
  );
}

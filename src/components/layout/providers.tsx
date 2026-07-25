'use client';

import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/auth.store';
import { usersApi } from '@/lib/api';

function AuthHydrator() {
  useEffect(() => {
    const store = useAuthStore.getState();
    store.hydrate();
    // To'liq, yangilangan profil (avatar/username/sanoqlar) ni olib kelamiz
    if (useAuthStore.getState().token) {
      usersApi
        .me()
        .then((u) => useAuthStore.getState().setUser(u))
        .catch(() => undefined);
    }
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
          // iOS banner: och material sirt, to'q matn, chuqur yumshoq soya
          style: {
            background: 'rgba(255, 255, 255, 0.86)',
            color: '#1D1D1F',
            borderRadius: '16px',
            fontSize: '15px',
            fontWeight: 500,
            letterSpacing: '-0.015em',
            backdropFilter: 'saturate(180%) blur(24px)',
            WebkitBackdropFilter: 'saturate(180%) blur(24px)',
            boxShadow: '0 12px 40px -8px rgba(0,0,0,0.22)',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#34C759', secondary: '#FFFFFF' } },
          error: { iconTheme: { primary: '#FF3B30', secondary: '#FFFFFF' } },
          duration: 3000,
        }}
      />
    </QueryClientProvider>
  );
}

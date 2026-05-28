'use client';

import { create } from 'zustand';
import type { AuthState, User } from '@/types';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 kun

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('sh_token') : null,
  user: typeof window !== 'undefined'
    ? (() => {
        try {
          const u = localStorage.getItem('sh_user');
          return u ? (JSON.parse(u) as User) : null;
        } catch { return null; }
      })()
    : null,
  pendingEmail: typeof window !== 'undefined'
    ? sessionStorage.getItem('sh_pending_email')
    : null,

  setAuth: (token, user) => {
    localStorage.setItem('sh_token', token);
    localStorage.setItem('sh_user', JSON.stringify(user));
    setCookie('sh_token', token);
    set({ token, user });
  },

  setPendingEmail: (email) => {
    sessionStorage.setItem('sh_pending_email', email);
    set({ pendingEmail: email });
  },

  clearAuth: () => {
    localStorage.removeItem('sh_token');
    localStorage.removeItem('sh_user');
    sessionStorage.removeItem('sh_pending_email');
    deleteCookie('sh_token');
    set({ token: null, user: null, pendingEmail: null });
  },
}));

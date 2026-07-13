'use client';

import { create } from 'zustand';
import type { AuthState, User } from '@/types';
import { STORAGE } from '@/lib/constants';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 kun

// HTTPS'da Secure bayrog'i (lib/api.ts persistTokens bilan izchil).
function cookieSecure(): string {
  return typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? '; Secure'
    : '';
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${cookieSecure()}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${cookieSecure()}`;
}

/**
 * Initial state is always null on both server and client to avoid SSR
 * hydration mismatch. The real auth state is loaded from storage in
 * `hydrate()`, called once from <Providers> via useEffect.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  pendingEmail: null,
  hasHydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined' || get().hasHydrated) return;
    const token = localStorage.getItem(STORAGE.token);
    const refreshToken = localStorage.getItem(STORAGE.refresh);
    const userRaw = localStorage.getItem(STORAGE.user);
    const pendingEmail = sessionStorage.getItem(STORAGE.pendingEmail);
    let user: User | null = null;
    try { user = userRaw ? (JSON.parse(userRaw) as User) : null; } catch { /* ignore */ }
    // Sinxronlash (ikkala yo'nalishda o'z-o'zini davolaydi):
    // — sessiya yo'q (localStorage bo'sh), lekin eski cookie qolgan → o'chiramiz
    //   (aks holda middleware guest'ni auth sahifalaridan '/'ga qulflaydi);
    // — sessiya BOR, lekin cookie yo'qolgan/o'chirilgan → qayta o'rnatamiz
    //   (aks holda middleware kirgan foydalanuvchini register'ga otadi).
    if (!token) deleteCookie(STORAGE.token);
    else setCookie(STORAGE.token, token);
    set({ token, refreshToken, user, pendingEmail, hasHydrated: true });
  },

  setAuth: (token, refreshToken, user) => {
    localStorage.setItem(STORAGE.token, token);
    localStorage.setItem(STORAGE.refresh, refreshToken);
    localStorage.setItem(STORAGE.user, JSON.stringify(user));
    setCookie(STORAGE.token, token);
    set({ token, refreshToken, user, hasHydrated: true });
  },

  setTokens: (token, refreshToken) => {
    localStorage.setItem(STORAGE.token, token);
    localStorage.setItem(STORAGE.refresh, refreshToken);
    setCookie(STORAGE.token, token);
    set({ token, refreshToken });
  },

  setUser: (user) => {
    localStorage.setItem(STORAGE.user, JSON.stringify(user));
    set({ user });
  },

  setPendingEmail: (email) => {
    sessionStorage.setItem(STORAGE.pendingEmail, email);
    set({ pendingEmail: email });
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE.token);
    localStorage.removeItem(STORAGE.refresh);
    localStorage.removeItem(STORAGE.user);
    sessionStorage.removeItem(STORAGE.pendingEmail);
    deleteCookie(STORAGE.token);
    set({ token: null, refreshToken: null, user: null, pendingEmail: null });
  },
}));

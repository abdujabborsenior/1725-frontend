'use client';

import { create } from 'zustand';
import type { AuthState, User } from '@/types';
import { STORAGE } from '@/lib/constants';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 kun

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
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

'use client';

import { io, type Socket } from 'socket.io-client';
import { API_URL, STORAGE } from './constants';
import { currentLocale } from './api';

/** API_URL "http://host/api" → WS bazaviy "http://host" */
const WS_BASE = API_URL.replace(/\/api\/?$/, '');

let socket: Socket | null = null;

function currentToken(): string | null {
  return typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE.token)
    : null;
}

/** Chat socket'ini olish (kerak bo'lsa yaratadi). */
export function getSocket(): Socket {
  if (socket) return socket;
  socket = io(`${WS_BASE}/chat`, {
    // `lang` — server xato matnlarini shu tilda qaytaradi (handshake'dagi
    // Accept-Language'ni brauzer o'zi qo'yadi — u interfeys tili emas)
    auth: { token: currentToken(), lang: currentLocale() },
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
    reconnectionDelayMax: 5000,
  });
  return socket;
}

/** Token yangilanganda (login/refresh) qayta ulanish. */
export function refreshSocketAuth(): void {
  if (!socket) return;
  socket.auth = { token: currentToken(), lang: currentLocale() };
  socket.disconnect().connect();
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

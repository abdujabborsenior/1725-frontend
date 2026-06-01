import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_URL, STORAGE } from './constants';
import type {
  ApiEnvelope,
  ApiErrorBody,
  Comment,
  LoginResponse,
  PaginatedResponse,
  Problem,
  Solution,
  SolutionStatus,
  TokenRefreshResponse,
  User,
} from '@/types';

/* ── Axios instance ───────────────────────────────────────────── */
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', 'Accept-Language': 'uz' },
  withCredentials: true,
});

function getToken() {
  return typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE.token)
    : null;
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── Silent refresh ───────────────────────────────────────────── */
function persistTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(STORAGE.token, accessToken);
  localStorage.setItem(STORAGE.refresh, refreshToken);
  document.cookie = `${STORAGE.token}=${accessToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

function forceLogout() {
  localStorage.removeItem(STORAGE.token);
  localStorage.removeItem(STORAGE.refresh);
  localStorage.removeItem(STORAGE.user);
  document.cookie = `${STORAGE.token}=; path=/; max-age=0`;
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken =
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE.refresh) : null;
  if (!refreshToken) throw new Error('No refresh token');

  // Bare client — no interceptors, avoids recursion.
  const res = await axios.post<ApiEnvelope<TokenRefreshResponse>>(
    `${API_URL}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
  );
  const { accessToken, refreshToken: newRefresh } = res.data.data;
  persistTokens(accessToken, newRefresh);
  return accessToken;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const url = original?.url ?? '';
    const isAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/register');

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthRoute &&
      typeof window !== 'undefined' &&
      localStorage.getItem(STORAGE.refresh)
    ) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        forceLogout();
        return Promise.reject(error);
      }
    }

    if (status === 401 && typeof window !== 'undefined' && !isAuthRoute) {
      forceLogout();
    }

    return Promise.reject(error);
  },
);

/* ── Helpers ──────────────────────────────────────────────────── */
async function unwrap<T>(p: Promise<AxiosResponse<ApiEnvelope<T>>>): Promise<T> {
  const res = await p;
  return res.data.data;
}

export function getErrorMessage(err: unknown, fallback = 'Xatolik yuz berdi'): string {
  const body = (err as AxiosError<ApiErrorBody>)?.response?.data;
  return body?.error?.message ?? fallback;
}

/* ── Auth ─────────────────────────────────────────────────────── */
type OtpType = 'email_verification' | 'password_reset';

export const authApi = {
  login: (email: string, password: string) =>
    unwrap<LoginResponse>(api.post('/auth/login', { email, password })),

  register: (data: Record<string, unknown>) =>
    unwrap<{ message: string }>(api.post('/auth/register', data)),
  registerSchool: (data: Record<string, unknown>) =>
    unwrap<{ message: string }>(api.post('/auth/register/school', data)),
  registerUniversity: (data: Record<string, unknown>) =>
    unwrap<{ message: string }>(api.post('/auth/register/university', data)),

  verifyOtp: (email: string, code: string, type: OtpType = 'email_verification') =>
    unwrap<{ message: string }>(api.post('/auth/verify-otp', { email, code, type })),
  resendOtp: (email: string, type: OtpType = 'email_verification') =>
    unwrap<{ message: string }>(api.post('/auth/resend-otp', { email, type })),

  forgotPassword: (email: string) =>
    unwrap<{ message: string }>(api.post('/auth/forgot-password', { email })),
  resetPassword: (data: {
    email: string;
    code: string;
    newPassword: string;
    confirmPassword: string;
  }) => unwrap<{ message: string }>(api.post('/auth/reset-password', data)),

  logout: (refreshToken: string | null) =>
    api.post('/auth/logout', { refreshToken }),
  deleteAccount: () => unwrap<{ message: string }>(api.delete('/auth/me')),
};

/* ── Problems ─────────────────────────────────────────────────── */
export const problemsApi = {
  list: (params?: Record<string, unknown>) =>
    unwrap<PaginatedResponse<Problem>>(api.get('/problems', { params })),
  my: (params?: Record<string, unknown>) =>
    unwrap<PaginatedResponse<Problem>>(api.get('/problems/my', { params })),
  findOne: (id: string) => unwrap<Problem>(api.get(`/problems/${id}`)),
  create: (data: {
    title: string;
    description: string;
    category?: string;
    imageUrls?: string[];
    videoUrls?: string[];
  }) => unwrap<{ data: Problem; message: string }>(api.post('/problems', data)),
};

/* ── Comments ─────────────────────────────────────────────────── */
export const commentsApi = {
  list: (problemId: string, params?: Record<string, unknown>) =>
    unwrap<PaginatedResponse<Comment>>(
      api.get(`/problems/${problemId}/comments`, { params }),
    ),
  create: (problemId: string, data: { content: string; links?: string[] }) =>
    unwrap<{ data: Comment; message: string }>(
      api.post(`/problems/${problemId}/comments`, data),
    ),
  remove: (problemId: string, id: string) =>
    api.delete(`/problems/${problemId}/comments/${id}`),
};

/* ── Solutions ────────────────────────────────────────────────── */
export const solutionsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: SolutionStatus;
    problemId?: string;
  }) => unwrap<PaginatedResponse<Solution>>(api.get('/solutions', { params })),
  findOne: (id: string) => unwrap<Solution>(api.get(`/solutions/${id}`)),
  submit: (data: {
    problemId: string;
    fullName: string;
    content: string;
    presentationUrl?: string;
    videoUrl?: string;
  }) => unwrap<{ data: Solution; message: string }>(api.post('/solutions', data)),
};

/* ── Profile (no dedicated /me endpoint — user comes from login) ── */
export const profileApi = {
  myProblems: (params?: Record<string, unknown>) =>
    unwrap<PaginatedResponse<Problem>>(api.get('/problems/my', { params })),
  mySolutions: (params?: Record<string, unknown>) =>
    unwrap<PaginatedResponse<Solution>>(api.get('/solutions', { params })),
};

export type { User };

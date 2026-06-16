import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_URL, STORAGE } from './constants';
import type {
  ApiEnvelope,
  ApiErrorBody,
  AppNotification,
  CategoryCount,
  ChatMessage,
  Comment,
  Conversation,
  LinkPreview,
  LoginResponse,
  PaginatedResponse,
  PlatformType,
  Poll,
  Problem,
  ProblemStatus,
  PublicGroup,
  PublicProfile,
  PublicUserCard,
  Solution,
  SolutionStatus,
  Startup,
  StartupReview,
  StartupSort,
  StartupStatus,
  StartupVisibility,
  TokenRefreshResponse,
  UploadResult,
  User,
  UserRole,
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

function clearAuthCookie() {
  // Ishonchli o'chirish — max-age=0 + expires (o'tmish). path=/ bilan mos.
  const past = 'Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `${STORAGE.token}=; path=/; max-age=0; expires=${past}; SameSite=Lax`;
}

/** Sessiya o'lganda chiqarish — loop-guard bilan (5s ichida ko'pi bilan 1 navigatsiya). */
function forceLogout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE.token);
  localStorage.removeItem(STORAGE.refresh);
  localStorage.removeItem(STORAGE.user);
  clearAuthCookie();

  if (window.location.pathname.startsWith('/login')) return;

  // Loop-breaker: oxirgi 5 soniyada chiqarilgan bo'lsa, qayta navigatsiya qilmaymiz.
  try {
    const last = Number(sessionStorage.getItem('sh_logout_at') ?? '0');
    if (Date.now() - last < 5000) return;
    sessionStorage.setItem('sh_logout_at', String(Date.now()));
  } catch {
    /* sessionStorage mavjud bo'lmasligi mumkin */
  }
  window.location.replace('/login');
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
    // Ilova yuklanishidagi profil yangilash (best-effort) — muvaffaqiyatsiz
    // bo'lsa ham majburiy chiqarish/reload qilinmaydi (loop oldini olish).
    const isSilent = url.includes('/users/me');

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
        if (!isSilent) forceLogout();
        return Promise.reject(error);
      }
    }

    if (status === 401 && typeof window !== 'undefined' && !isAuthRoute && !isSilent) {
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

  toggleLike: (id: string) =>
    unwrap<{ liked: boolean; likeCount: number }>(api.post(`/problems/${id}/like`)),

  // Admin moderation
  approve: (id: string) =>
    unwrap<{ message: string }>(api.patch(`/problems/${id}/approve`)),
  reject: (id: string, note?: string) =>
    unwrap<{ message: string }>(api.patch(`/problems/${id}/reject`, { note })),
  updateStatus: (id: string, status: ProblemStatus, analyzerNote?: string) =>
    unwrap<{ message: string }>(
      api.patch(`/problems/${id}/status`, { status, analyzerNote }),
    ),
  assignAnalyzer: (id: string, analyzerId: string) =>
    unwrap<{ message: string }>(api.patch(`/problems/${id}/assign`, { analyzerId })),
  remove: (id: string) =>
    unwrap<{ message: string }>(api.delete(`/problems/${id}`)),
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
  my: (params?: { page?: number; limit?: number; status?: SolutionStatus }) =>
    unwrap<PaginatedResponse<Solution>>(api.get('/solutions/my', { params })),
  submit: (data: {
    problemId: string;
    fullName: string;
    content: string;
    presentationUrl?: string;
    videoUrl?: string;
  }) => unwrap<{ data: Solution; message: string }>(api.post('/solutions', data)),
  updateStatus: (id: string, status: SolutionStatus, analyzerNote?: string) =>
    unwrap<{ message: string }>(
      api.patch(`/solutions/${id}/status`, { status, analyzerNote }),
    ),
};

/* ── Startups ─────────────────────────────────────────────────── */
export interface StartupListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  platform?: PlatformType;
  featured?: boolean;
  status?: StartupStatus;
  sort?: StartupSort;
  userId?: string;
}

export interface StartupPayload {
  title: string;
  tagline?: string;
  description: string;
  coverUrl?: string | null;
  logoUrl?: string | null;
  videoUrl?: string | null;
  screenshots?: string[];
  category?: string | null;
  tags?: string[];
  platforms?: { type: PlatformType; url: string; label?: string; iconUrl?: string }[];
  status?: StartupStatus;
  visibility?: StartupVisibility;
  allowedViewerIds?: string[];
  isFeatured?: boolean;
  sortOrder?: number;
  foundedYear?: number | null;
  teamName?: string | null;
}

export const startupsApi = {
  list: (params?: StartupListParams) =>
    unwrap<PaginatedResponse<Startup>>(api.get('/startups', { params })),
  findOne: (idOrSlug: string) =>
    unwrap<Startup>(api.get(`/startups/${idOrSlug}`)),
  related: (idOrSlug: string) =>
    unwrap<Startup[]>(api.get(`/startups/${idOrSlug}/related`)),
  categories: () => unwrap<CategoryCount[]>(api.get('/startups/categories')),
  registerClick: (id: string) => api.post(`/startups/${id}/click`),

  // Engagement (auth)
  toggleLike: (id: string) =>
    unwrap<{ liked: boolean; likeCount: number }>(api.post(`/startups/${id}/like`)),
  toggleBookmark: (id: string) =>
    unwrap<{ bookmarked: boolean }>(api.post(`/startups/${id}/bookmark`)),
  myBookmarks: (params?: { page?: number; limit?: number }) =>
    unwrap<PaginatedResponse<Startup>>(api.get('/startups/me/bookmarks', { params })),

  // Admin
  create: (data: StartupPayload) =>
    unwrap<{ data: Startup; message: string }>(api.post('/startups', data)),
  update: (id: string, data: Partial<StartupPayload>) =>
    unwrap<{ data: Startup; message: string }>(
      api.patch(`/startups/${id}`, data),
    ),
  setStatus: (id: string, status: StartupStatus) =>
    unwrap<{ message: string }>(api.patch(`/startups/${id}/status`, { status })),
  remove: (id: string) =>
    unwrap<{ message: string }>(api.delete(`/startups/${id}`)),
  linkPreview: (url: string) =>
    unwrap<LinkPreview>(api.get('/startups/link-preview', { params: { url } })),

  // Reviews
  reviews: (idOrSlug: string, params?: { page?: number; limit?: number }) =>
    unwrap<PaginatedResponse<StartupReview>>(
      api.get(`/startups/${idOrSlug}/reviews`, { params }),
    ),
  myReview: (idOrSlug: string) =>
    unwrap<{ data: StartupReview | null }>(
      api.get(`/startups/${idOrSlug}/reviews/me`),
    ),
  submitReview: (id: string, data: { rating: number; comment?: string }) =>
    unwrap<{ data: StartupReview; message: string }>(
      api.post(`/startups/${id}/reviews`, data),
    ),
  deleteMyReview: (id: string) =>
    unwrap<{ message: string }>(api.delete(`/startups/${id}/reviews/me`)),

  // Admin reviews moderation
  adminReviews: (params?: { page?: number; limit?: number }) =>
    unwrap<PaginatedResponse<StartupReview>>(api.get('/admin/reviews', { params })),
  adminDeleteReview: (id: string) =>
    unwrap<{ message: string }>(api.delete(`/admin/reviews/${id}`)),

  // Private startup — ruxsat berilgan ko'ruvchilar (egasi/admin)
  viewers: (id: string) =>
    unwrap<(PublicUserCard & { addedAt: string })[]>(
      api.get(`/startups/${id}/viewers`),
    ),
  addViewer: (id: string, userId: string) =>
    unwrap<{ message: string }>(api.post(`/startups/${id}/viewers`, { userId })),
  removeViewer: (id: string, userId: string) =>
    unwrap<{ message: string }>(api.delete(`/startups/${id}/viewers/${userId}`)),
};

/* ── Polls (startaplar ovoz berish) ───────────────────────────── */
export const pollsApi = {
  list: () => unwrap<Poll[]>(api.get('/polls')),
  get: (id: string) => unwrap<Poll>(api.get(`/polls/${id}`)),
  vote: (id: string, optionId: string) =>
    unwrap<Poll>(api.post(`/polls/${id}/vote`, { optionId })),

  // Superadmin
  create: (data: {
    question: string;
    description?: string;
    startupIds: string[];
    endsAt?: string;
  }) => unwrap<Poll>(api.post('/polls', data)),
  addOption: (id: string, startupId: string) =>
    unwrap<Poll>(api.post(`/polls/${id}/options`, { startupId })),
  removeOption: (id: string, optionId: string) =>
    unwrap<Poll>(api.delete(`/polls/${id}/options/${optionId}`)),
  update: (id: string, data: { question?: string; description?: string; status?: string; endsAt?: string }) =>
    unwrap<Poll>(api.patch(`/polls/${id}`, data)),
  remove: (id: string) => unwrap<{ message: string }>(api.delete(`/polls/${id}`)),
};

/* ── Uploads ──────────────────────────────────────────────────── */
export const uploadsApi = {
  image: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return unwrap<UploadResult>(
      api.post('/uploads/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },
  images: (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return unwrap<{ files: UploadResult[] }>(
      api.post('/uploads/images', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },
};

/* ── Notifications ────────────────────────────────────────────── */
export const notificationsApi = {
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    unwrap<PaginatedResponse<AppNotification>>(
      api.get('/notifications', { params }),
    ),
  unreadCount: () =>
    unwrap<{ count: number }>(api.get('/notifications/unread-count')),
  markRead: (id: string) =>
    unwrap<{ success: boolean }>(api.patch(`/notifications/${id}/read`)),
  markAllRead: () =>
    unwrap<{ success: boolean }>(api.patch('/notifications/read-all')),
};

/* ── Statistics (Superadmin) ──────────────────────────────────── */
export interface StatsDashboard {
  userStats: {
    total: number;
    active: number;
    verified: number;
    byRole: Record<string, number>;
    newThisWeek: number;
    newThisMonth: number;
  };
  problemStats: {
    total: number;
    byStatus: Record<string, number>;
    newThisWeek: number;
    newThisMonth: number;
    totalViews: number;
    byCategory: { category: string; count: string }[];
  };
  solutionStats: {
    total: number;
    byStatus: Record<string, number>;
    newThisWeek: number;
    newThisMonth: number;
  };
  recentActivity: {
    recentUsers: { id: string; fullName: string; email: string; role: string; createdAt: string }[];
    recentProblems: { id: string; title: string; status: string; createdAt: string }[];
    recentSolutions: { id: string; fullName: string; status: string; createdAt: string }[];
  };
  topProblems: { id: string; title: string; status: string; viewCount: number; createdAt: string }[];
}

export interface GrowthPoint {
  date: string;
  count: string;
}
export interface GrowthChart {
  userGrowth: GrowthPoint[];
  problemGrowth: GrowthPoint[];
  solutionGrowth: GrowthPoint[];
}

export const statisticsApi = {
  dashboard: () => unwrap<StatsDashboard>(api.get('/statistics/dashboard')),
  growth: (days = 30) =>
    unwrap<GrowthChart>(api.get('/statistics/growth', { params: { days } })),
};

/* ── Users (admin + self profile) ─────────────────────────────── */
export const usersApi = {
  // Self
  me: () => unwrap<User>(api.get('/users/me')),
  updateProfile: (data: Partial<Pick<User,
    'fullName' | 'headline' | 'bio' | 'avatarUrl' | 'coverUrl' | 'links'
    | 'age' | 'region' | 'district' | 'school' | 'grade' | 'university' | 'course'
  >>) => unwrap<User>(api.patch('/users/me', data)),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    unwrap<{ message: string }>(api.patch('/users/me/change-password', data)),

  // ── Social: qidiruv, profil, follow ──
  search: (q: string, params?: { page?: number; limit?: number }) =>
    unwrap<PaginatedResponse<PublicUserCard>>(
      api.get('/users/search', { params: { q, ...params } }),
    ),
  suggestions: (limit = 8) =>
    unwrap<PublicUserCard[]>(api.get('/users/suggestions', { params: { limit } })),
  profile: (handle: string) =>
    unwrap<PublicProfile>(api.get(`/users/profile/${handle}`)),
  setUsername: (username: string) =>
    unwrap<User>(api.patch('/users/me/username', { username })),
  usernameAvailable: (username: string) =>
    unwrap<{ available: boolean; username: string }>(
      api.get('/users/username-available', { params: { username } }),
    ),
  follow: (id: string) =>
    unwrap<{ following: true; followerCount: number }>(
      api.post(`/users/${id}/follow`),
    ),
  unfollow: (id: string) =>
    unwrap<{ following: false; followerCount: number }>(
      api.delete(`/users/${id}/follow`),
    ),
  followers: (id: string, params?: { page?: number; limit?: number }) =>
    unwrap<PaginatedResponse<PublicUserCard>>(
      api.get(`/users/${id}/followers`, { params }),
    ),
  following: (id: string, params?: { page?: number; limit?: number }) =>
    unwrap<PaginatedResponse<PublicUserCard>>(
      api.get(`/users/${id}/following`, { params }),
    ),

  // Admin
  list: (params?: { page?: number; limit?: number; role?: UserRole; search?: string }) =>
    unwrap<PaginatedResponse<User>>(api.get('/users', { params })),
  updateRole: (id: string, role: UserRole) =>
    unwrap<User>(api.patch(`/users/${id}/role`, { role })),
  toggleActive: (id: string) =>
    unwrap<{ isActive: boolean }>(api.patch(`/users/${id}/toggle-active`)),
  analyzers: () => unwrap<User[]>(api.get('/users/analyzers')),
};

/* ── Chat ─────────────────────────────────────────────────────── */
export interface SendMessagePayload {
  type: ChatMessage['type'];
  content?: string;
  attachments?: ChatMessage['attachments'];
  replyToId?: string;
  clientId?: string;
}

export const chatApi = {
  conversations: () => unwrap<Conversation[]>(api.get('/chat/conversations')),
  conversation: (id: string) =>
    unwrap<Conversation>(api.get(`/chat/conversations/${id}`)),
  direct: (userId: string) =>
    unwrap<Conversation>(api.post('/chat/conversations/direct', { userId })),
  messages: (id: string, params?: { limit?: number; before?: string }) =>
    unwrap<{ data: ChatMessage[]; nextCursor: string | null }>(
      api.get(`/chat/conversations/${id}/messages`, { params }),
    ),
  send: (id: string, payload: SendMessagePayload) =>
    unwrap<ChatMessage>(api.post(`/chat/conversations/${id}/messages`, payload)),
  read: (id: string) =>
    unwrap<{ ok: true; readAt: string }>(api.post(`/chat/conversations/${id}/read`)),
  unreadCount: () => unwrap<{ count: number }>(api.get('/chat/unread-count')),

  // Groups
  publicGroups: (limit = 10) =>
    unwrap<PublicGroup[]>(api.get('/chat/groups/public', { params: { limit } })),
  allGroups: () =>
    unwrap<(PublicGroup & { isPublic: boolean; createdAt: string })[]>(
      api.get('/chat/groups/admin'),
    ),
  createGroup: (data: {
    title: string;
    description?: string;
    avatarUrl?: string;
    isPublic?: boolean;
    memberIds?: string[];
  }) => unwrap<Conversation>(api.post('/chat/groups', data)),
  joinGroup: (idOrSlug: string) =>
    unwrap<Conversation>(api.post(`/chat/groups/${idOrSlug}/join`)),
  deleteGroup: (id: string) =>
    unwrap<{ message: string }>(api.delete(`/chat/groups/${id}`)),

  // Media upload (any authed user)
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return unwrap<UploadResult>(
      api.post('/chat/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },
};

/* ── Profile ──────────────────────────────────────────────────── */
export const profileApi = {
  myProblems: (params?: Record<string, unknown>) =>
    unwrap<PaginatedResponse<Problem>>(api.get('/problems/my', { params })),
  mySolutions: (params?: Record<string, unknown>) =>
    unwrap<PaginatedResponse<Solution>>(api.get('/solutions/my', { params })),
};

export type { User };

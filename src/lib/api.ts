import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_URL, STORAGE } from './constants';
import type {
  AiDraft,
  AiSolveResult,
  AiStatus,
  ApiEnvelope,
  ApiErrorBody,
  AppNotification,
  BillingCheckout,
  BillingMe,
  BillingOrder,
  BillingPlan,
  BillingStatusInfo,
  PaymentProvider,
  CategoryCount,
  ChatMessage,
  Comment,
  Conversation,
  FounderEntry,
  LeaderboardPeriod,
  LeaderboardResponse,
  LinkMetadata,
  LinkPreview,
  LoginResponse,
  MessageType,
  PaginatedResponse,
  PlatformType,
  Poll,
  Problem,
  ProblemStatus,
  PublicGroup,
  PublicProfile,
  PublicUserCard,
  ReportReason,
  ReportTargetType,
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
  BusinessModel,
  StartupStage,
  VentureNeed,
  InvestorKind,
  InvestorMe,
  InvestorProfile,
  DealflowItem,
  MatchDetailResponse,
  IntroRequestItem,
  StartupInterest,
  StartupAssessment,
  MarketCluster,
  MarketClusterDetail,
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
// HTTPS'da cookie'ga `Secure` qo'shiladi (token http orqali sizib ketmasin).
// Lokal http://localhost'da Secure cookie o'rnatilmasligi uchun shartli.
const cookieSecure =
  typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? '; Secure'
    : '';

function persistTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(STORAGE.token, accessToken);
  localStorage.setItem(STORAGE.refresh, refreshToken);
  document.cookie = `${STORAGE.token}=${accessToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax${cookieSecure}`;
}

function clearAuthCookie() {
  // Ishonchli o'chirish — max-age=0 + expires (o'tmish). path=/ bilan mos.
  const past = 'Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `${STORAGE.token}=; path=/; max-age=0; expires=${past}; SameSite=Lax${cookieSecure}`;
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
  const message = body?.error?.message;
  if (!message) {
    // Tarmoq uzilishi — server javob bermagan (backend "xatolik" degani emas)
    if ((err as AxiosError)?.code === 'ERR_NETWORK') {
      return 'Internet aloqasi yo‘q. Ulanishni tekshirib, qayta urinib ko‘ring.';
    }
    return fallback;
  }
  // Ichki kod (masalan "AI_UPSTREAM") hech qachon ekranga chiqmasligi kerak:
  // backend uni tarjima qilishi shart, lekin bu — ikkinchi himoya qatlami
  // (eski server versiyasi yoki qoplanmagan modul bo'lsa ham).
  return isRawErrorCode(message) ? fallback : message;
}

/** FAQAT_KATTA_HARF_VA_PASTKI_CHIZIQ — odam uchun yozilmagan matn. */
function isRawErrorCode(message: string): boolean {
  return /^[A-Z][A-Z0-9_]{2,}$/.test(message.trim());
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

  // Email tasdiqlashда backend avto-login qiladi (token juftligi qaytadi) —
  // foydalanuvchi qayta parol kiritmasdan maqsad sahifasiga qaytadi.
  verifyOtp: (email: string, code: string, type: OtpType = 'email_verification') =>
    unwrap<{ message: string } & Partial<Omit<LoginResponse, 'message'>>>(
      api.post('/auth/verify-otp', { email, code, type }),
    ),
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

  /** `liked` — kutilayotgan YAKUNIY holat (idempotent). Berilmasa toggle. */
  toggleLike: (id: string, liked?: boolean) =>
    unwrap<{ liked: boolean; likeCount: number }>(
      api.post(`/problems/${id}/like`, liked === undefined ? {} : { liked }),
    ),

  // O'xshash muammolar (kategoriya + matn o'xshashligi, backend'da keshlangan)
  similar: (id: string, limit = 6) =>
    unwrap<Problem[]>(api.get(`/problems/${id}/similar`, { params: { limit } })),

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

/* ── Solutions (moderatsiyasiz — joylangan zahoti ko'rinadi) ──── */
export const solutionsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    problemId?: string;
  }) => unwrap<PaginatedResponse<Solution>>(api.get('/solutions', { params })),
  findOne: (id: string) => unwrap<Solution>(api.get(`/solutions/${id}`)),
  my: (params?: { page?: number; limit?: number }) =>
    unwrap<PaginatedResponse<Solution>>(api.get('/solutions/my', { params })),

  // "Foydali" toggle — bosilsa belgilaydi, qayta bosilsa qaytarib oladi
  toggleHelpful: (id: string, helpful?: boolean) =>
    unwrap<{ helpful: boolean; helpfulCount: number }>(
      api.post(
        `/solutions/${id}/helpful`,
        helpful === undefined ? {} : { helpful },
      ),
    ),
  submit: (data: {
    problemId: string;
    fullName: string;
    /** Startap biriktirilganda ixtiyoriy — aks holda majburiy (≥20 belgi) */
    content?: string;
    presentationUrl?: string;
    videoUrl?: string;
    /** O'z startapini yechim sifatida biriktirish (ixtiyoriy) */
    startupId?: string;
  }) => unwrap<{ data: Solution; message: string }>(api.post('/solutions', data)),
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

export interface LeaderboardParams {
  page?: number;
  limit?: number;
  period?: LeaderboardPeriod;
  category?: string;
  region?: string;
  minVotes?: number;
}

export interface StartupPayload {
  title: string;
  tagline?: string;
  description: string;
  coverUrl?: string | null;
  logoUrl?: string | null;
  videoUrl?: string | null;
  category?: string | null;
  region?: string | null;
  district?: string | null;
  tags?: string[];
  platforms?: { type: PlatformType; url: string; label?: string; iconUrl?: string }[];
  status?: StartupStatus;
  visibility?: StartupVisibility;
  allowedViewerIds?: string[];
  isFeatured?: boolean;
  sortOrder?: number;
  foundedYear?: number | null;
  teamName?: string | null;

  /* ── Investorlar uchun (IXTIYORIY) ────────────────────────── */
  stage?: StartupStage | null;
  businessModel?: BusinessModel | null;
  needs?: VentureNeed[];
  askAmountMin?: number | null;
  askAmountMax?: number | null;
  teamSize?: number | null;
  monthlyRevenue?: number | null;
  monthlyActiveUsers?: number | null;
  payingCustomers?: number | null;
  problemStatement?: string | null;
  targetAudience?: string | null;
  traction?: string | null;
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

  // Reyting taxtasi (IMDB uslubidagi Bayes vaznli reyting)
  leaderboard: (params?: LeaderboardParams) =>
    unwrap<LeaderboardResponse>(api.get('/startups/leaderboard', { params })),

  // Engagement (auth)
  /** `liked` — kutilayotgan YAKUNIY holat (idempotent). Berilmasa toggle. */
  toggleLike: (id: string, liked?: boolean) =>
    unwrap<{ liked: boolean; likeCount: number }>(
      api.post(`/startups/${id}/like`, liked === undefined ? {} : { liked }),
    ),
  toggleBookmark: (id: string, bookmarked?: boolean) =>
    unwrap<{ bookmarked: boolean }>(
      api.post(
        `/startups/${id}/bookmark`,
        bookmarked === undefined ? {} : { bookmarked },
      ),
    ),
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

  /**
   * Havoladan muqova va logoni avtomatik olish (App Store, Google Play,
   * Telegram, sayt). `needCover`/`needLogo` — maydon allaqachon to'ldirilgan
   * bo'lsa `false`: server o'sha rasmni bekorga yuklab olmaydi.
   */
  linkMetadata: (url: string, need: { cover: boolean; logo: boolean }) =>
    unwrap<LinkMetadata>(
      api.post('/startups/link-metadata', {
        url,
        needCover: need.cover,
        needLogo: need.logo,
      }),
    ),

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

/* ── Reports (shikoyatlar) ────────────────────────────────────── */
export const reportsApi = {
  create: (data: {
    targetType: ReportTargetType;
    targetId: string;
    reason: ReportReason;
    details?: string;
  }) => unwrap<{ data: { id: string }; message: string }>(api.post('/reports', data)),
  check: (targetType: ReportTargetType, targetId: string) =>
    unwrap<{ reported: boolean }>(
      api.get('/reports/check', { params: { targetType, targetId } }),
    ),
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
  /** Startap muqova videosi (mp4/webm, maks 50MB) */
  video: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return unwrap<UploadResult>(
      api.post('/uploads/video', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },
};

/* ── Yechim AI ────────────────────────────────────────────────── */
export const aiApi = {
  /** AI yoqilganmi + kunlik limitdan qanchasi qolgani (mehmon ham chaqira oladi) */
  status: () => unwrap<AiStatus>(api.get('/ai/status')),

  /** Muammoni yuborish — mos loyihalar + javob + (kerak bo'lsa) qoralama */
  solve: (question: string, source: 'text' | 'voice' = 'text') =>
    unwrap<AiSolveResult>(api.post('/ai/solve', { question, source })),

  /** Ovozli xabarni matnga o'girish (16kHz mono WAV — `wav-recorder.ts`) */
  transcribe: (blob: Blob) => {
    const form = new FormData();
    form.append('file', blob, 'voice.wav');
    return unwrap<{ text: string }>(
      api.post('/ai/transcribe', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },

  /** Foydalanuvchi tahrirlagan matnni qayta sayqallash (imlo + uslub) */
  polish: (text: string) => unwrap<AiDraft>(api.post('/ai/polish', { text })),

  /** Qoralamani muammo sifatida e'lon qilish (auth talab qilinadi) */
  publishProblem: (data: {
    queryId?: string;
    title: string;
    description: string;
    category?: string;
  }) =>
    unwrap<{ data: Problem; message: string }>(api.post('/ai/publish-problem', data)),

  feedback: (queryId: string, feedback: 'up' | 'down') =>
    unwrap<{ message: string }>(api.post(`/ai/${queryId}/feedback`, { feedback })),
};

/* ── Notifications ────────────────────────────────────────────── */
export const notificationsApi = {
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    unwrap<PaginatedResponse<AppNotification>>(
      api.get('/notifications', { params }),
    ),
  unreadCount: () =>
    unwrap<{ count: number }>(api.get('/notifications/unread-count')),
  getById: (id: string) =>
    unwrap<AppNotification>(api.get(`/notifications/${id}`)),
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

  // ── Asoschilar (Founder): liderbord + ovoz (toggle) ──
  foundersLeaderboard: (params?: { page?: number; limit?: number }) =>
    unwrap<PaginatedResponse<FounderEntry>>(
      api.get('/users/founders/leaderboard', { params }),
    ),
  /** `voted` — kutilayotgan YAKUNIY holat (idempotent). Berilmasa toggle. */
  toggleFounderVote: (id: string, voted?: boolean) =>
    unwrap<{ voted: boolean; voteCount: number }>(
      api.post(`/users/${id}/founder-vote`, voted === undefined ? {} : { voted }),
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
  editMessage: (messageId: string, content: string) =>
    unwrap<ChatMessage>(api.patch(`/chat/messages/${messageId}`, { content })),
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
  groupSearch: (q: string) =>
    unwrap<PublicGroup[]>(api.get('/chat/groups/search', { params: { q } })),
  groupByUsername: (username: string) =>
    unwrap<PublicGroup>(api.get(`/chat/groups/by-username/${username}`)),
  createGroup: (data: {
    title: string;
    description?: string;
    avatarUrl?: string;
    isPublic?: boolean;
    memberIds?: string[];
    username?: string;
    blockedMessageTypes?: MessageType[];
  }) => unwrap<Conversation>(api.post('/chat/groups', data)),
  joinGroup: (idOrSlug: string) =>
    unwrap<Conversation>(api.post(`/chat/groups/${idOrSlug}/join`)),
  leaveGroup: (idOrSlug: string) =>
    unwrap<{ ok: true }>(api.post(`/chat/groups/${idOrSlug}/leave`)),
  deleteGroup: (id: string) =>
    unwrap<{ message: string }>(api.delete(`/chat/groups/${id}`)),
  updateGroup: (
    id: string,
    data: {
      title?: string;
      description?: string;
      avatarUrl?: string;
      isPublic?: boolean;
      username?: string;
    },
  ) => unwrap<Conversation>(api.patch(`/chat/groups/${id}`, data)),
  setGroupRestrictions: (id: string, blockedMessageTypes: MessageType[]) =>
    unwrap<Conversation>(
      api.patch(`/chat/groups/${id}/restrictions`, { blockedMessageTypes }),
    ),

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

/* ── Obuna / to'lov (Payme) ───────────────────────────────────── */
/**
 * VAQTINCHA O'CHIQ bo'lim (`lib/billing.ts` → BILLING_ENABLED).
 * Backendда `BILLING_ENABLED=false` bo'lsa `billing` moduli umuman
 * yuklanmaydi va bu endpointlar 404 qaytaradi — shuning uchun `status()`
 * xatoni yutib, `enabled:false` deb qaytaradi (sahifa jimgina yashiriladi).
 */
export const billingApi = {
  status: async (): Promise<BillingStatusInfo> => {
    try {
      return await unwrap<BillingStatusInfo>(api.get('/billing/status'));
    } catch {
      return { enabled: false, providers: [], freeStartupLimit: 0 };
    }
  },

  /** Barcha faol tariflar (oylik + yillik) — ochiq, mehmon ham ko'radi */
  plans: () => unwrap<BillingPlan[]>(api.get('/billing/plans')),

  /** Joriy obuna + loyihalar limitidan foydalanish */
  me: () => unwrap<BillingMe>(api.get('/billing/me')),

  /**
   * To'lovni boshlash: server buyurtma (order) yaratadi va Payme checkout
   * havolasini qaytaradi. Summani MIJOZ yubormaydi — u serverda tarifdan
   * olinadi (narxni brauzerdan o'zgartirib bo'lmaydi).
   */
  checkout: (data: {
    planId: string;
    /** Berilmasa server sozlangan birinchi usulni tanlaydi */
    provider?: PaymentProvider;
    returnUrl?: string;
  }) =>
    unwrap<BillingCheckout>(api.post('/billing/checkout', data)),

  /** Bitta buyurtma holati — to'lovdan qaytgach shu so'rov bilan kuzatiladi */
  order: (id: string) => unwrap<BillingOrder>(api.get(`/billing/orders/${id}`)),

  /** To'lovlar tarixi */
  orders: (params?: { page?: number; limit?: number }) =>
    unwrap<PaginatedResponse<BillingOrder>>(api.get('/billing/orders', { params })),
};

/* ── Profile ──────────────────────────────────────────────────── */
export const profileApi = {
  myProblems: (params?: Record<string, unknown>) =>
    unwrap<PaginatedResponse<Problem>>(api.get('/problems/my', { params })),
  mySolutions: (params?: Record<string, unknown>) =>
    unwrap<PaginatedResponse<Solution>>(api.get('/solutions/my', { params })),
};

export type { User };


/* ══════════ Venture: investor tomoni ═════════════════════════ */

export interface InvestorProfilePayload {
  kind: InvestorKind;
  orgName?: string;
  website?: string;
  thesis?: string;
  categories?: string[];
  stages?: StartupStage[];
  regions?: string[];
  offers?: VentureNeed[];
  checkMin?: number;
  checkMax?: number;
  contactEmail?: string;
  contactPhone?: string;
  isActive?: boolean;
  alertsEnabled?: boolean;
}

export interface DealflowParams {
  page?: number;
  limit?: number;
  minScore?: number;
  onlyNew?: boolean;
  saved?: boolean;
}

export const investorsApi = {
  /** Profil bo'lmasa `profile: null` — frontend "ariza topshirish" ko'rsatadi. */
  me: () => unwrap<InvestorMe>(api.get('/investors/me')),
  upsert: (data: InvestorProfilePayload) =>
    unwrap<{ data: InvestorProfile; message: string }>(
      api.put('/investors/me', data),
    ),

  dealflow: (params?: DealflowParams) =>
    unwrap<PaginatedResponse<DealflowItem>>(
      api.get('/investors/dealflow', { params }),
    ),
  match: (startupId: string) =>
    unwrap<MatchDetailResponse>(api.get(`/investors/dealflow/${startupId}`)),

  save: (startupId: string, note?: string) =>
    unwrap<{ message: string }>(
      api.post(`/investors/saved/${startupId}`, { note }),
    ),
  unsave: (startupId: string) =>
    unwrap<{ message: string }>(api.delete(`/investors/saved/${startupId}`)),
  dismiss: (startupId: string, dismissed: boolean) =>
    unwrap<{ message: string }>(
      api.post(`/investors/dealflow/${startupId}/dismiss`, { dismissed }),
    ),

  sendIntro: (startupId: string, message: string) =>
    unwrap<{ data: IntroRequestItem; message: string }>(
      api.post('/investors/intro', { startupId, message }),
    ),
  sentIntros: (params?: { page?: number; limit?: number }) =>
    unwrap<PaginatedResponse<IntroRequestItem>>(
      api.get('/investors/intro/sent', { params }),
    ),
  withdrawIntro: (id: string) =>
    unwrap<{ message: string }>(api.delete(`/investors/intro/${id}`)),
};

/* ══════════ Venture: asoschi tomoni ══════════════════════════ */

export const founderApi = {
  introRequests: (params?: { page?: number; limit?: number }) =>
    unwrap<PaginatedResponse<IntroRequestItem>>(
      api.get('/founder/intro-requests', { params }),
    ),
  pendingCount: () =>
    unwrap<{ count: number }>(api.get('/founder/intro-requests/pending-count')),
  respondIntro: (id: string, accept: boolean) =>
    unwrap<{ data: IntroRequestItem; message: string }>(
      api.post(`/founder/intro-requests/${id}/respond`, { accept }),
    ),
  startupInterest: (startupId: string) =>
    unwrap<StartupInterest>(
      api.get(`/founder/startups/${startupId}/interest`),
    ),
};

/* ══════════ Venture: loyiha tahlili ══════════════════════════ */

export const assessmentApi = {
  get: (startupId: string) =>
    unwrap<StartupAssessment>(api.get(`/assessment/startups/${startupId}`)),
  refresh: (startupId: string) =>
    unwrap<StartupAssessment>(
      api.post(`/assessment/startups/${startupId}/refresh`),
    ),
  /** AI matnli tahlili — pullik chaqiruv, 6 soatda bir marta. */
  generateAi: (startupId: string) =>
    unwrap<StartupAssessment>(api.post(`/assessment/startups/${startupId}/ai`)),
};

/* ══════════ Venture: bozor xaritasi ══════════════════════════ */

export const marketApi = {
  clusters: (limit = 24) =>
    unwrap<MarketCluster[]>(api.get('/market/clusters', { params: { limit } })),
  cluster: (slug: string) =>
    unwrap<MarketClusterDetail>(api.get(`/market/clusters/${slug}`)),
};

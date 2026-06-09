export type UserRole =
  | 'superadmin' | 'analyzer' | 'school_student' | 'university_student' | 'user';

export type ProblemStatus =
  | 'pending' | 'open' | 'under_review' | 'resolved' | 'rejected';

export type SolutionStatus = 'pending' | 'accepted' | 'rejected';

export type StartupStatus = 'draft' | 'published' | 'archived';

export type PlatformType =
  | 'android' | 'ios' | 'website' | 'telegram_bot' | 'other';

export type StartupSort =
  | 'newest' | 'popular' | 'featured' | 'alphabetical' | 'top_rated';

/* ── API envelopes ────────────────────────────────────────────── */
export interface ApiEnvelope<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ApiErrorBody {
  success: false;
  error: { code: string; message: string };
  path: string;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/* ── Entities ─────────────────────────────────────────────────── */
export type PublicAuthor = Pick<User, 'id' | 'fullName' | 'role'>;

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  age: number | null;
  region: string | null;
  district: string | null;
  school: string | null;
  grade: number | null;
  university: string | null;
  course: number | null;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  links: string[];
  authorId: string | null;
  author: PublicAuthor | null;
  problemId: string;
  createdAt: string;
}

export interface Solution {
  id: string;
  fullName: string;
  content: string;
  presentationUrl: string | null;
  videoUrl: string | null;
  status: SolutionStatus;
  analyzerNote: string | null;
  problemId: string;
  submittedById: string | null;
  submittedBy: PublicAuthor | null;
  problem?: Pick<Problem, 'id' | 'title' | 'status'>;
  createdAt: string;
  updatedAt: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: string | null;
  imageUrls: string[];
  videoUrls: string[];
  status: ProblemStatus;
  submittedById: string | null;
  analyzerId: string | null;
  analyzerNote: string | null;
  viewCount: number;
  submittedBy: PublicAuthor | null;
  analyzer?: PublicAuthor | null;
  comments?: Comment[];
  solutions?: Solution[];
  createdAt: string;
  updatedAt: string;
}

/* ── Startups ─────────────────────────────────────────────────── */
export interface StartupPlatform {
  type: PlatformType;
  url: string;
  label?: string | null;
  iconUrl?: string | null;
}

export interface Startup {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string;
  coverUrl: string | null;
  logoUrl: string | null;
  screenshots: string[];
  category: string | null;
  tags: string[];
  platforms: StartupPlatform[];
  status: StartupStatus;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  clickCount: number;
  likeCount: number;
  bookmarkCount: number;
  ratingAvg: number;
  ratingCount: number;
  /** Joriy foydalanuvchi yoqtirganmi (auth bo'lsa) */
  likedByMe?: boolean;
  /** Joriy foydalanuvchi saqlaganmi (auth bo'lsa) */
  bookmarkedByMe?: boolean;
  foundedYear: number | null;
  teamName: string | null;
  createdById: string | null;
  createdBy?: PublicAuthor | null;
  createdAt: string;
  updatedAt: string;
}

export interface StartupReview {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  startupId: string;
  user?: PublicAuthor | null;
  startup?: Pick<Startup, 'id' | 'title' | 'slug' | 'logoUrl'> | null;
  createdAt: string;
  updatedAt: string;
}

export interface LinkPreview {
  url: string;
  detectedType: PlatformType;
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  siteName: string | null;
}

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

/* ── Notifications ────────────────────────────────────────────── */
export type NotificationType =
  | 'problem_approved'
  | 'problem_rejected'
  | 'solution_accepted'
  | 'solution_rejected'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

/* ── Auth ─────────────────────────────────────────────────────── */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  message: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  pendingEmail: string | null;
  hasHydrated: boolean;
  hydrate: () => void;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setPendingEmail: (email: string) => void;
  clearAuth: () => void;
}

export type RegisterType = 'user' | 'school' | 'university';

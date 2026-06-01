export type UserRole =
  | 'superadmin' | 'analyzer' | 'school_student' | 'university_student' | 'user';

export type ProblemStatus =
  | 'pending' | 'open' | 'under_review' | 'resolved' | 'rejected';

export type SolutionStatus = 'pending' | 'accepted' | 'rejected';

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

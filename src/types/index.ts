export type UserRole =
  | 'superadmin' | 'analyzer' | 'school_student' | 'university_student' | 'user';

export type ProblemStatus =
  | 'pending' | 'open' | 'under_review' | 'resolved' | 'rejected';

export type SolutionStatus = 'pending' | 'approved' | 'rejected';

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
  authorId: string;
  author: Pick<User, 'id' | 'fullName' | 'role'> | null;
  problemId: string;
  createdAt: string;
}

export interface Solution {
  id: string;
  fullName: string;
  email: string;
  content: string;
  links: string[];
  status: SolutionStatus;
  problemId: string;
  reviewNote: string | null;
  createdAt: string;
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
  submittedBy: Pick<User, 'id' | 'fullName' | 'role'> | null;
  comments?: Comment[];
  solutions?: Solution[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  pendingEmail: string | null;
  setAuth: (token: string, user: User) => void;
  setPendingEmail: (email: string) => void;
  clearAuth: () => void;
}

export type RegisterType = 'user' | 'school' | 'university';

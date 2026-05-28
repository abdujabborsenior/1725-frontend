import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', 'Accept-Language': 'uz' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sh_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('sh_token');
      localStorage.removeItem('sh_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login:              (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register:           (data: Record<string, unknown>) =>
    api.post('/auth/register', data),
  registerSchool:     (data: Record<string, unknown>) =>
    api.post('/auth/register/school', data),
  registerUniversity: (data: Record<string, unknown>) =>
    api.post('/auth/register/university', data),
  verifyEmail:        (email: string, code: string) =>
    api.post('/auth/verify-email', { email, code }),
  resendOtp:          (email: string) =>
    api.post('/auth/resend-otp', { email }),
  logout:             () => api.post('/auth/logout'),
};

export const problemsApi = {
  list:   (params?: Record<string, unknown>) => api.get('/problems', { params }),
  findOne: (id: string) => api.get(`/problems/${id}`),
  create: (data: Record<string, unknown>) => api.post('/problems', data),
};

export const commentsApi = {
  list:   (problemId: string) => api.get(`/problems/${problemId}/comments`),
  create: (problemId: string, data: { content: string; links?: string[] }) =>
    api.post(`/problems/${problemId}/comments`, data),
  remove: (problemId: string, id: string) =>
    api.delete(`/problems/${problemId}/comments/${id}`),
};

export const solutionsApi = {
  list:   (params?: Record<string, unknown>) => api.get('/solutions', { params }),
  submit: (data: { problemId: string; content: string; links?: string[] }) =>
    api.post('/solutions', data),
};

export const profileApi = {
  me:           () => api.get('/auth/me'),
  myProblems:   (params?: Record<string, unknown>) =>
    api.get('/problems', { params: { ...params, my: true } }),
  deleteAccount: () => api.delete('/auth/me'),
};

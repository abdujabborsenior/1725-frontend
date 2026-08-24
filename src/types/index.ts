export type UserRole =
  | 'superadmin' | 'analyzer' | 'school_student' | 'university_student' | 'user';

export type ProblemStatus =
  | 'pending' | 'open' | 'under_review' | 'resolved' | 'rejected';

export type ProblemSort = 'newest' | 'popular' | 'most_viewed';

export type SolutionStatus = 'pending' | 'accepted' | 'rejected';

export type StartupStatus = 'draft' | 'published' | 'archived';

export type StartupVisibility = 'public' | 'private';

export type PlatformType =
  | 'android' | 'ios' | 'website' | 'telegram_bot' | 'other';

export type StartupSort =
  | 'newest' | 'popular' | 'featured' | 'alphabetical' | 'top_rated';

export type LeaderboardPeriod = 'all' | 'year' | 'month' | 'week';

export type ReportTargetType = 'startup' | 'message' | 'problem' | 'solution' | 'user';
export type ReportReason =
  | 'spam' | 'inappropriate' | 'harassment' | 'hate_speech' | 'sexual_content'
  | 'violence' | 'misinformation' | 'scam' | 'copyright' | 'duplicate'
  | 'not_working' | 'low_quality' | 'offensive' | 'other';

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
export type PublicAuthor = Pick<User, 'id' | 'fullName' | 'role'> & {
  username?: string | null;
  avatarUrl?: string | null;
};

export interface User {
  id: string;
  username: string | null;
  fullName: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  links: string[];
  followerCount: number;
  followingCount: number;
  /** Asoschi (Founder) tamg'asi — kamida bitta startap joylagan, doimiy */
  isFounder?: boolean;
  founderSince?: string | null;
  founderVoteCount?: number;
  age: number | null;
  region: string | null;
  district: string | null;
  school: string | null;
  grade: number | null;
  university: string | null;
  course: number | null;
  createdAt: string;
}

/* ── Social: profil, qidiruv, follow ──────────────────────────── */
export interface PublicUserCard {
  id: string;
  username: string | null;
  fullName: string;
  headline: string | null;
  avatarUrl: string | null;
  role: UserRole;
  followerCount: number;
  isFollowedByMe: boolean;
  /** Asoschi (Founder) tamg'asi */
  isFounder?: boolean;
}

export interface PublicProfile {
  id: string;
  username: string | null;
  fullName: string;
  role: UserRole;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  links: string[];
  region: string | null;
  followerCount: number;
  followingCount: number;
  /** Asoschi (Founder) tamg'asi — doimiy */
  isFounder: boolean;
  founderSince: string | null;
  founderVoteCount: number;
  /** Joriy foydalanuvchi bu asoschiga ovoz berganmi */
  founderVotedByMe: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  isMe: boolean;
  isFollowing: boolean;
  isFollowedBy: boolean;
}

/** Asoschilar liderbordi elementi */
export interface FounderEntry extends PublicUserCard {
  rank: number;
  isFounder: true;
  founderVoteCount: number;
  founderSince: string | null;
  startupCount: number;
  votedByMe: boolean;
}

/* ── Chat ─────────────────────────────────────────────────────── */
export type ConversationType = 'direct' | 'group';
export type MessageType =
  | 'text' | 'image' | 'video' | 'voice' | 'round_video' | 'file' | 'system';

export interface ChatUserMini {
  id: string;
  username: string | null;
  fullName: string;
  avatarUrl: string | null;
  lastSeenAt?: string | null;
}

export interface MessageAttachment {
  url: string;
  type: MessageType;
  mimeType: string;
  size: number;
  name?: string | null;
  durationSec?: number | null;
  width?: number | null;
  height?: number | null;
  waveform?: number[] | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  type: MessageType;
  content: string | null;
  attachments: MessageAttachment[];
  createdAt: string;
  editedAt: string | null;
  isDeleted: boolean;
  sender: ChatUserMini | null;
  replyTo: {
    id: string;
    type: MessageType;
    content: string | null;
    senderName: string | null;
  } | null;
  clientId?: string;
  /** Optimistik UI uchun mahalliy holat */
  pending?: boolean;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string | null;
  avatarUrl: string | null;
  slug: string | null;
  username?: string | null;
  isPublic: boolean;
  description: string | null;
  participantCount: number;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  myRole: string | null;
  /** Oddiy a'zolar uchun taqiqlangan xabar turlari (default []) */
  blockedMessageTypes: MessageType[];
  otherUser: ChatUserMini | null;
}

export interface PublicGroup {
  id: string;
  title: string | null;
  slug: string | null;
  username?: string | null;
  avatarUrl: string | null;
  description: string | null;
  participantCount: number;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  /** Joriy foydalanuvchi a'zomi (autentifikatsiya bo'lsa) */
  isMember?: boolean;
  /** Guruh yaratuvchisi (admin ro'yxatida keladi) */
  createdById?: string | null;
  createdBy?: ChatUserMini | null;
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
  /** LEGACY: moderatsiya bekor qilingan — UI'da ko'rsatilmaydi */
  status: SolutionStatus;
  /** LEGACY: moderatsiya davridan qolgan — UI'da ko'rsatilmaydi */
  analyzerNote: string | null;
  /** "Foydali" deb belgilaganlar soni */
  helpfulCount: number;
  /** Joriy foydalanuvchi foydali deganmi (auth bo'lsa) */
  helpfulByMe?: boolean;
  problemId: string;
  submittedById: string | null;
  submittedBy: PublicAuthor | null;
  problem?: Pick<Problem, 'id' | 'title' | 'status'>;
  /** Yechim sifatida biriktirilgan startap (published+public bo'lsa keladi) */
  startupId?: string | null;
  startup?: Pick<
    Startup,
    | 'id' | 'title' | 'slug' | 'tagline' | 'logoUrl' | 'coverUrl'
    | 'category' | 'ratingAvg' | 'ratingCount' | 'likeCount' | 'viewCount'
  > | null;
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
  likeCount: number;
  likedByMe?: boolean;
  submittedBy: PublicAuthor | null;
  analyzer?: PublicAuthor | null;
  comments?: Comment[];
  solutions?: Solution[];
  createdAt: string;
  updatedAt: string;
}

/* ── Polls (startaplar ovoz berish) ───────────────────────────── */
export type PollStatus = 'active' | 'closed';

export interface PollStartup {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  logoUrl: string | null;
  coverUrl: string | null;
  videoUrl: string | null;
  category: string | null;
  tags: string[];
  platforms: StartupPlatform[];
  ratingAvg: number;
  ratingCount: number;
  viewCount: number;
}

export interface PollOption {
  id: string;
  voteCount: number;
  percent: number;
  startup: PollStartup | null;
}

export interface Poll {
  id: string;
  question: string;
  description: string | null;
  status: PollStatus;
  isClosed: boolean;
  endsAt: string | null;
  totalVotes: number;
  createdAt: string;
  myVotedOptionId: string | null;
  options: PollOption[];
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
  videoUrl: string | null;
  category: string | null;
  region: string | null;
  district: string | null;
  tags: string[];
  platforms: StartupPlatform[];
  status: StartupStatus;
  visibility: StartupVisibility;
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

/* ── Reyting taxtasi (IMDB uslubidagi Bayes vaznli reyting) ───── */
export interface LeaderboardEntry extends Startup {
  /** 1-dan boshlanadigan reyting o'rni */
  rank: number;
  /** Bayes (vaznli) reyting bali — 0–5 */
  score: number;
  /** Ushbu taxtada hisobga olingan o'rtacha reyting (davrga bog'liq) */
  leaderboardRating: number;
  /** Ushbu taxtada hisobga olingan ovozlar (sharhlar) soni */
  leaderboardVotes: number;
  /** O'rin o'zgarishi (oldingi − joriy). + ko'tarildi, − tushdi, null yangi */
  rankDelta: number | null;
}

export interface LeaderboardFormula {
  /** Global o'rtacha reyting (C) */
  c: number;
  /** Bayes silliqlash konstantasi (m) */
  m: number;
  period: LeaderboardPeriod;
  minVotes: number;
}

export interface LeaderboardMeta extends PaginationMeta {
  formula: LeaderboardFormula;
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  meta: LeaderboardMeta;
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
  | 'new_follower'
  | 'founder_badge'
  | 'new_message'
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
  setUser: (user: User) => void;
  setPendingEmail: (email: string) => void;
  clearAuth: () => void;
}

export type RegisterType = 'user' | 'school' | 'university';

/* ── Yechim AI ────────────────────────────────────────────────── */

export interface AiStatus {
  enabled: boolean;
  limit: number;
  used: number;
  remaining: number;
  authenticated: boolean;
}

/** AI e'longa tayyorlab bergan muammo qoralamasi (foydalanuvchi tahrirlaydi) */
export interface AiDraft {
  title: string;
  description: string;
  category: string | null;
}

export interface AiMatch {
  startup: Startup;
  /** Nega aynan shu loyiha mos — AI izohi (1 gap) */
  reason: string;
}

export interface AiRelatedProblem {
  id: string;
  title: string;
  solutionCount: number;
}

export interface AiSolveResult {
  queryId: string;
  question: string;
  answer: string;
  matches: AiMatch[];
  relatedProblems: AiRelatedProblem[];
  /** Foydalanuvchi bugunoq qila oladigan amaliy qadamlar */
  steps: string[];
  /** Platformada mos yechim topilmadi — e'lon qilish taklif etiladi */
  noSolution: boolean;
  draft: AiDraft | null;
  cached: boolean;
}

/* ── Obuna / to'lov (Payme) ───────────────────────────────────── */
/* Bu qism VAQTINCHA o'chiq mahsulot bo'limi — `lib/billing.ts` dagi
   BILLING_ENABLED flagiga qarang. Turlar backenddagi `billing` moduli
   javoblariga aynan mos. Barcha summalar — TIYIN (butun son). */

export type BillingInterval = 'monthly' | 'yearly';
export type PlanTier = 'starter' | 'pro' | 'business';
export type BillingOrderStatus = 'pending' | 'paid' | 'cancelled' | 'expired';
export type BillingSubscriptionStatus =
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'superseded';

export interface BillingPlan {
  id: string;
  /** `pro_yearly` kabi barqaror kod — kodda shu bo'yicha murojaat qilinadi */
  code: string;
  tier: PlanTier;
  interval: BillingInterval;
  name: string;
  description: string | null;
  /** Shu tarif bilan e'lon qilish mumkin bo'lgan loyihalar soni */
  startupLimit: number;
  /** TIYIN (1 so'm = 100 tiyin) */
  price: number;
  currency: 'UZS';
  isPopular: boolean;
  sortOrder: number;
}

export interface BillingSubscription {
  id: string;
  planId: string;
  plan: BillingPlan | null;
  tier: PlanTier;
  interval: BillingInterval;
  startupLimit: number;
  status: BillingSubscriptionStatus;
  startsAt: string;
  endsAt: string;
}

export interface BillingUsage {
  /** Hozircha e'lon qilingan loyihalar soni */
  startups: number;
  /** Joriy tarif limiti (obuna yo'q bo'lsa — bepul limit) */
  limit: number;
  remaining: number;
}

export interface BillingMe {
  subscription: BillingSubscription | null;
  usage: BillingUsage;
}

export interface BillingOrder {
  id: string;
  planId: string;
  plan: BillingPlan | null;
  /** TIYIN */
  amount: number;
  status: BillingOrderStatus;
  provider: 'payme';
  createdAt: string;
  paidAt: string | null;
  expiresAt: string;
}

export interface BillingStatusInfo {
  enabled: boolean;
  provider: 'payme';
  /** Obunasiz foydalanuvchi e'lon qila oladigan loyihalar soni */
  freeStartupLimit: number;
}

export interface BillingCheckout {
  orderId: string;
  /** TIYIN — Payme ham shu birlikda ishlaydi */
  amount: number;
  /** Payme checkout sahifasi (foydalanuvchi shu manzilga yo'naltiriladi) */
  checkoutUrl: string;
  provider: 'payme';
}

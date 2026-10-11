// ─── Core domain types ───────────────────────────────────────────────────────

export type UserRole = 'student' | 'admin';
export type Theme = 'light' | 'dark' | 'system';
export type FeedbackValue = 'up' | 'down';
export type DocumentStatus = 'uploaded' | 'processing' | 'indexed' | 'failed';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type MessageRole = 'user' | 'assistant';

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  semester?: number;
  avatarUrl?: string;
  createdAt: string;
}

// ─── Chat & Messages ──────────────────────────────────────────────────────────

export interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  relevanceScore: number; // 0–100
  snippet: string;        // raw text excerpt
  matchedText: string;    // the specific phrase that was matched
}

export interface Message {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  citations?: Citation[];
  confidence?: ConfidenceLevel;
  feedback?: FeedbackValue;
  isStreaming?: boolean;
  timestamp: string;
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  category?: string;
  department?: string;
  semester?: number;
}

export interface ChatSummary {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Query filters ────────────────────────────────────────────────────────────

export interface QueryFilters {
  category?: string;
  department?: string;
  semester?: number;
}

// ─── Documents ────────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  name: string;
  category: string;
  department: string;
  semester?: number;
  uploadDate: string;
  size: number;       // bytes
  status: DocumentStatus;
  pageCount?: number;
  uploadedBy: string;
  description?: string;
}

export interface DocumentListParams {
  search?: string;
  category?: string;
  department?: string;
  status?: DocumentStatus;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PaginatedDocuments {
  data: Document[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface QueryDataPoint {
  date: string;
  queries: number;
  uniqueUsers: number;
}

export interface CategoryDataPoint {
  category: string;
  count: number;
}

export interface FeedbackDataPoint {
  name: string;
  value: number;
}

export interface TopQuestion {
  id: string;
  question: string;
  count: number;
  category: string;
  avgConfidence: ConfidenceLevel;
}

export interface LowConfidenceQuestion {
  id: string;
  question: string;
  confidence: number;
  asked: number;
  lastAsked: string;
}

export interface AnalyticsData {
  kpis: {
    totalQueries: number;
    totalQueriesTrend: number;
    activeUsers: number;
    activeUsersTrend: number;
    documentsIndexed: number;
    documentsIndexedTrend: number;
    avgResponseTime: number;
    avgResponseTimeTrend: number;
    satisfactionRate: number;
    satisfactionRateTrend: number;
  };
  queriesOverTime: QueryDataPoint[];
  topCategories: CategoryDataPoint[];
  feedbackSplit: FeedbackDataPoint[];
  topQuestions: TopQuestion[];
  lowConfidenceQuestions: LowConfidenceQuestion[];
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface SendQueryResponse {
  message: Message;
}

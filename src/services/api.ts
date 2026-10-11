import {
  type AuthResponse,
  type Chat,
  type ChatSummary,
  type DocumentListParams,
  type PaginatedDocuments,
  type AnalyticsData,
  type Message,
  type QueryFilters,
  type FeedbackValue,
} from '../types';
import {
  mockChatSummaries,
  mockChats,
  mockDocuments,
  mockAnalytics,
  mockUsers,
  generateMockResponse,
} from '../mocks/data';
import { sleep, generateId } from '../lib/utils';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// ─── Real HTTP helper (used when USE_MOCK = false) ────────────────────────────

async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('rag_token');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, _password: string, role: 'student' | 'admin'): Promise<AuthResponse> {
  if (USE_MOCK) {
    await sleep(800);
    const user = role === 'admin' ? mockUsers.admin : mockUsers.student;
    return { user: { ...user, email }, token: `mock-token-${generateId()}` };
  }
  return http<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: _password, role }),
  });
}

export async function signup(
  name: string,
  email: string,
  _password: string,
  role: 'student' | 'admin',
): Promise<AuthResponse> {
  if (USE_MOCK) {
    await sleep(1000);
    const base = role === 'admin' ? mockUsers.admin : mockUsers.student;
    return { user: { ...base, name, email, id: generateId() }, token: `mock-token-${generateId()}` };
  }
  return http<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password: _password, role }),
  });
}

// ─── Chat / Query ─────────────────────────────────────────────────────────────

export async function getChatHistory(): Promise<ChatSummary[]> {
  if (USE_MOCK) {
    await sleep(300);
    return mockChatSummaries;
  }
  return http<ChatSummary[]>('/chats');
}

export async function getChat(id: string): Promise<Chat> {
  if (USE_MOCK) {
    await sleep(200);
    const chat = mockChats.find((c) => c.id === id);
    if (!chat) throw new Error('Chat not found');
    return chat;
  }
  return http<Chat>(`/chats/${id}`);
}

export async function deleteChat(id: string): Promise<void> {
  if (USE_MOCK) {
    await sleep(300);
    return;
  }
  return http<void>(`/chats/${id}`, { method: 'DELETE' });
}

export async function renameChat(id: string, title: string): Promise<void> {
  if (USE_MOCK) {
    await sleep(300);
    return;
  }
  return http<void>(`/chats/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

export async function createChat(): Promise<Chat> {
  if (USE_MOCK) {
    await sleep(200);
    return {
      id: `chat-${generateId()}`,
      title: 'New Chat',
      userId: 'user-1',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return http<Chat>('/chats', { method: 'POST' });
}

export async function sendQuery(
  chatId: string,
  query: string,
  _filters?: QueryFilters,
): Promise<{ userMessage: Message; assistantMessage: Message }> {
  if (USE_MOCK) {
    await sleep(1200 + Math.random() * 800);
    const now = new Date().toISOString();
    const mockResp = generateMockResponse(query);
    const userMsg: Message = {
      id: `msg-${generateId()}`,
      chatId,
      role: 'user',
      content: query,
      timestamp: now,
    };
    const assistantMsg: Message = {
      id: `msg-${generateId()}`,
      chatId,
      role: 'assistant',
      content: mockResp.content,
      citations: mockResp.citations,
      confidence: mockResp.confidence,
      timestamp: new Date(Date.now() + 2000).toISOString(),
    };
    return { userMessage: userMsg, assistantMessage: assistantMsg };
  }
  return http<{ userMessage: Message; assistantMessage: Message }>(`/chats/${chatId}/query`, {
    method: 'POST',
    body: JSON.stringify({ query, filters: _filters }),
  });
}

// ─── Documents ────────────────────────────────────────────────────────────────

export async function listDocuments(params?: DocumentListParams): Promise<PaginatedDocuments> {
  if (USE_MOCK) {
    await sleep(400);
    let docs = [...mockDocuments];
    if (params?.search) {
      const q = params.search.toLowerCase();
      docs = docs.filter(
        (d) => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q),
      );
    }
    if (params?.category) docs = docs.filter((d) => d.category === params.category);
    if (params?.department && params.department !== 'All Departments')
      docs = docs.filter((d) => d.department === params.department);
    if (params?.status) docs = docs.filter((d) => d.status === params.status);

    if (params?.sortBy) {
      const dir = params.sortDir === 'desc' ? -1 : 1;
      docs.sort((a, b) => {
        const va = (a as unknown as Record<string, unknown>)[params.sortBy!];
        const vb = (b as unknown as Record<string, unknown>)[params.sortBy!];
        if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * dir;
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
        return 0;
      });
    }

    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const total = docs.length;
    const paginated = docs.slice((page - 1) * pageSize, page * pageSize);
    return { data: paginated, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return http<PaginatedDocuments>(`/documents?${qs}`);
}

export async function uploadDocument(
  file: File,
  meta: { category: string; department: string; semester?: number },
  onProgress?: (pct: number) => void,
): Promise<void> {
  if (USE_MOCK) {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await sleep(150);
      onProgress?.(i);
    }
    return;
  }
  const form = new FormData();
  form.append('file', file);
  form.append('category', meta.category);
  form.append('department', meta.department);
  if (meta.semester) form.append('semester', String(meta.semester));

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/documents/upload`);
    const token = localStorage.getItem('rag_token');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    });
    xhr.onload = () => (xhr.status < 400 ? resolve() : reject(new Error(xhr.responseText)));
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(form);
  });
}

export async function deleteDocument(id: string): Promise<void> {
  if (USE_MOCK) {
    await sleep(400);
    return;
  }
  return http<void>(`/documents/${id}`, { method: 'DELETE' });
}

export async function reindexDocument(id: string): Promise<void> {
  if (USE_MOCK) {
    await sleep(600);
    return;
  }
  return http<void>(`/documents/${id}/reindex`, { method: 'POST' });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalytics(): Promise<AnalyticsData> {
  if (USE_MOCK) {
    await sleep(600);
    return mockAnalytics;
  }
  return http<AnalyticsData>('/analytics');
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function submitFeedback(messageId: string, value: FeedbackValue): Promise<void> {
  if (USE_MOCK) {
    await sleep(200);
    return;
  }
  return http<void>('/feedback', {
    method: 'POST',
    body: JSON.stringify({ messageId, value }),
  });
}

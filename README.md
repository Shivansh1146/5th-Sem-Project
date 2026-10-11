# AcadIQ — RAG-Based Academic Query Assistant

> **Phase 1 — Frontend Only.** A fully functional React frontend with a mock API layer. The backend (RAG pipeline, vector DB, FastAPI) is Phase 2 and can be plugged in by toggling a single env variable.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Quick Start](#quick-start)
4. [Environment Variables](#environment-variables)
5. [Folder Structure](#folder-structure)
6. [Routes & Role Guards](#routes--role-guards)
7. [Features](#features)
8. [Mock vs. Real API](#mock-vs-real-api)
9. [API Contract (Phase 2)](#api-contract-phase-2)
10. [TypeScript Types](#typescript-types)
11. [Design System](#design-system)

---

## Overview

**AcadIQ** lets university students ask natural-language questions about:
- Syllabus, exam rules, circulars
- Fee schedules, hostel policies, placement policies
- Scholarship & library guidelines

The system returns answers **with source citations** (document name, page, relevance %) retrieved from a RAG backend (Phase 2). Admins upload/manage university PDFs and monitor usage analytics.

---

## Tech Stack

| Category | Library / Tool |
|---|---|
| Framework | React 19 + Vite 8 |
| Language | TypeScript 6 |
| Styling | Tailwind CSS v4 |
| UI Primitives | Radix UI |
| Icons | lucide-react |
| Routing | React Router v7 |
| State | Zustand v5 |
| Data Fetching | TanStack Query v5 |
| Forms | react-hook-form + zod |
| Markdown | react-markdown + remark-gfm |
| Charts | Recharts |
| Animations | Framer Motion |
| File Upload | react-dropzone |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. .env is already included with VITE_USE_MOCK=true

# 3. Start development server
npm run dev

# App runs at http://localhost:5173
```

### Demo Credentials

| Role | How to Login |
|---|---|
| **Student** | Any email + any password, select "Student" |
| **Admin** | Any email + any password, select "Admin" |

> In mock mode, credentials are not validated. The role picker determines access level.

---

## Environment Variables

```env
# .env
VITE_USE_MOCK=true                              # true = mock data, false = real backend
VITE_API_BASE_URL=http://localhost:8000/api/v1  # Phase 2 backend base URL
```

**Phase 2 switch:** Set `VITE_USE_MOCK=false`. Zero UI changes required.

---

## Folder Structure

```
src/
├── components/
│   ├── common/
│   │   ├── ErrorBoundary.tsx     # Global error boundary + inline error state
│   │   ├── ThemeProvider.tsx     # Applies dark/light/system class to <html>
│   │   └── Toast.tsx             # Toast notification system (context + hook)
│   └── ui/
│       ├── Badge.tsx             # Status / confidence badges
│       ├── Button.tsx            # Variant button (primary, secondary, outline, danger)
│       ├── Dialog.tsx            # Modal dialog (Radix Dialog wrapper)
│       ├── Input.tsx             # Labelled text input with error display
│       ├── Select.tsx            # Radix Select wrapper
│       ├── Skeleton.tsx          # Loading skeleton variants
│       └── Tooltip.tsx           # Radix Tooltip wrapper
│
├── features/
│   ├── auth/
│   │   └── ProtectedRoute.tsx    # ProtectedRoute + GuestRoute + role guard
│   ├── chat/
│   │   ├── ChatSidebar.tsx       # History list, search, new chat, rename/delete
│   │   ├── CitationChip.tsx      # Source citation badge on assistant messages
│   │   ├── InputBar.tsx          # Auto-resize textarea, Enter/Shift+Enter, filters
│   │   ├── MessageBubble.tsx     # User + assistant bubbles, markdown, feedback
│   │   ├── SourcePanel.tsx       # Right panel with highlighted citation snippet
│   │   └── SuggestedQuestions.tsx# Empty-state question cards
│   └── documents/
│       └── DropZone.tsx          # Drag-and-drop upload with per-file progress
│
├── layouts/
│   ├── AppLayout.tsx             # Sidebar + mobile drawer + main outlet
│   └── AuthLayout.tsx            # Split-panel auth wrapper
│
├── lib/
│   ├── constants.ts              # ROUTES, CATEGORIES, DEPARTMENTS, SEMESTERS
│   └── utils.ts                  # cn(), generateId(), formatBytes(), formatDate()
│
├── mocks/
│   └── data.ts                   # Realistic mock: users, chats, documents, analytics
│
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── ChatPage.tsx              # Main chat UI (most important page)
│   ├── DocumentsPage.tsx         # Admin document management
│   ├── AnalyticsPage.tsx         # Admin analytics dashboard
│   ├── SettingsPage.tsx
│   └── NotFoundPage.tsx
│
├── services/
│   └── api.ts                    # All API calls (mock + real, flag-switched)
│
├── store/
│   └── index.ts                  # useAuthStore, useThemeStore, useChatStore
│
├── types/
│   └── index.ts                  # All TypeScript interfaces
│
├── App.tsx
├── main.tsx
└── index.css                     # Design tokens + Tailwind base + prose styles
```

---

## Routes & Role Guards

| Path | Component | Guard |
|---|---|---|
| `/` | LandingPage | Public |
| `/login` | LoginPage | Guest only |
| `/signup` | SignupPage | Guest only |
| `/chat` | ChatPage | Auth required |
| `/chat/:id` | ChatPage | Auth required |
| `/settings` | SettingsPage | Auth required |
| `/admin/documents` | DocumentsPage | Auth + admin role |
| `/admin/analytics` | AnalyticsPage | Auth + admin role |
| `*` | NotFoundPage | Public |

---

## Features

### Chat Page (Core Feature)
- ChatGPT-style layout: sidebar | message area | source panel
- Streaming-simulation typing effect for AI responses
- Source citation chips (document name, page, relevance %)
- Click citation → right panel with highlighted snippet
- Thumbs up/down feedback, copy, regenerate on every answer
- Category / department / semester filters in input bar
- Suggested questions on empty state
- High / Medium / Low confidence indicator per answer
- Markdown rendering: headings, tables, code blocks, blockquotes
- Sidebar: search, new chat, rename, delete

### Document Management (Admin)
- Drag-and-drop upload (PDF, DOCX, TXT) with per-file progress bar
- Sortable, filterable, paginated table
- Row actions: view, re-index, delete (confirm dialog)
- Toast notifications for all mutations

### Analytics Dashboard (Admin)
- 5 KPI cards with trend arrows
- Line chart: queries over time
- Bar chart: queries by category
- Pie chart: feedback distribution
- Top questions + low-confidence questions tables

### Auth
- Email + password + role picker
- react-hook-form + zod validation
- JWT persisted in localStorage via Zustand

### Settings
- Profile editing, theme toggle (Light/Dark/System)
- Clear history, sign out

---

## Mock vs. Real API

Each function in `src/services/api.ts` branches on `VITE_USE_MOCK`:

```ts
export async function sendQuery(chatId, query, filters) {
  if (USE_MOCK) {
    await sleep(1200);
    return generateMockResponse();
  }
  return http(`/chats/${chatId}/query`, { method: 'POST', body: JSON.stringify({ query, filters }) });
}
```

---

## API Contract (Phase 2)

Base URL: `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`)
Auth header: `Authorization: Bearer <JWT>` on all protected routes.

---

### POST /auth/login

**Request:**
```json
{ "email": "string", "password": "string", "role": "student | admin" }
```
**Response 200:**
```json
{
  "user": { "id": "string", "name": "string", "email": "string", "role": "student | admin",
            "department": "string?", "semester": "number?", "createdAt": "ISO8601" },
  "token": "string"
}
```

### POST /auth/signup

**Request:**
```json
{ "name": "string", "email": "string", "password": "string", "role": "student | admin" }
```
**Response 201:** Same shape as login response.

---

### GET /chats

**Response 200:**
```json
[{ "id": "string", "title": "string", "lastMessage": "string", "createdAt": "ISO8601", "updatedAt": "ISO8601" }]
```

### POST /chats

**Response 201:**
```json
{ "id": "string", "title": "New Chat", "userId": "string", "messages": [], "createdAt": "ISO8601", "updatedAt": "ISO8601" }
```

### GET /chats/:id

**Response 200:**
```json
{
  "id": "string", "title": "string", "userId": "string",
  "messages": [{
    "id": "string", "chatId": "string", "role": "user | assistant",
    "content": "string (markdown)",
    "citations": [{
      "id": "string", "documentId": "string", "documentName": "string",
      "pageNumber": 12, "relevanceScore": 94, "snippet": "string", "matchedText": "string"
    }],
    "confidence": "high | medium | low",
    "feedback": "up | down | null",
    "timestamp": "ISO8601"
  }],
  "createdAt": "ISO8601", "updatedAt": "ISO8601"
}
```

### POST /chats/:id/query

**Request:**
```json
{ "query": "string", "filters": { "category": "string?", "department": "string?", "semester": "number?" } }
```
**Response 200:**
```json
{ "userMessage": { /* Message */ }, "assistantMessage": { /* Message with citations + confidence */ } }
```

> **Optional streaming:** `POST /chats/:id/query/stream` returning `text/event-stream` with `data: <chunk>` lines.

### PATCH /chats/:id
**Request:** `{ "title": "string" }` — **Response 204**

### DELETE /chats/:id
**Response 204**

---

### GET /documents

**Query params:** `search`, `category`, `department`, `status`, `page`, `pageSize`, `sortBy`, `sortDir`

**Response 200:**
```json
{
  "data": [{
    "id": "string", "name": "BCA_Syllabus_2024.pdf", "category": "Syllabus",
    "department": "Computer Science", "semester": 3, "uploadDate": "ISO8601",
    "size": 2450000, "status": "uploaded | processing | indexed | failed",
    "pageCount": 48, "uploadedBy": "string", "description": "string?"
  }],
  "total": 12, "page": 1, "pageSize": 10, "totalPages": 2
}
```

### POST /documents/upload
Multipart form: `file (File)`, `category (string)`, `department (string)`, `semester? (string)`

**Response 201:** `{ "id": "string", "name": "string", "status": "uploaded" }`

### DELETE /documents/:id — Response 204

### POST /documents/:id/reindex — Response 202: `{ "message": "Re-index queued" }`

---

### GET /analytics

**Response 200:**
```json
{
  "kpis": {
    "totalQueries": 4821, "totalQueriesTrend": 12.4,
    "activeUsers": 342, "activeUsersTrend": 8.1,
    "documentsIndexed": 11, "documentsIndexedTrend": 10,
    "avgResponseTime": 1.4, "avgResponseTimeTrend": -0.2,
    "satisfactionRate": 87, "satisfactionRateTrend": 3.2
  },
  "queriesOverTime": [{ "date": "YYYY-MM-DD", "queries": 92, "uniqueUsers": 41 }],
  "topCategories": [{ "category": "Exam Rules", "count": 1243 }],
  "feedbackSplit": [{ "name": "Helpful", "value": 3842 }, { "name": "Not Helpful", "value": 541 }],
  "topQuestions": [{ "id": "string", "question": "string", "count": 312, "category": "string", "avgConfidence": "high | medium | low" }],
  "lowConfidenceQuestions": [{ "id": "string", "question": "string", "confidence": 28, "asked": 54, "lastAsked": "ISO8601" }]
}
```

---

### POST /feedback

**Request:** `{ "messageId": "string", "value": "up | down" }` — **Response 204**

---

## TypeScript Types

All types live in `src/types/index.ts`:

| Type | Description |
|---|---|
| `User` | Authenticated user with role |
| `Message` | Single chat message (user or assistant) |
| `Citation` | Document source reference on assistant messages |
| `Chat` | Full conversation with messages array |
| `ChatSummary` | Lightweight sidebar list item |
| `Document` | Uploaded university document |
| `AnalyticsData` | Full analytics payload |
| `QueryFilters` | Category / department / semester filters |
| `AuthResponse` | `{ user, token }` from login/signup |

---

## Design System

- **Font:** Inter (loaded via Google Fonts in `index.html`)
- **Tokens:** CSS variables in `index.css` — switched by `.dark` class on `<html>`
- **Brand:** Indigo–Violet `#6366f1` → `#7c3aed`
- **Theme:** Light / Dark / System — persisted in Zustand + localStorage
- **Responsive:** Mobile-first; sidebar becomes a slide-in drawer below `lg` breakpoint

---

## Phase 2 Checklist

- [ ] Set `VITE_USE_MOCK=false`
- [ ] Set `VITE_API_BASE_URL` to FastAPI server URL
- [ ] Implement all endpoints in this API Contract
- [ ] Use `Authorization: Bearer <JWT>` header
- [ ] (Optional) Implement SSE streaming for chat
- [ ] Wire up real document indexing status polling

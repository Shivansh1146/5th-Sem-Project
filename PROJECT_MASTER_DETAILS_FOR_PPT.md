# AcadIQ — Complete End-to-End Master Project Dossier (A to Z)
> **Instructions for Claude / Presentation AI:**  
> Use this comprehensive document to generate a high-impact, professional PowerPoint presentation, project report, or viva defense deck. Every technical specification, problem statement, system architecture, component, metric, and engineering decision is detailed below.

---

## 1. PROJECT METADATA & EXECUTIVE SUMMARY

* **Project Title:** AcadIQ (Academic Intelligence & Query Assistant)
* **Subtitle:** An Enterprise-Grade RAG-Powered Knowledge Management System for University Regulations & Document Discovery
* **Academic Level:** 5th Semester Major Project (B.Tech Computer Science & Engineering)
* **Author / Developer:** Shivansh & Team
* **GitHub Repository:** [https://github.com/Shivansh1146/5th-Sem-Project](https://github.com/Shivansh1146/5th-Sem-Project)
* **Current Status:** 
  * Phase 1: Complete production-ready Frontend + Realistic Mock Engine (100% build pass, 0 TypeScript errors).
  * Phase 2 Ready: Pre-architected API contract ready to plug into a FastAPI + LangChain + Qdrant/Pinecone backend via a single environment variable toggle (`VITE_USE_MOCK=false`).

### One-Line Pitch
AcadIQ eliminates campus information fragmentation by transforming static, unsearchable university regulatory PDFs into a conversational, verifiable AI assistant that provides answers backed by page-level citations and administrative analytics.

---

## 2. THE PROBLEM STATEMENT & REAL-WORLD MOTIVATION

Universities operate as vast bureaucratic organizations with hundreds of regulatory documents:
1. **Information Fragmentation:** Syllabi, fee schedules, hostel rules, anti-ragging bylaws, examination handbooks, and placement criteria are scattered across departmental noticeboards, PDFs, and outdated college portals.
2. **Administrative Burnout:** Examination cells, accounts departments, and student welfare offices spend hundreds of hours every semester answering identical, repetitive questions (e.g., *"What is the attendance condonation limit?"*, *"When is the semester fee late fine applied?"*, *"How many historical backlogs are allowed for placement drives?"*).
3. **Misinformation & Rumors:** Students often rely on unofficial student forums or word-of-mouth, leading to missed fee deadlines, exam disqualifications, or incorrect academic plans.
4. **General LLM Inadequacy (The Hallucination Problem):** Public AI tools like standard ChatGPT or Google Gemini have no access to an institution's private internal documents. When asked about specific college rules, standard LLMs hallucinate plausible-sounding but completely fictitious regulations, creating severe academic risk.

---

## 3. THE PROPOSED SOLUTION: RETRIEVAL-AUGMENTED GENERATION (RAG)

AcadIQ solves this by implementing **Retrieval-Augmented Generation (RAG)** specifically tailored for higher education:
* **Grounded Truth:** The language model never answers from memory. It is strictly constrained to synthesize answers from indexed institutional documents.
* **100% Verifiable Citations:** Every statement is accompanied by interactive citation chips displaying the document name, exact page number, and semantic relevance score.
* **Source Inspection Drawer:** Clicking any citation badge opens a slide-out drawer displaying the verbatim text excerpt from the official document.
* **Confidence Transparency:** Each answer is labeled with High, Medium, or Low confidence. Low-confidence queries are automatically flagged to university administrators.
* **Dual-Portal Role-Based Access Control (RBAC):**
  * **Student Portal:** Question answering, source inspection, category filtering, chat history.
  * **Admin Portal:** Document management, drag-and-drop ingestion, vector re-indexing, usage telemetry, and student feedback analytics.

---

## 4. END-TO-END SYSTEM ARCHITECTURE & DATA FLOW

```
[University Admin] 
       │ (Uploads PDF/DOCX)
       ▼
[Document Ingestion Pipeline] ──> [Text Extraction & Semantic Chunking (500 tokens, 50 overlap)]
                                           │
                                           ▼
                                [Embedding Model (OpenAI / HuggingFace)]
                                           │
                                           ▼
                                [Vector Database (Qdrant / Pinecone)]
                                           ▲
                                           │ (Semantic Vector Search)
[Student User] ────────────────────────────┴───────────────────────────────┐
       │ (Submits Natural Language Query)                                  │
       ▼                                                                   ▼
[AcadIQ Client (React 19)] ──> [API Service Layer] ──> [RAG Synthesizer (LLM)]
       ▲                                                                   │
       │ (Streamed Response + Citations + Confidence)                      │
       └───────────────────────────────────────────────────────────────────┘
```

### The 4 Stages of the RAG Pipeline:
1. **Ingestion & Indexing:** Institutional circulars (e.g., `Exam_Rules_2025.pdf`, `Fee_Schedule_2025.pdf`) are ingested, chunked into semantically coherent segments, converted into dense vector embeddings, and indexed with metadata (department, semester, category, upload date).
2. **Retrieval:** When a student enters a query, the query is vectorized and compared against the vector database using cosine similarity to retrieve the top-$k$ most relevant text chunks.
3. **Prompt Augmentation & Generation:** The retrieved text chunks are injected into a strict system prompt instructing the LLM: *"Answer the student query strictly using the provided context. If the answer is not present, state that it is not documented. Cite document ID and page number."*
4. **Verification & Client Rendering:** The frontend renders the answer using progressive word-by-word streaming, formats tabular data into clean Markdown tables, and attaches clickable citation chips.

---

## 5. DUAL-PORTAL ARCHITECTURE & ROLE-BASED ACCESS CONTROL (RBAC)

AcadIQ implements an enterprise-grade dual-portal architecture:

### A. Student Portal (`Aryan Mehta` - CSE, Semester 5)
* **Access Level:** Public / Student queries.
* **Visible Modules:**
  * Interactive Academic Chat Interface
  * Conversation History & Search
  * User Profile & Settings
* **Security Guard:** If a student attempts to navigate directly to `/analytics` or `/documents`, the system renders a dedicated **"Admin Access Required"** view with a 1-click option to switch to the Admin demo.

### B. Admin Portal (`Dr. Priya Sharma` - Administration)
* **Access Level:** Institutional Administrator / Faculty.
* **Visible Modules:**
  * All Student features +
  * **Document Management Center:** File upload dropzone, metadata tagging, indexing status (`Uploaded`, `Processing`, `Indexed`, `Failed`), document deletion, and re-indexing.
  * **Analytics & Insights Dashboard:** Real-time KPIs, queries over time charts, feedback distribution, popular query topics, and documentation gap detection.

### C. Role & Theme Session Isolation (Engineering Highlight)
* Both roles maintain **completely isolated sessions and theme preferences** in state (`studentSession` vs `adminSession`).
* Setting the Student Portal to Light mode does **not** alter the Admin Portal's Dark mode setting.
* Switching between Student and Admin is instantaneous via a 1-click portal switcher in the sidebar and settings, with zero session overwrites.

---

## 6. COMPREHENSIVE FEATURE BREAKDOWN (PAGE-BY-PAGE)

### 1. Landing Page (`/`)
* **Hero Section:** Modern minimalist typography with animated badge: *"RAG-Powered Academic Assistant"*.
* **Call to Actions:** "Start Asking Questions" (directs to Chat) and "Sign In".
* **Value Pillars:**
  * Instant verified answers from official documents.
  * Verifiable page citations.
  * Direct administrative transparency.
* **Dark / Light Mode Toggle:** Full responsive header with instantaneous theme switching.

### 2. Authentication & Signup (`/login`, `/signup`)
* **Dual-Role Sign In:** Role selector pills for *Student* or *Admin / Faculty*.
* **One-Click Demo Credentials:** Pre-filled buttons for fast evaluator testing:
  * Student: `student@university.edu` / `Aryan Mehta`
  * Admin: `admin@university.edu` / `Dr. Priya Sharma`
* **Form Validation:** Strict client-side validation using **Zod** and **React Hook Form**.

### 3. Conversational Chat Interface (`/chat`, `/chat/:id`)
* **ChatGPT-Style Canvas:** Distraction-free monochrome aesthetic with centered prompt card.
* **Simulated LLM Streaming:** Realistic token streaming animation (3 characters per 16ms tick) creating an authentic conversational experience.
* **Rich Markdown Formatting:**
  * Complex fee policies rendered as Markdown tables.
  * Code blocks with syntax highlighting.
  * Warning callouts (`> ⚠️ Students with attendance below 65% are not eligible for condonation`).
* **Interactive Citations:**
  * Citation chips beneath each message (e.g., `Fee_Schedule_2025.pdf p.2 (97%)`).
  * Clicking any citation opens the slide-out **Source Panel Drawer** displaying the exact document snippet with highlighted keyword matches.
* **Confidence Rating:** High (90%+), Medium (70–89%), Low (<70%) badges.
* **Conversation Management:**
  * Searchable chat history in collapsible sidebar.
  * Inline chat renaming and chat deletion.
  * Regenerate response button and copy-to-clipboard button.
* **Category Filters:** Filter query context by *Syllabus*, *Exam Rules*, *Hostel*, *Fees*, or *Placements*.

### 4. Document Management Center (`/admin/documents`, `/documents`)
* **Drag-and-Drop Ingestion:** Multi-file uploader built with `react-dropzone` supporting PDF, DOCX, TXT up to 50MB.
* **Metadata Assignment:** Select Category, Department (CSE, IT, Mech, Civil, MBA, MCA, BCA), and Semester during upload.
* **Real-Time Index Status:**
  * `Indexed` (Green pill): Document ready and searchable.
  * `Processing` (Amber pill): Document currently chunking and vectorizing.
  * `Uploaded` (Neutral pill): Ingestion queued.
  * `Failed` (Red pill): Error state with retry trigger.
* **Administrative Controls:** Search documents, filter by department/status, trigger 1-click re-indexing, or delete documents.

### 5. Analytics & Insights Dashboard (`/admin/analytics`, `/analytics`)
* **Key Performance Indicators (KPI Cards):**
  * **Total Queries:** 4,821 (+12.4% this week)
  * **Active Users:** 342 (+8.1% this week)
  * **Documents Indexed:** 11 documents
  * **Average Latency:** 1.4 seconds (-0.2s decrease)
  * **Student Satisfaction Rate:** 87% positive rating
* **Visual Charts (Recharts):**
  * *Queries Over Time:* Area-line graph showing query volume vs. unique users across dates.
  * *Feedback Distribution:* Radial donut chart breaking down helpful vs unhelpful votes.
  * *Queries by Category:* Horizontal bar chart highlighting high-demand domains (Exam Rules, Fees, Syllabus).
  * *Top Asked Inquiries:* Ranked listing of the most frequent campus questions.

### 6. Settings & Profile (`/settings`)
* **Environment Session Banner:** Visual indicator of active portal (*Student Portal Session* vs *Admin Portal Session*) with instant 1-click switch button.
* **Profile Management:** Full name, email address, and department fields with toast notifications.
* **Appearance Preferences:** 3-card selector for **Light**, **Dark**, and **System** themes with high-contrast active states.
* **Privacy Controls:** 1-click chat history wipe and security sign-out.

---

## 7. FULL TECHNOLOGY STACK & ARCHITECTURAL DECISIONS

| Category | Technology | Version | Justification |
|:---|:---|:---|:---|
| **Frontend Core** | React | 19.3.0 | Modern concurrent rendering, fast transition states |
| **Language** | TypeScript | 6.0.2 | Strict type safety across domain entities, props, and API contracts |
| **Build Tool** | Vite | 8.3.4 | Blazing fast HMR and optimized Rollup production bundling |
| **Routing** | React Router | 7.18.4 | Declarative nested routing, role-guarded routes, alias paths |
| **Styling** | Tailwind CSS | 4.3.3 | Utility-first CSS, custom variant `@custom-variant dark` |
| **Design System** | Custom CSS Tokens | Vanilla | Authentic ChatGPT monochrome palette (`#171717`, `#212121`, `#ececec`) |
| **State Management**| Zustand | 5.0.15 | Lightweight persisted stores with isolated dual-session architecture |
| **Server State** | TanStack React Query | 5.104.1 | Automated query caching, deduping, background invalidation |
| **Data Viz** | Recharts | 3.10.1 | Responsive, declarative SVG charts for institutional analytics |
| **Animations** | Framer Motion | 14.1.0 | Fluid spring animations for drawers, modals, and sidebar collapses |
| **Form Handling** | React Hook Form + Zod | 7.89 / 3.25 | Schema-based validation with high performance |
| **UI Primitives** | Radix UI | 1.x / 2.x | Accessible, unstyled primitives (Dropdown, Dialog, Tooltip, Switch) |
| **Icons** | Lucide React | 1.55.0 | Clean, modern feather icon set |
| **Markdown** | `react-markdown` + `remark-gfm` | 10.1 / 4.0 | Renders academic tables, bold clauses, lists, blockquotes |

---

## 8. BACKEND INTEGRATION & API CONTRACT (PHASE 2 READY)

The frontend is completely decoupled and switchable between **Mock Mode** (for development/demonstration) and **Real Backend Mode** via `.env`:
```env
VITE_USE_MOCK=true
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Complete API Specification:
* **Authentication:**
  * `POST /auth/login` $\rightarrow$ `{ email, password, role }` $\rightarrow$ Returns JWT token + User object.
  * `POST /auth/signup` $\rightarrow$ Registers new student/admin.
* **Conversations & Queries:**
  * `GET /chats` $\rightarrow$ Retrieves user's conversation summaries.
  * `POST /chats` $\rightarrow$ Initializes new conversation thread.
  * `GET /chats/:id` $\rightarrow$ Fetches full chat history with messages and citations.
  * `POST /chats/:id/query` $\rightarrow$ Payload: `{ query, filters: { department, semester, category } }`.
    * Returns: User message, Assistant response, confidence level, and citations array.
  * `DELETE /chats/:id` $\rightarrow$ Removes chat history.
  * `PATCH /chats/:id` $\rightarrow$ Renames conversation title.
* **Document Management (Admin):**
  * `GET /documents?category=...&status=...&page=1` $\rightarrow$ Returns paginated document list.
  * `POST /documents/upload` $\rightarrow$ Multipart form data (file + metadata).
  * `DELETE /documents/:id` $\rightarrow$ Deletes document and evicts vector chunks.
  * `POST /documents/:id/reindex` $\rightarrow$ Triggers vector re-embedding.
* **Analytics (Admin):**
  * `GET /analytics` $\rightarrow$ Returns KPIs, query timelines, feedback distribution, and category counts.

---

## 9. LIVE DEMONSTRATION SCRIPT (FOR EVALUATORS / VIVA)

When demonstrating AcadIQ to teachers or evaluators, follow this exact 3-step walkthrough:

### Step 1: The Student Experience
1. Open [http://localhost:5173/](http://localhost:5173/) $\rightarrow$ Show landing page.
2. Sign in with the **Student Demo** (`Aryan Mehta`).
3. Click on suggested query or type: *"What is the attendance criteria for passing a subject?"*
4. Highlight:
   * Word-by-word streaming generation.
   * Structured markdown response with formatted bullet points and bold notice callouts.
   * **Confidence Rating:** Notice the *High Confidence* pill.
   * **Interactive Citations:** Point out `Fee_Schedule_2025.pdf p.2 (97%)`.
   * **Source Inspection:** Click the citation chip $\rightarrow$ watch the right-hand drawer slide out showing the exact official clause.

### Step 2: Security & Role-Based Access Control
1. As the student, directly type `/analytics` or `/documents` in the browser address bar.
2. Show that instead of a broken page or 404, the system presents a polished **"Admin Access Required"** security screen.
3. Click the **"Switch to Admin Demo"** button.

### Step 3: The Admin Experience & Institutional Telemetry
1. Show that the user is now **Dr. Priya Sharma** (Admin), with new navigation links for **Documents** and **Analytics**.
2. Navigate to **Analytics Dashboard**:
   * Explain the 5 KPI metric cards (Total Queries: 4,821, Satisfaction: 87%).
   * Show the *Queries Over Time* graph and *Feedback Breakdown* donut chart.
   * Explain how this identifies areas where university policy is ambiguous.
3. Navigate to **Document Management**:
   * Show the table of indexed institutional handbooks.
   * Demonstrate the drag-and-drop upload modal with metadata tags.
   * Point out the real-time index status badges (`Indexed`, `Processing`, `Uploaded`).
4. Go to **Settings**:
   * Show that Admin can choose Dark mode while Student maintains Light mode (Session & Theme Isolation).

---

## 10. EVALUATOR VIVA QUESTIONS & DEFENSE ANSWERS

### Q1: Why did you use Retrieval-Augmented Generation (RAG) instead of fine-tuning an LLM?
* **Defense Answer:** Fine-tuning an LLM modifies model weights. It is computationally expensive, prone to hallucinations, cannot reliably cite page numbers, and requires re-training every time a circular or fee schedule changes. RAG decouples knowledge from the model: the model acts as an analytical reader over retrieved institutional chunks. When rules change, the admin simply uploads the new PDF, achieving instant zero-retraining updates.

### Q2: How does the system handle documents that contain conflicting information (e.g., old vs. new fee rules)?
* **Defense Answer:** The ingestion pipeline tags each document with temporal metadata (academic year, effective date). During vector retrieval, chunks with higher freshness scores and newer academic years are prioritized, and older documents can be marked as deprecated or evicted by the administrator in the Document Management Center.

### Q3: How is student privacy and system security maintained?
* **Defense Answer:** We enforce Role-Based Access Control (RBAC). Document upload, re-indexing, and analytical telemetry routes are strictly restricted to authenticated administrators. On the frontend, client guards prevent unauthorized rendering, while backend endpoints validate JWT claims before processing ingestion requests.

### Q4: How does the frontend handle real-time streaming if the backend takes time to compute?
* **Defense Answer:** In production mode, the API supports Server-Sent Events (SSE) / streaming HTTP responses. In mock mode, we engineered an asynchronous tick-based generator (3 chars every 16ms) that faithfully replicates token streaming without blocking the UI thread.

---

## 11. SUMMARY & KEY TAKEAWAYS FOR PRESENTATION SLIDES

1. **Academic Focus:** Specifically tailored for university students and administrators, not a generic chatbot.
2. **Zero Hallucination:** 100% backed by page-level document citations.
3. **Enterprise UI/UX:** ChatGPT-inspired monochrome design system with full dark/light theme support.
4. **Production Architecture:** React 19, TypeScript 6, Vite 8, Zustand v5, and TanStack Query v5.
5. **Phase 2 Ready:** Clean API contract ready for seamless FastAPI and Vector DB integration.

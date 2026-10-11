import {
  type Chat,
  type ChatSummary,
  type Document,
  type AnalyticsData,
  type Message,
  type Citation,
} from '../types';
import { generateId } from '../lib/utils';

// ─── Citations ────────────────────────────────────────────────────────────────

const citations: Citation[] = [
  {
    id: 'cit-1',
    documentId: 'doc-1',
    documentName: 'BCA_Syllabus_2024.pdf',
    pageNumber: 12,
    relevanceScore: 94,
    snippet:
      'Students must maintain a minimum of 75% attendance in each subject to be eligible to appear in the semester examination. Medical grounds may be considered with valid documentation.',
    matchedText: '75% attendance',
  },
  {
    id: 'cit-2',
    documentId: 'doc-2',
    documentName: 'Exam_Rules_2025.pdf',
    pageNumber: 4,
    relevanceScore: 87,
    snippet:
      'A student with less than 75% attendance shall not be permitted to sit for the end-semester examination. The Principal may condone a shortfall up to 10% for reasons beyond the student\'s control.',
    matchedText: 'less than 75% attendance shall not be permitted',
  },
  {
    id: 'cit-3',
    documentId: 'doc-5',
    documentName: 'Academic_Regulations_2024.pdf',
    pageNumber: 8,
    relevanceScore: 72,
    snippet:
      'Attendance is computed based on the number of lectures, tutorials, and practicals conducted. Condonation beyond 10% requires approval from the Academic Council.',
    matchedText: 'Attendance is computed based on',
  },
];

const feeCitations: Citation[] = [
  {
    id: 'cit-4',
    documentId: 'doc-3',
    documentName: 'Fee_Schedule_2025.pdf',
    pageNumber: 2,
    relevanceScore: 97,
    snippet:
      'Semester fees must be paid on or before the 15th of July (Odd Semester) and 15th of January (Even Semester). A late fee of ₹500 per day will be charged after the due date, up to a maximum of 10 days.',
    matchedText: '15th of July (Odd Semester) and 15th of January',
  },
  {
    id: 'cit-5',
    documentId: 'doc-3',
    documentName: 'Fee_Schedule_2025.pdf',
    pageNumber: 3,
    relevanceScore: 81,
    snippet:
      'Students who fail to pay fees within the extended period (10 days after due date) will have their names removed from the rolls and will need to apply for re-admission with a reinstatement fee of ₹2,000.',
    matchedText: 'removed from the rolls',
  },
];

// ─── Messages ─────────────────────────────────────────────────────────────────

function makeMessages(chatId: string): Message[] {
  return [
    {
      id: `msg-${chatId}-1`,
      chatId,
      role: 'user',
      content: 'What is the attendance criteria for passing a subject?',
      timestamp: '2024-11-20T09:00:00Z',
    },
    {
      id: `msg-${chatId}-2`,
      chatId,
      role: 'assistant',
      content: `## Attendance Criteria

Students are required to maintain a **minimum of 75% attendance** in each subject to be eligible for the semester examination.

### Key Points:
- Attendance is calculated across **lectures, tutorials, and practicals**
- A maximum **10% condonation** may be granted by the Principal for valid reasons (medical, sports, etc.)
- Requests for condonation must be submitted with **supporting documents** before the examination form submission deadline
- Students below 65% attendance are **not eligible** for condonation and will be detained

> ⚠️ Students with attendance below the required threshold will not receive their hall ticket.

If you need to check your current attendance, contact your **Class Teacher** or access the **Student Portal**.`,
      citations,
      confidence: 'high',
      timestamp: '2024-11-20T09:00:05Z',
    },
    {
      id: `msg-${chatId}-3`,
      chatId,
      role: 'user',
      content: 'When is the last date to pay semester fees?',
      timestamp: '2024-11-20T09:05:00Z',
    },
    {
      id: `msg-${chatId}-4`,
      chatId,
      role: 'assistant',
      content: `## Semester Fee Payment Deadlines

| Semester | Due Date |
|----------|----------|
| **Odd Semester** (Jul–Nov) | **15th July** |
| **Even Semester** (Jan–May) | **15th January** |

### Late Fee Policy:
- ₹500/day charged after the due date
- Maximum late fee window: **10 days**
- After 10 days: name removed from rolls

### Re-admission:
If removed from rolls, a **reinstatement fee of ₹2,000** is required along with a re-admission application to the accounts section.

**Payment Modes:** Online (student portal), Bank transfer, Demand Draft payable to the institution.`,
      citations: feeCitations,
      confidence: 'high',
      timestamp: '2024-11-20T09:05:08Z',
    },
  ];
}

// ─── Chats ────────────────────────────────────────────────────────────────────

export const mockChats: Chat[] = [
  {
    id: 'chat-1',
    title: 'Attendance & Exam Eligibility',
    userId: 'user-1',
    messages: makeMessages('chat-1'),
    createdAt: '2024-11-20T09:00:00Z',
    updatedAt: '2024-11-20T09:05:08Z',
    category: 'Exam Rules',
    department: 'Computer Science',
    semester: 3,
  },
  {
    id: 'chat-2',
    title: 'Hostel Admission Process',
    userId: 'user-1',
    messages: [
      {
        id: 'msg-c2-1',
        chatId: 'chat-2',
        role: 'user',
        content: 'What documents are required for hostel admission?',
        timestamp: '2024-11-18T14:00:00Z',
      },
      {
        id: 'msg-c2-2',
        chatId: 'chat-2',
        role: 'assistant',
        content: `## Hostel Admission Documents

You will need the following documents for hostel admission:

1. **Hostel Admission Form** (from administration office)
2. **Allotment Letter** from the Warden
3. **Anti-Ragging Affidavit** (signed by student + parent)
4. **Medical Fitness Certificate** from a registered MBBS doctor
5. **Character Certificate** from previous institution (for new students)
6. **2 Passport-size photographs**
7. **ID Proof** (Aadhar Card copy)
8. **Fee Receipt** (first semester hostel fee must be paid in advance)

### Submission:
Documents must be submitted to the **Hostel Office** between **9 AM – 1 PM** on working days.

The allotment is done on a **first-come, first-served** basis, subject to room availability.`,
        citations: [
          {
            id: 'cit-h1',
            documentId: 'doc-4',
            documentName: 'Hostel_Policy_2024.pdf',
            pageNumber: 5,
            relevanceScore: 96,
            snippet:
              'All students seeking hostel accommodation must submit the required documents along with the first semester hostel fees. Anti-ragging affidavit is mandatory.',
            matchedText: 'required documents along with the first semester hostel fees',
          },
        ],
        confidence: 'high',
        timestamp: '2024-11-18T14:00:10Z',
      },
    ],
    createdAt: '2024-11-18T14:00:00Z',
    updatedAt: '2024-11-18T14:00:10Z',
    category: 'Hostel Policy',
  },
  {
    id: 'chat-3',
    title: 'Placement Eligibility Criteria',
    userId: 'user-1',
    messages: [
      {
        id: 'msg-c3-1',
        chatId: 'chat-3',
        role: 'user',
        content: 'What are the placement eligibility criteria?',
        timestamp: '2024-11-15T11:00:00Z',
      },
      {
        id: 'msg-c3-2',
        chatId: 'chat-3',
        role: 'assistant',
        content: `## Placement Eligibility Criteria

### Academic Requirements:
| Criterion | Minimum Requirement |
|-----------|---------------------|
| CGPA | **6.0 / 10** (or 60% aggregate) |
| Active Backlogs | **0** (no active backlogs at time of placement) |
| Historical Backlogs | Maximum **2** (company-specific) |
| Attendance | **75%** in current semester |

### Process:
1. Register on the **Placement Portal** before the deadline
2. Attend the **Pre-Placement Talk (PPT)**
3. Appear for **Aptitude / Technical Round**
4. **HR Interview**

> Students placed in one company **cannot apply** to another (as per fair placement policy).`,
        citations: [
          {
            id: 'cit-p1',
            documentId: 'doc-6',
            documentName: 'Placement_Policy_2024.pdf',
            pageNumber: 3,
            relevanceScore: 92,
            snippet:
              'Students must have a minimum CGPA of 6.0 and no active backlogs to be eligible for campus placements. Students with more than 2 historical backlogs may be restricted by specific companies.',
            matchedText: 'minimum CGPA of 6.0 and no active backlogs',
          },
        ],
        confidence: 'high',
        timestamp: '2024-11-15T11:00:09Z',
      },
    ],
    createdAt: '2024-11-15T11:00:00Z',
    updatedAt: '2024-11-15T11:00:09Z',
    category: 'Placement Policy',
  },
  {
    id: 'chat-4',
    title: 'CGPA Calculation Method',
    userId: 'user-1',
    messages: [],
    createdAt: '2024-11-10T08:00:00Z',
    updatedAt: '2024-11-10T08:00:00Z',
    category: 'Syllabus',
  },
];

export const mockChatSummaries: ChatSummary[] = mockChats.map((c) => ({
  id: c.id,
  title: c.title,
  lastMessage:
    c.messages.length > 0
      ? c.messages[c.messages.length - 1].content.slice(0, 60) + '…'
      : 'No messages yet',
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
}));

// ─── Documents ────────────────────────────────────────────────────────────────

export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'BCA_Syllabus_2024.pdf',
    category: 'Syllabus',
    department: 'BCA',
    semester: 1,
    uploadDate: '2024-08-01T10:00:00Z',
    size: 2_450_000,
    status: 'indexed',
    pageCount: 48,
    uploadedBy: 'admin@university.edu',
    description: 'BCA Semester 1–6 complete syllabus 2024 batch',
  },
  {
    id: 'doc-2',
    name: 'Exam_Rules_2025.pdf',
    category: 'Exam Rules',
    department: 'All Departments',
    uploadDate: '2024-10-15T09:30:00Z',
    size: 890_000,
    status: 'indexed',
    pageCount: 18,
    uploadedBy: 'admin@university.edu',
    description: 'Examination rules and regulations for 2025',
  },
  {
    id: 'doc-3',
    name: 'Fee_Schedule_2025.pdf',
    category: 'Fee Policy',
    department: 'All Departments',
    uploadDate: '2024-09-10T11:00:00Z',
    size: 540_000,
    status: 'indexed',
    pageCount: 10,
    uploadedBy: 'admin@university.edu',
    description: 'Fee schedule and payment deadlines for 2025',
  },
  {
    id: 'doc-4',
    name: 'Hostel_Policy_2024.pdf',
    category: 'Hostel Policy',
    department: 'All Departments',
    uploadDate: '2024-07-20T08:00:00Z',
    size: 720_000,
    status: 'indexed',
    pageCount: 24,
    uploadedBy: 'admin@university.edu',
  },
  {
    id: 'doc-5',
    name: 'Academic_Regulations_2024.pdf',
    category: 'General',
    department: 'All Departments',
    uploadDate: '2024-07-01T07:00:00Z',
    size: 1_200_000,
    status: 'indexed',
    pageCount: 36,
    uploadedBy: 'admin@university.edu',
  },
  {
    id: 'doc-6',
    name: 'Placement_Policy_2024.pdf',
    category: 'Placement Policy',
    department: 'All Departments',
    uploadDate: '2024-09-05T10:00:00Z',
    size: 680_000,
    status: 'indexed',
    pageCount: 14,
    uploadedBy: 'admin@university.edu',
  },
  {
    id: 'doc-7',
    name: 'MCA_Syllabus_2024.pdf',
    category: 'Syllabus',
    department: 'MCA',
    semester: 1,
    uploadDate: '2024-08-03T10:00:00Z',
    size: 1_890_000,
    status: 'indexed',
    pageCount: 52,
    uploadedBy: 'admin@university.edu',
  },
  {
    id: 'doc-8',
    name: 'Library_Rules_2024.pdf',
    category: 'Library',
    department: 'All Departments',
    uploadDate: '2024-08-15T12:00:00Z',
    size: 320_000,
    status: 'indexed',
    pageCount: 8,
    uploadedBy: 'admin@university.edu',
  },
  {
    id: 'doc-9',
    name: 'Scholarship_Guidelines_2025.pdf',
    category: 'Scholarship',
    department: 'All Departments',
    uploadDate: '2024-11-01T09:00:00Z',
    size: 450_000,
    status: 'processing',
    uploadedBy: 'admin@university.edu',
  },
  {
    id: 'doc-10',
    name: 'CS_Lab_Manual_Sem3.pdf',
    category: 'Notes',
    department: 'Computer Science',
    semester: 3,
    uploadDate: '2024-11-18T14:00:00Z',
    size: 3_200_000,
    status: 'uploaded',
    pageCount: 120,
    uploadedBy: 'faculty@university.edu',
  },
  {
    id: 'doc-11',
    name: 'Anti_Ragging_Policy.pdf',
    category: 'General',
    department: 'All Departments',
    uploadDate: '2024-06-10T08:00:00Z',
    size: 280_000,
    status: 'indexed',
    pageCount: 6,
    uploadedBy: 'admin@university.edu',
  },
  {
    id: 'doc-12',
    name: 'Sports_Circular_Nov2024.pdf',
    category: 'Circulars',
    department: 'All Departments',
    uploadDate: '2024-11-05T11:00:00Z',
    size: 190_000,
    status: 'failed',
    uploadedBy: 'admin@university.edu',
  },
];

// ─── Analytics ────────────────────────────────────────────────────────────────

export const mockAnalytics: AnalyticsData = {
  kpis: {
    totalQueries: 4_821,
    totalQueriesTrend: 12.4,
    activeUsers: 342,
    activeUsersTrend: 8.1,
    documentsIndexed: 11,
    documentsIndexedTrend: 10,
    avgResponseTime: 1.4,
    avgResponseTimeTrend: -0.2,
    satisfactionRate: 87,
    satisfactionRateTrend: 3.2,
  },
  queriesOverTime: [
    { date: '2024-10-21', queries: 92, uniqueUsers: 41 },
    { date: '2024-10-22', queries: 118, uniqueUsers: 55 },
    { date: '2024-10-23', queries: 134, uniqueUsers: 63 },
    { date: '2024-10-24', queries: 89, uniqueUsers: 38 },
    { date: '2024-10-25', queries: 67, uniqueUsers: 29 },
    { date: '2024-10-26', queries: 45, uniqueUsers: 18 },
    { date: '2024-10-27', queries: 52, uniqueUsers: 21 },
    { date: '2024-10-28', queries: 156, uniqueUsers: 72 },
    { date: '2024-10-29', queries: 178, uniqueUsers: 84 },
    { date: '2024-10-30', queries: 201, uniqueUsers: 91 },
    { date: '2024-10-31', queries: 187, uniqueUsers: 78 },
    { date: '2024-11-01', queries: 143, uniqueUsers: 61 },
    { date: '2024-11-02', queries: 77, uniqueUsers: 33 },
    { date: '2024-11-03', queries: 58, uniqueUsers: 24 },
    { date: '2024-11-04', queries: 162, uniqueUsers: 68 },
    { date: '2024-11-05', queries: 189, uniqueUsers: 86 },
    { date: '2024-11-06', queries: 215, uniqueUsers: 97 },
    { date: '2024-11-07', queries: 196, uniqueUsers: 88 },
    { date: '2024-11-08', queries: 171, uniqueUsers: 76 },
    { date: '2024-11-09', queries: 93, uniqueUsers: 42 },
    { date: '2024-11-10', queries: 69, uniqueUsers: 31 },
  ],
  topCategories: [
    { category: 'Exam Rules', count: 1243 },
    { category: 'Fee Policy', count: 987 },
    { category: 'Syllabus', count: 821 },
    { category: 'Hostel Policy', count: 634 },
    { category: 'Placement Policy', count: 521 },
    { category: 'Circulars', count: 312 },
    { category: 'Scholarship', count: 198 },
    { category: 'Library', count: 105 },
  ],
  feedbackSplit: [
    { name: 'Helpful', value: 3842 },
    { name: 'Not Helpful', value: 541 },
    { name: 'No Feedback', value: 438 },
  ],
  topQuestions: [
    {
      id: 'q1',
      question: 'What is the attendance criteria for passing?',
      count: 312,
      category: 'Exam Rules',
      avgConfidence: 'high',
    },
    {
      id: 'q2',
      question: 'When is the last date to pay fees?',
      count: 287,
      category: 'Fee Policy',
      avgConfidence: 'high',
    },
    {
      id: 'q3',
      question: 'What are the placement eligibility criteria?',
      count: 241,
      category: 'Placement Policy',
      avgConfidence: 'high',
    },
    {
      id: 'q4',
      question: 'How is CGPA calculated?',
      count: 198,
      category: 'Syllabus',
      avgConfidence: 'medium',
    },
    {
      id: 'q5',
      question: 'What documents are required for hostel admission?',
      count: 176,
      category: 'Hostel Policy',
      avgConfidence: 'high',
    },
  ],
  lowConfidenceQuestions: [
    {
      id: 'lq1',
      question: 'Is there any summer internship program by the university?',
      confidence: 28,
      asked: 54,
      lastAsked: '2024-11-10T14:00:00Z',
    },
    {
      id: 'lq2',
      question: 'Can I change my elective after the semester starts?',
      confidence: 34,
      asked: 41,
      lastAsked: '2024-11-09T11:00:00Z',
    },
    {
      id: 'lq3',
      question: 'How do I apply for a gap year?',
      confidence: 21,
      asked: 38,
      lastAsked: '2024-11-08T09:00:00Z',
    },
    {
      id: 'lq4',
      question: 'What is the process for semester freeze?',
      confidence: 42,
      asked: 29,
      lastAsked: '2024-11-07T16:00:00Z',
    },
  ],
};

// ─── Mock users ───────────────────────────────────────────────────────────────

export const mockUsers = {
  student: {
    id: 'user-1',
    name: 'Aryan Mehta',
    email: 'aryan.mehta@student.university.edu',
    role: 'student' as const,
    department: 'Computer Science',
    semester: 5,
    createdAt: '2024-07-15T00:00:00Z',
  },
  admin: {
    id: 'admin-1',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@university.edu',
    role: 'admin' as const,
    department: 'Administration',
    createdAt: '2023-01-01T00:00:00Z',
  },
};

// ─── Mock response generator ──────────────────────────────────────────────────

export function generateMockResponse(query: string): {
  content: string;
  citations: Citation[];
  confidence: 'high' | 'medium' | 'low';
} {
  const lower = query.toLowerCase();

  if (lower.includes('attendance')) {
    return {
      content: `## Attendance Policy

Students must maintain a **minimum of 75% attendance** in each subject to be eligible for the semester examinations.

### Details:
- Attendance is tracked across lectures, tutorials, and practicals
- The Principal may condone up to **10% shortage** for valid reasons
- Attendance below **65%** is not eligible for condonation
- Students will be detained and must re-appear in the next academic year

### How to Check Attendance:
Access the **Student Portal → My Profile → Attendance** section to view subject-wise attendance.`,
      citations,
      confidence: 'high',
    };
  }

  if (lower.includes('fee') || lower.includes('payment')) {
    return {
      content: `## Fee Payment Information

Semester fees are due on:
- **Odd Semester:** 15th July
- **Even Semester:** 15th January

A late fee of **₹500/day** applies after the due date for up to 10 days. After 10 days, re-enrollment is required.`,
      citations: feeCitations,
      confidence: 'high',
    };
  }

  if (lower.includes('hostel')) {
    return {
      content: `## Hostel Information

Hostel accommodation is available for outstation students on a first-come, first-served basis.

### Required Documents:
1. Hostel Admission Form
2. Anti-Ragging Affidavit
3. Medical Fitness Certificate
4. ID Proof (Aadhar Card)
5. 2 passport-size photographs`,
      citations: [
        {
          id: generateId(),
          documentId: 'doc-4',
          documentName: 'Hostel_Policy_2024.pdf',
          pageNumber: 5,
          relevanceScore: 91,
          snippet: 'Hostel accommodation is available on a first-come, first-served basis subject to room availability.',
          matchedText: 'first-come, first-served basis',
        },
      ],
      confidence: 'high',
    };
  }

  if (lower.includes('placement')) {
    return {
      content: `## Placement Eligibility

To be eligible for campus placements, students must meet the following criteria:

| Criterion | Requirement |
|-----------|-------------|
| CGPA | ≥ 6.0 |
| Active Backlogs | 0 |
| Attendance | ≥ 75% |

Register on the **Placement Portal** before the deadline to participate.`,
      citations: [
        {
          id: generateId(),
          documentId: 'doc-6',
          documentName: 'Placement_Policy_2024.pdf',
          pageNumber: 3,
          relevanceScore: 89,
          snippet: 'Students must have a minimum CGPA of 6.0 and no active backlogs to appear for campus placements.',
          matchedText: 'minimum CGPA of 6.0',
        },
      ],
      confidence: 'high',
    };
  }

  if (lower.includes('exam') || lower.includes('cgpa') || lower.includes('grade')) {
    return {
      content: `## CGPA Calculation

CGPA is computed as:

\`\`\`
CGPA = Σ (Credit × Grade Points) / Σ Credits
\`\`\`

### Grade Scale:
| Grade | Points | Percentage Range |
|-------|--------|------------------|
| O | 10 | 90–100% |
| A+ | 9 | 80–89% |
| A | 8 | 70–79% |
| B+ | 7 | 60–69% |
| B | 6 | 50–59% |
| C | 5 | 40–49% |
| F | 0 | < 40% |`,
      citations: [
        {
          id: generateId(),
          documentId: 'doc-5',
          documentName: 'Academic_Regulations_2024.pdf',
          pageNumber: 14,
          relevanceScore: 88,
          snippet:
            'CGPA is calculated as the weighted average of grade points obtained in all semesters based on the credit system.',
          matchedText: 'weighted average of grade points',
        },
      ],
      confidence: 'high',
    };
  }

  // Generic fallback
  return {
    content: `I found some relevant information regarding your query about **"${query}"**.

Based on the available university documents, here is what I could find:

The university maintains comprehensive policies and guidelines for all academic and administrative processes. For specific information related to your query, I recommend:

1. Checking the **Academic Regulations 2024** document
2. Contacting your **Department Coordinator**
3. Visiting the **Student Services Portal**

*Note: This answer is based on the documents currently indexed in the system. For the most accurate information, please verify with the administration office.*`,
    citations: [
      {
        id: generateId(),
        documentId: 'doc-5',
        documentName: 'Academic_Regulations_2024.pdf',
        pageNumber: 1,
        relevanceScore: 45,
        snippet: 'General academic regulations and student guidelines for the academic year 2024–25.',
        matchedText: query.split(' ').slice(0, 3).join(' '),
      },
    ],
    confidence: 'low',
  };
}

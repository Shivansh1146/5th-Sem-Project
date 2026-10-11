export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  CHAT: '/chat',
  CHAT_ID: '/chat/:id',
  DOCUMENTS: '/admin/documents',
  ANALYTICS: '/admin/analytics',
  SETTINGS: '/settings',
} as const;

export const CATEGORIES = [
  'Syllabus',
  'Exam Rules',
  'Circulars',
  'Notes',
  'Fee Policy',
  'Hostel Policy',
  'Placement Policy',
  'Scholarship',
  'Library',
  'General',
] as const;

export const DEPARTMENTS = [
  'All Departments',
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'MBA',
  'MCA',
  'BCA',
  'BCom',
] as const;

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const SUGGESTED_QUESTIONS = [
  'What is the attendance criteria for passing a subject?',
  'When is the last date to pay semester fees?',
  'What documents are required for hostel admission?',
  'How is the CGPA calculated for final results?',
  'What is the exam re-evaluation process?',
  'What are the placement eligibility criteria?',
  'How many backlogs are allowed for placements?',
  'What is the library borrowing limit per student?',
];

export const CONFIDENCE_LABELS: Record<string, string> = {
  high: 'High Confidence',
  medium: 'Medium Confidence',
  low: 'Low Confidence',
};

export const STATUS_LABELS: Record<string, string> = {
  uploaded: 'Uploaded',
  processing: 'Processing',
  indexed: 'Indexed',
  failed: 'Failed',
};

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  deadline?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  completionProbability?: number;
  recoveryRecommendation?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  order: number;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId?: string;
  milestoneId?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedDuration: number; // in hours
  durationMinutes?: number; // fallback/actual duration
  dependencies: string[]; // task IDs
  deadline?: string;
  createdAt: number;
  scheduledTime?: string; // e.g. "2026-06-25 10:00:00"
  sender?: string;
  attachments?: { name: string; url: string; type?: string }[];
  order?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  taskId?: string;
  synced: boolean;
  googleEventId?: string;
}

export interface StudyPlan {
  id: string;
  subject: string;
  syllabus: string;
  weeklyTargetHours: number;
  examDate?: string;
  examReadinessScore?: number; // 0-100
  subjectBreakdown?: string;
  dailyPlan: {
    day: string;
    topic: string;
    hours: number;
    completed: boolean;
  }[];
  weeklyTargets: string[];
  revisionSchedule: string[];
  createdAt: number;
}

export interface DailyBriefing {
  id: string;
  date: string;
  priorities: string[];
  deadlines: { task: string; time: string }[];
  suggestedSchedule: { activity: string; time: string }[];
  motivationSummary: string;
}

export interface ProductivityAnalytics {
  completionRate: number; // percentage
  productivityScore: number; // 0-100
  focusScore: number; // 0-100
  weeklyTrends: { name: string; completed: number; target: number }[];
  deadlineSuccessRate: number; // percentage
  velocity: number; // hours of tasks completed per week
}

export interface AIConversationMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  createdAt: number;
  read: boolean;
}

export interface AIInsight {
  id: string;
  text: string;
  type: 'productivity' | 'schedule' | 'academic' | 'email';
  createdAt: number;
  from: string;
}

export interface ReadHistoryItem {
  id: string;
  subject: string;
  sender: string;
  source: string;
  readAt: number;
  summary: string;
  tasksCreated: string[];
}


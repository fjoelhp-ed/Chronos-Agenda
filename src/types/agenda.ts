export type Priority = 'low' | 'medium' | 'high';

export type ActivityType = 'task' | 'event' | 'reminder';

export type RecurrenceFrequency = 'none' | 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval?: number; // e.g. every 2 weeks
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  endDate?: string; // YYYY-MM-DD
  count?: number; // e.g. repeat 10 times
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  type: ActivityType;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm (24h)
  endTime?: string; // HH:mm (24h)
  completed: boolean;
  completedAt?: string; // ISO date
  priority: Priority;
  categoryId: string;
  recurrence?: RecurrenceRule;
  reminderMinutesBefore?: number; // e.g. 0, 5, 15, 30, 60
  googleEventId?: string;
  isSyncedWithGoogle?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // hex
  icon: string; // Lucide icon name
}

export interface WidgetConfig {
  id: string;
  name: string;
  type: 'glance_2x2' | 'agenda_4x2' | 'calendar_4x4' | 'lockscreen';
  os: 'android' | 'ios';
  theme: 'material_you' | 'dark' | 'light' | 'amoled' | 'pastel' | 'glass';
  accentColor: string;
  showCompleted: boolean;
  filterCategoryId?: string;
  opacity: number; // 50 - 100
  roundedCorners: 'sm' | 'md' | 'lg' | 'full';
}

export type SortCriterion = 'priority' | 'time' | 'title' | 'completed';

export interface DashboardCardsVisibility {
  progress: boolean;
  streak: boolean;
  priorityMatrix: boolean;
  quickAdd: boolean;
  categoryChips: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'amoled' | 'glass';
  accentPreset: 'android_teal' | 'indigo' | 'coral' | 'emerald' | 'amber';
  deviceShell: 'responsive' | 'android' | 'ios';
  dashboardMode: 'full' | 'essential';
  visibleCards: DashboardCardsVisibility;
  sortBy: SortCriterion;
  sortAscending: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  autoLockMinutes: number; // 0 = disabled, 1, 5, 15
  biometricsEnabled: boolean;
  encryptionEnabled: boolean;
  lastGoogleSync?: string;
  autoSyncGoogle: boolean;
  hasSeenTutorial: boolean;
}

export interface VaultState {
  isLocked: boolean;
  hasPassphrase: boolean;
  biometricRegistered: boolean;
}

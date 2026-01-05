export type ViewState = 'onboarding' | 'dashboard' | 'coach' | 'finance' | 'profile';

export interface UserProfile {
  name: string;
  focusArea: 'career' | 'health' | 'studies' | 'finance' | 'general';
  disciplineLevel: number; // 1-10
  availableTime: number; // minutes per day
  isOnboarded: boolean;
  isPremium: boolean;
}

export type Frequency = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  title: string;
  frequency: Frequency;
  customDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  completedDates: string[]; // ISO date strings (YYYY-MM-DD)
  xpReward: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  xpReward: number;
  category: 'habit' | 'todo';
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  lastLoginDate: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
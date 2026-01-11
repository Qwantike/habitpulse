export interface User {
  id: number;
  email: string;
  username: string;
}


export type HabitType = 'boolean' | 'numeric';
export type HabitPeriod = 'daily' | 'weekly';

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: HabitType;
  period: HabitPeriod; // New field
  goal?: number; // e.g., 10000 steps, or undefined for boolean
  unit?: string; // e.g., "steps", "pages"
  color: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // ISO date string YYYY-MM-DD
  value: number; // 1 for boolean true, 0 for false, or actual number
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface WeeklyStats {
  date: string;
  completionRate: number;
}

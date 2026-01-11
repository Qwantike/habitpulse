import { User, Habit, HabitLog, AuthResponse } from '../types';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

const STORAGE_KEYS = {
  USER: 'habitpulse_user',
  TOKEN: 'habitpulse_token',
};

// Helper for headers
const getHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// --- Auth Services ---

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {

  const payload = { email, password: password || 'password123', username: email.split('@')[0] };

  try {
    // Try Login
    let res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: payload.password }),
    });

    if (!res.ok) {
      // Try Register if login fails (simple fallback for demo UX)
      res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) throw new Error('Auth failed');

    const data: AuthResponse = await res.json();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    return data;
  } catch (e) {
    throw e;
  }
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

export const getSession = async (): Promise<User | null> => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
    });

    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    logout();
    return null;
  }
};


// --- Habit Services ---

export const getHabits = async (): Promise<Habit[]> => {
  const res = await fetch(`${API_URL}/habits`, { headers: getHeaders() });
  if (!res.ok) return [];
  return res.json();
};

export const createHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'userId'>): Promise<Habit> => {
  const res = await fetch(`${API_URL}/habits`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(habit),
  });
  if (!res.ok) throw new Error('Failed to create habit');
  return res.json();
};

export const deleteHabit = async (habitId: string): Promise<void> => {
  await fetch(`${API_URL}/habits/${habitId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
};

// --- Log Services ---

export const getLogs = async (): Promise<HabitLog[]> => {
  const res = await fetch(`${API_URL}/habits/logs`, { headers: getHeaders() });
  if (!res.ok) return [];
  return res.json();
};

export const logHabit = async (habitId: string, date: string, value: number): Promise<HabitLog> => {
  const res = await fetch(`${API_URL}/habits/logs`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ habitId, date, value }),
  });
  if (!res.ok) throw new Error('Failed to log');
  return res.json();
};

// --- Initial Data Seeding (for demo purposes) ---
export const seedData = () => {
  // No-op for backend version, or could trigger a backend seed endpoint
};

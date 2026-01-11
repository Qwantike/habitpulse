// services/logApi.ts
import { HabitLog } from '../types';
import { API_URL, getHeaders } from './api';

export const getLogs = async (): Promise<HabitLog[]> => {
    const res = await fetch(`${API_URL}/habits/logs`, {
        headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
};

export const logHabit = async (
    habitId: string,
    date: string,
    value: number
): Promise<HabitLog> => {
    const res = await fetch(`${API_URL}/habits/logs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ habitId, date, value }),
    });

    if (!res.ok) throw new Error('Failed to log');
    return res.json();
};

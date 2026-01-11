// services/habitApi.ts
import { Habit } from '../types';
import { API_URL, getHeaders } from './api';

export const getHabits = async (): Promise<Habit[]> => {
    const res = await fetch(`${API_URL}/habits`, {
        headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
};

export const createHabit = async (
    habit: Omit<Habit, 'id' | 'createdAt' | 'userId'>
): Promise<Habit> => {
    const res = await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(habit),
    });

    if (!res.ok) throw new Error('Failed to create habit');
    return res.json();
};

export const deleteHabit = async (habitId: string) => {
    await fetch(`${API_URL}/habits/${habitId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
};

// services/authApi.ts
import { AuthResponse, User } from '../types';
import { API_URL, STORAGE_KEYS, getHeaders } from './api';

export const login = async (
    email: string,
    password: string
): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Invalid credentials');
    }

    const data: AuthResponse = await res.json();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    return data;
};

export const register = async (
    email: string,
    password: string,
    username: string
): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
    }

    const data: AuthResponse = await res.json();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    return data;
};

export const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

export const getMe = async (): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders()
    });

    if (!res.ok) {
        throw new Error('Failed to get user');
    }

    return res.json();
};


// services/api.ts
export const API_URL =
    import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export const STORAGE_KEYS = {
    USER: 'habitpulse_user',
    TOKEN: 'habitpulse_token',
};

export const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

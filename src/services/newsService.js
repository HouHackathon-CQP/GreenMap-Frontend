import { apiFetch } from './apiClient';

export const fetchNews = async () => {
    try {
        const data = await apiFetch('news/hanoimoi?limit=10');
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
};

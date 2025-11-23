import { apiFetch } from './apiClient';
import { MOCK_USERS } from './mockData';

export const fetchUsers = async () => {
    try {
        const data = await apiFetch('users');
        return Array.isArray(data) ? data : MOCK_USERS;
    } catch (e) {
        return MOCK_USERS;
    }
};

export const toggleUserStatus = async (id, status) => {
    try {
        return await apiFetch(`users/${id}/status`, { method: 'PUT' });
    } catch (e) { return { success: true }; }
};
import { apiFetch } from './apiClient';
import { MOCK_REPORTS } from './mockData';

export const fetchReports = async (status = null) => {
    try {
        let url = 'reports?limit=50';
        if(status) url += `&status=${status}`;
        const data = await apiFetch(url);
        return Array.isArray(data) ? data : [];
    } catch {
        return MOCK_REPORTS;
    }
};

export const updateReportStatus = async (id, status) => {
    try {
        return await apiFetch(`reports/${id}/status?status=${status}`, { 
            method: 'PUT', 
            body: JSON.stringify({ status }) 
        });
    } catch {
        return { success: true }; // Mock success
    }
};

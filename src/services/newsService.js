// src/services/newsService.js
import { apiFetch } from './apiClient';

export const fetchNews = async () => {
    try {
        // Gọi API lấy tin tức môi trường (Hà Nội Mới hoặc nguồn khác backend config)
        // limit=20 để lấy đủ hiển thị
        const data = await apiFetch('news/hanoimoi?limit=20');
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("News API Error:", error);
        return []; // Trả về rỗng nếu lỗi để UI không crash
    }
};
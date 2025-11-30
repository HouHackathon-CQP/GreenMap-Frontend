import { apiFetch } from './apiClient';

// 1. LẤY DANH SÁCH BÁO CÁO
export const fetchReports = async (status = 'PENDING', skip = 0, limit = 100) => {
    try {
        const params = new URLSearchParams({
            status: status,
            skip: skip.toString(),
            limit: limit.toString()
        });
        const url = `reports?${params.toString()}`;
        const data = await apiFetch(url);
        return Array.isArray(data) ? data : (data.data || []); // Xử lý nếu API trả về {data: [...]}
    } catch (error) {
        console.error("❌ Lỗi lấy danh sách báo cáo:", error);
        return [];
    }
};

// 2. DUYỆT HOẶC TỪ CHỐI
export const updateReportStatus = async (id, status) => {
    try {
        const result = await apiFetch(`reports/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: status })
        });
        return result;
    } catch (error) {
        console.error("❌ Lỗi cập nhật trạng thái:", error);
        throw error;
    }
};

// 3. TẠO BÁO CÁO MỚI (Dùng để test)
export const createReport = async (data) => {
    try {
        // Gọi API POST: /reports
        const result = await apiFetch('reports', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return result;
    } catch (error) {
        console.error("❌ Lỗi tạo báo cáo:", error);
        throw error;
    }
};
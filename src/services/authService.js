import { apiFetch } from './apiClient';

// --- ĐĂNG NHẬP (GIỮ NGUYÊN) ---
export const loginUser = async (username, password) => {
  try {
    return await apiFetch('login', { 
        method: 'POST', 
        body: JSON.stringify({ username, password }) 
    });
  } catch (e) {
    console.error("Login Error:", e);
    throw e;
  }
};

// --- ĐĂNG XUẤT (MỚI) ---
export const logoutUser = async () => {
  // Lấy token hiện tại
  const token = localStorage.getItem('access_token');
  
  // Nếu không có token thì không cần gọi API
  if (!token) return;

  try {
    // Method thường là POST. Nếu backend của bạn dùng GET thì sửa 'POST' thành 'GET'
    await apiFetch('logout', { 
        method: 'POST',
        headers: {
            // Quan trọng: Gửi kèm Token để backend biết ai đang logout
            'Authorization': `Bearer ${token}`
        }
    });
  } catch (error) {
    // Chỉ warn nhẹ nếu lỗi (ví dụ token hết hạn), không chặn luồng logout ở client
    console.warn("API Logout warning:", error);
  }
};
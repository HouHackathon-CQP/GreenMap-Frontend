// GreenMap-Frontend/src/services/authService.js
import { apiFetch } from './apiClient';

// Lấy token dev từ .env hoặc dùng mặc định
const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN || "fake-admin-token";

export const loginUser = async (username, password) => {
  try {
    // Gọi API thật trước
    return await apiFetch('login', { 
        method: 'POST', 
        body: JSON.stringify({ username, password }) 
    });
  } catch (e) {
    console.log("⚠️ Login Error. Using Dev Fallback.");
    
    // Mock Login cho Admin (Dùng khi Backend lỗi/chưa chạy)
    if (username === 'admin' && password === '123456') {
        return { access_token: DEV_TOKEN, token_type: "bearer" };
    }
    throw e;
  }
};
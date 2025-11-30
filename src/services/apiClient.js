// src/services/apiClient.js

// Lấy URL từ biến môi trường
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiFetch = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${BASE_URL}/${cleanEndpoint}`;
  
  // --- BẮT ĐẦU SỬA: Tự động lấy Token ---
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    // Nếu có token, tự động thêm vào Header Authorization
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  // --------------------------------------

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Nếu gặp lỗi 401 (Hết hạn Token), tự động logout
    if (response.status === 401) {
        localStorage.removeItem('access_token');
        // Có thể dispatch event để App biết mà redirect về login
        window.dispatchEvent(new Event('auth:logout'));
        throw new Error('Phiên đăng nhập hết hạn (401)');
    }

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
};
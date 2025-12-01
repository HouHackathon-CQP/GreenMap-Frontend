// src/services/apiClient.js

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// --- HÀM CACHE ĐƠN GIẢN ---
const fetchWithCache = async (url, config, ttl = 5 * 60 * 1000) => { // Cache 5 phút
    const cacheKey = `cache_${url}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            // Nếu dữ liệu còn mới (chưa quá 5 phút) -> Dùng luôn, không gọi API
            if (Date.now() - timestamp < ttl) {
                console.log(`⚡ Dùng Cache cho: ${url}`);
                return data;
            }
        } catch (e) {
            console.warn("Lỗi đọc cache", e);
        }
    }

    // Nếu không có cache hoặc hết hạn -> Gọi API thật
    const response = await fetch(url, config);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();

    // Lưu vào LocalStorage để dùng cho lần sau
    try {
        localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn("LocalStorage đầy, không thể lưu cache.");
    }

    return data;
};

// --- HÀM GỌI API CHÍNH ---
export const apiFetch = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${BASE_URL}/${cleanEndpoint}`;
  
  // Tự động lấy Token
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  // Logic Cache: Chỉ áp dụng cho phương thức GET
  if (!config.method || config.method === 'GET') {
      try {
          return await fetchWithCache(url, config);
      } catch (error) {
          // Nếu lỗi mạng, thử trả về cache cũ (kể cả khi hết hạn) để cứu vãn
          console.error("Lỗi mạng, thử dùng cache cũ...", error);
          const cacheKey = `cache_${url}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) return JSON.parse(cached).data;
          throw error;
      }
  }

  // Các method khác (POST, PUT, DELETE) thì gọi thẳng không cache
  try {
    const response = await fetch(url, config);
    
    // Xử lý lỗi 401 (Hết hạn Token)
    if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login'; // Đá về trang login
        throw new Error('Phiên đăng nhập hết hạn');
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
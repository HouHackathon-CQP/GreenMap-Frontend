// src/services/apiClient.js

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// --- HÀM CACHE (Giữ nguyên) ---
const fetchWithCache = async (url, config, ttl = 5 * 60 * 1000) => { 
    const cacheKey = `cache_${url}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < ttl) {
                console.log(`⚡ Dùng Cache cho: ${url}`);
                return data;
            }
        } catch (e) { console.warn("Lỗi cache", e); }
    }

    const response = await fetch(url, config);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();

    try {
        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {}

    return data;
};

// --- HÀM FETCH CHÍNH (ĐÃ SỬA LOGIC CACHE) ---
export const apiFetch = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${BASE_URL}/${cleanEndpoint}`;
  
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = { ...options, headers };

  // --- SỬA Ở ĐÂY: CHỈ CACHE THỜI TIẾT & TRAFFIC ---
  // Các API quản trị (reports, locations...) sẽ LUÔN gọi mới
  const shouldCache = (!config.method || config.method === 'GET') && 
                      (url.includes('weather') || url.includes('traffic'));

  if (shouldCache) {
      try {
          return await fetchWithCache(url, config);
      } catch (error) {
          // Fallback nếu lỗi mạng
          const cacheKey = `cache_${url}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) return JSON.parse(cached).data;
          throw error;
      }
  }

  // Các API khác gọi thẳng (Realtime)
  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        throw new Error('Hết phiên đăng nhập');
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
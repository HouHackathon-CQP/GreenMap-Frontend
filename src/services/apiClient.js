// Copyright 2025 HouHackathon-CQP
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- CẤU HÌNH CACHE (Giữ lại tính năng này cho Weather/Traffic) ---
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

// --- HÀM FETCH CHÍNH ---
export const apiFetch = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${BASE_URL}/${cleanEndpoint}`;
  
  const token = localStorage.getItem('access_token');
  
  // Mặc định là JSON, trừ khi gửi FormData (upload ảnh)
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Nếu body là FormData thì trình duyệt tự set Content-Type
  if (options.body instanceof FormData) {
      delete headers['Content-Type'];
  }

  const config = { ...options, headers };

  // Logic Cache cho Weather/Traffic (GET method only)
  const shouldCache = (!config.method || config.method === 'GET') && 
                      (url.includes('weather') || url.includes('traffic'));

  if (shouldCache) {
      try {
          return await fetchWithCache(url, config);
      } catch (error) {
          // Fallback nếu lỗi mạng thì lấy cache cũ
          const cacheKey = `cache_${url}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) return JSON.parse(cached).data;
          // Nếu không có cache thì ném lỗi tiếp xuống dưới
      }
  }

  // --- GỌI API THỰC TẾ ---
  try {
    const response = await fetch(url, config);
    
    // XỬ LÝ LỖI (QUAN TRỌNG)
    if (!response.ok) {
        let errorMessage = `Lỗi hệ thống (${response.status})`;
        
        try {
            // Cố gắng đọc JSON lỗi từ Backend
            const errorData = await response.json();
            
            // Backend FastAPI thường trả về key 'detail'
            if (errorData.detail) {
                // Trường hợp 1: detail là chuỗi (Lỗi logic mình tự raise)
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } 
                // Trường hợp 2: detail là mảng (Lỗi validate của Pydantic)
                else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
                    errorMessage = errorData.detail[0].msg || "Dữ liệu không hợp lệ";
                }
            }
        } catch (e) {
            // Nếu response không phải JSON (ví dụ lỗi 500 HTML từ server sập)
            errorMessage = response.statusText || errorMessage;
        }

        // Xử lý hết hạn Token (401)
        if (response.status === 401) {
            console.warn("Token hết hạn hoặc không hợp lệ.");
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_info');
            // Chỉ redirect nếu không phải đang ở trang login để tránh lặp
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        // Ném lỗi ra để component (Login/Settings) bắt được và hiển thị
        throw new Error(errorMessage);
    }
    
    // Nếu OK thì trả về data
    return await response.json();
    
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
};
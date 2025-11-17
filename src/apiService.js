const BASE_URL = 'http://localhost:8000';

/**
 * Hàm xử lý gọi API chung
 * @param {string} endpoint - Đường dẫn API (ví dụ: '/locations')
 * @param {object} options - Cấu hình cho fetch (method, body, headers...)
 * @returns {Promise<any>} - Dữ liệu JSON trả về
 */
async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Lỗi không xác định" }));
      throw new Error(errorData.detail || `Lỗi ${response.status}`);
    }
    
    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`Lỗi khi gọi API ${endpoint}:`, error);
    throw error;
  }
}

// --- API cho Địa điểm (Locations) ---

/**
 * Lấy danh sách các địa điểm (Trạm sạc, Điểm xanh...)
 * (Hàm này không cache vì dữ liệu CSDL có thể thay đổi)
 * @param {string | null} locationType - Loại địa điểm
 * @returns {Promise<Array>} - Danh sách địa điểm
 */
export const fetchLocations = (locationType = null) => {
  let endpoint = '/locations';
  if (locationType) {
    // Backend API của bạn hỗ trợ lọc: /locations?location_type=PUBLIC_PARK
    endpoint += `?location_type=${locationType}`;
  }
  return apiFetch(endpoint);
};

// --- API cho Dữ liệu Môi trường (THÊM CACHE) ---

// 1. Tạo cache và thời gian "sống" (Time-to-Live)
const aqiCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // Cache 5 phút (tính bằng mili giây)
};

/**
 * Lấy dữ liệu AQI (PM2.5) thời gian thực, CÓ CACHE 5 PHÚT
 * @returns {Promise<object>} - Dữ liệu AQI
 */
export const fetchLiveAQI = async () => {
  const now = Date.now();

  // 2. Kiểm tra xem cache có hợp lệ không?
  if (aqiCache.data && (now - aqiCache.timestamp < aqiCache.ttl)) {
    console.log("Sử dụng dữ liệu AQI từ cache...");
    return aqiCache.data;
  }

  // 3. Cache rỗng hoặc cũ -> Gọi API
  console.log("Lấy dữ liệu AQI mới từ API (OpenAQ)...");
  try {
    const data = await apiFetch('/aqi/hanoi');
    
    // 4. Lưu vào cache
    aqiCache.data = data;
    aqiCache.timestamp = now;
    
    return data;
  } catch (error) {
    // Nếu gọi API lỗi, nhưng vẫn còn cache cũ (dù hết hạn),
    // thì thà dùng cache cũ còn hơn là báo lỗi
    if (aqiCache.data) {
      console.warn("Gọi API AQI mới thất bại, tạm dùng cache cũ:", error.message);
      return aqiCache.data;
    }
    // Nếu không có cache cũ thì đành báo lỗi
    throw error;
  }
};
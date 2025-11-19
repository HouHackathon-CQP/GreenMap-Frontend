// Giả định backend của bạn đang chạy ở port 8000
const BASE_URL = 'http://localhost:8000';

// --- DỮ LIỆU DỰ PHÒNG (FALLBACK) ---
// Dùng khi API bị lỗi (Too many requests) VÀ không có cache
const FALLBACK_AQI_DATA = {
  source: "Fallback Data",
  data: [
    { sensor_id: 9001, station_name: "ĐH Bách Khoa (Dữ liệu mẫu)", provider_name: "System", value: 45, unit: "µg/m³", coordinates: { latitude: 21.005, longitude: 105.843 }, datetime_utc: new Date().toISOString() },
    { sensor_id: 9002, station_name: "Hoàn Kiếm (Dữ liệu mẫu)", provider_name: "System", value: 15, unit: "µg/m³", coordinates: { latitude: 21.028, longitude: 105.852 }, datetime_utc: new Date().toISOString() },
    { sensor_id: 9003, station_name: "Cầu Giấy (Dữ liệu mẫu)", provider_name: "System", value: 65, unit: "µg/m³", coordinates: { latitude: 21.034, longitude: 105.795 }, datetime_utc: new Date().toISOString() },
    { sensor_id: 9004, station_name: "Tây Hồ (Dữ liệu mẫu)", provider_name: "System", value: 155, unit: "µg/m³", coordinates: { latitude: 21.055, longitude: 105.805 }, datetime_utc: new Date().toISOString() },
    { sensor_id: 9005, station_name: "Long Biên (Dữ liệu mẫu)", provider_name: "System", value: 30, unit: "µg/m³", coordinates: { latitude: 21.035, longitude: 105.885 }, datetime_utc: new Date().toISOString() },
    { sensor_id: 9006, station_name: "Hà Đông (Dữ liệu mẫu)", provider_name: "System", value: 85, unit: "µg/m³", coordinates: { latitude: 20.975, longitude: 105.785 }, datetime_utc: new Date().toISOString() },
  ]
};

/**
 * Hàm xử lý gọi API chung
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
export const fetchLocations = (locationType = null, onlyActive = null) => {
  let endpoint = '/locations?';
  if (locationType) endpoint += `location_type=${locationType}&`;
  if (onlyActive !== null) endpoint += `is_active=${onlyActive}&`;
  return apiFetch(endpoint);
};

export const fetchLocationStats = () => apiFetch('/locations/stats');
export const fetchAqiStats = () => apiFetch('/aqi/stats');

// --- API cho Dữ liệu Môi trường (CACHE BỀN VỮNG VỚI LOCALSTORAGE) ---

const AQI_CACHE_KEY = 'greenmap_aqi_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

export const fetchLiveAQI = async () => {
  const now = Date.now();

  // 1. Kiểm tra localStorage xem có dữ liệu cũ không
  const cachedString = localStorage.getItem(AQI_CACHE_KEY);
  
  if (cachedString) {
    try {
      const cachedData = JSON.parse(cachedString);
      // Kiểm tra xem cache còn hạn sử dụng không ( < 5 phút )
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log("♻️ Sử dụng dữ liệu AQI từ localStorage (Không gọi API)");
        return cachedData.data;
      }
    } catch (e) {
      console.warn("Cache lỗi, sẽ tải mới.");
      localStorage.removeItem(AQI_CACHE_KEY);
    }
  }

  // 2. Nếu không có cache hoặc cache hết hạn -> Gọi API
  console.log("🌐 Đang gọi API OpenAQ mới...");
  try {
    const data = await apiFetch('/aqi/hanoi');
    
    // 3. Lưu dữ liệu mới vào localStorage
    const cacheObject = {
      data: data,
      timestamp: now
    };
    localStorage.setItem(AQI_CACHE_KEY, JSON.stringify(cacheObject));
    
    return data;
  } catch (error) {
    console.error("⚠️ Gọi API thất bại:", error.message);

    // TRƯỜNG HỢP 1: Có cache cũ (dù hết hạn) -> Dùng tạm
    if (cachedString) {
      console.warn("👉 Sử dụng tạm dữ liệu cache đã hết hạn.");
      return JSON.parse(cachedString).data;
    }
    
    // TRƯỜNG HỢP 2: Không có cache (Lần đầu chạy mà API chết) -> Dùng dữ liệu mẫu cứng
    console.warn("👉 Không có cache. Sử dụng DỮ LIỆU DỰ PHÒNG (Fallback).");
    return FALLBACK_AQI_DATA;
  }
};
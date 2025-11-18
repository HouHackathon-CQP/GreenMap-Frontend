// src/apiService.js

const BASE_URL = 'http://localhost:8000';

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
export const fetchLocations = (locationType = null) => {
  let endpoint = '/locations';
  if (locationType) {
    endpoint += `?location_type=${locationType}`;
  }
  return apiFetch(endpoint);
};

// --- API cho Dữ liệu Môi trường (Live AQI) ---
const aqiCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // Cache 5 phút
};

export const fetchLiveAQI = async () => {
  const now = Date.now();
  if (aqiCache.data && (now - aqiCache.timestamp < aqiCache.ttl)) {
    console.log("Sử dụng dữ liệu AQI từ cache...");
    return aqiCache.data;
  }
  console.log("Lấy dữ liệu AQI mới từ API (OpenAQ)...");
  try {
    const data = await apiFetch('/aqi/hanoi');
    aqiCache.data = data;
    aqiCache.timestamp = now;
    return data;
  } catch (error) {
    if (aqiCache.data) {
      console.warn("Gọi API AQI mới thất bại, tạm dùng cache cũ:", error.message);
      return aqiCache.data;
    }
    throw error;
  }
};

// --- HÀM fetchAirQualityZones ĐÃ BỊ XÓA ---
// (Vì chúng ta sẽ dùng fetchLiveAQI)
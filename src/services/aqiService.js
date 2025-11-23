import { apiFetch } from './apiClient';
import { FALLBACK_AQI_DATA } from './mockData';

const AQI_CACHE_KEY = 'greenmap_aqi_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

export const fetchLiveAQI = async () => {
  const now = Date.now();

  // 1. Kiểm tra Cache
  const cached = localStorage.getItem(AQI_CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (now - parsed.timestamp < CACHE_TTL) return parsed.data;
    } catch { localStorage.removeItem(AQI_CACHE_KEY); }
  }

  try {
    // 2. Gọi API Endpoint mới
    const rawData = await apiFetch('aqi/hanoi?limit=100');
    
    // 3. Parse NGSI-LD
    let standardized = [];
    const dataArray = Array.isArray(rawData) ? rawData : (rawData.data || []);

    standardized = dataArray.map(item => {
        const pm25Key = "https://smartdatamodels.org/dataModel.Environment/pm25";
        const coords = item.location?.value?.coordinates || [0, 0];
        
        // Lấy giá trị an toàn
        const val = item[pm25Key]?.value;
        const cleanVal = (val !== null && val !== undefined) ? Number(val) : null;

        return {
            sensor_id: item.id,
            station_name: item.stationName?.value || "Trạm đo",
            value: cleanVal,
            unit: item[pm25Key]?.unitCode || "µg/m³",
            coordinates: {
                longitude: coords[0],
                latitude: coords[1]
            },
            provider: item.provider?.value
        };
    });

    const result = { source: "Live NGSI-LD API", data: standardized };
    
    // Cache lại
    localStorage.setItem(AQI_CACHE_KEY, JSON.stringify({ data: result, timestamp: now }));
    
    return result;

  } catch (error) {
    console.warn("⚠️ API AQI Lỗi/Timeout. Dùng Mock Data.", error);
    return FALLBACK_AQI_DATA;
  }
};

import { apiFetch } from './apiClient';

// --- HELPER: Parse dữ liệu NGSI-LD (Key dài) thành Object gọn ---
const parseStationData = (item) => {
    // Prefix chung của các trường dữ liệu
    const prefix = "https://smartdatamodels.org/dataModel.Environment/";
    
    // Lấy giá trị an toàn (fallback về 0 hoặc null nếu thiếu)
    const temp = item[`${prefix}temperature`] ?? 0;
    const humidityRaw = item[`${prefix}relativeHumidity`] ?? 0;
    const weatherType = item[`${prefix}weatherType`] ?? "Không xác định";
    const windSpeed = item[`${prefix}windSpeed`] ?? 0;

    // Logic kiểm tra mưa để tô màu icon trên Map
    const typeLower = String(weatherType).toLowerCase();
    const isRaining = typeLower.includes('mưa') || typeLower.includes('dông') || typeLower.includes('rain');

    return {
        id: item.id,
        // Lấy tên Quận làm tên trạm (VD: Ba Đình, Cầu Giấy)
        station_name: item["https://smartdatamodels.org/address"]?.addressRegion || "Trạm đo",
        location: item.location, // Giữ nguyên { type: 'Point', coordinates: [lng, lat] }
        
        // Các chỉ số
        temperature: temp,
        humidity: Math.round(humidityRaw * 100), // API trả về 0.58 -> nhân 100 = 58%
        weatherType: weatherType,
        windSpeed: windSpeed,
        
        dateObserved: item[`${prefix}dateObserved`],
        isRaining: isRaining
    };
};

// --- 1. LẤY DANH SÁCH TRẠM QUAN TRẮC (REALTIME) ---
// Gọi API: /weather/hanoi?limit=100
export const fetchWeatherStations = async () => {
    try {
        const result = await apiFetch('weather/hanoi?limit=100');
        
        // Backend trả về cấu trúc: { source: "...", count: 10, data: [...] }
        if (result && Array.isArray(result.data)) {
            return result.data.map(parseStationData);
        }
        return [];
    } catch (error) {
        console.error("❌ Lỗi lấy danh sách trạm thời tiết:", error);
        return [];
    }
};

// --- 2. LẤY DỰ BÁO CHI TIẾT (FORECAST) ---
// Gọi API: /weather/forecast?lat=...&lon=...
export const fetchWeatherForecast = async (lat = null, lon = null) => {
    try {
        let url = 'weather/forecast';
        
        // Nếu có tọa độ thì thêm vào params
        if (lat !== null && lon !== null) {
            url += `?lat=${lat}&lon=${lon}`;
        }

        const result = await apiFetch(url);
        // Backend trả về: { source: "...", data: { current, hourly_24h... } }
        return result.data; 
    } catch (error) {
        console.error("❌ Lỗi lấy dự báo thời tiết:", error);
        return null;
    }
};
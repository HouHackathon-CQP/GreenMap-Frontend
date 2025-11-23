import { apiFetch } from './apiClient';
import { MOCK_LOCATIONS } from './mockData';

// --- HÀM PHỤ TRỢ: TÍNH TÂM CỦA POLYGON ---
// Giúp chuyển đổi một vùng rộng lớn (Polygon) thành 1 điểm duy nhất (Lat/Lng) để hiển thị trên bảng
const getCentroid = (coords) => {
    if (!coords || coords.length === 0) return { lat: 0, lng: 0 };
    
    // GeoJSON Polygon lồng nhau: [ [ [lng, lat], ... ] ]
    // Ta lấy vòng ngoài cùng (ring 0) để tính toán
    const points = (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) ? coords[0] : coords;

    let sumLat = 0, sumLng = 0, count = 0;

    points.forEach(point => {
        // Point chuẩn GeoJSON là [Longitude, Latitude] -> [Kinh độ, Vĩ độ]
        if (Array.isArray(point) && point.length >= 2) {
            sumLng += point[0];
            sumLat += point[1];
            count++;
        }
    });

    if (count === 0) return { lat: 0, lng: 0 };
    
    return {
        latitude: sumLat / count,
        longitude: sumLng / count
    };
};

export const fetchLocations = async (locationType = null) => {
  let endpoint = 'locations?limit=100&skip=0';
  if (locationType) endpoint += `&location_type=${locationType}`;
  
  try {
    const rawData = await apiFetch(endpoint);
    const dataArray = Array.isArray(rawData) ? rawData : [];

    // --- PARSE DỮ LIỆU NGSI-LD ---
    return dataArray.map(item => {
        // 1. Lấy Tên (Key là URL dài ngoằng)
        // Thử các trường hợp: Key chuẩn NGSI-LD hoặc fallback sang name thường
        const nameKey = "https://uri.etsi.org/ngsi-ld/name";
        const rawName = item[nameKey] || item.name || "Không tên";
        
        // 2. Xử lý Tọa độ (Polygon -> Point)
        const loc = item.location || {}; 
        let lat = 0, lng = 0;

        if (loc.type === 'Point' && loc.coordinates) {
            lng = loc.coordinates[0];
            lat = loc.coordinates[1];
        } else if (loc.type === 'Polygon' && loc.coordinates) {
            // Nếu là Polygon, tính tâm
            const center = getCentroid(loc.coordinates);
            lat = center.latitude;
            lng = center.longitude;
        }

        // 3. Xử lý ID (Làm ngắn lại cho đẹp bảng)
        // Ví dụ: "urn:ngsi-ld:CHARGING_STATION:way-1208800265" -> "way-1208800265"
        let shortId = item.id;
        if (shortId && shortId.includes(':')) {
            const parts = shortId.split(':');
            shortId = parts[parts.length - 1]; // Lấy phần cuối cùng
        }

        // 4. Trả về object chuẩn cho Frontend
        return {
            id: shortId,
            name: typeof rawName === 'object' ? (rawName.value || "N/A") : rawName, // Đôi khi nó là object {value: "..."}
            location_type: item.type || locationType || "UNKNOWN", // Lấy type gốc (ví dụ: CHARGING_STATION)
            is_active: true, // API này chưa có trường status, mặc định là True
            latitude: lat,
            longitude: lng
        };
    });

  } catch (error) {
    console.warn("⚠️ Locations API Error. Using Mock.");
    if (locationType) {
        return MOCK_LOCATIONS.filter(l => l.location_type === locationType);
    }
    return MOCK_LOCATIONS;
  }
};

export const fetchLocationStats = () => Promise.resolve({});
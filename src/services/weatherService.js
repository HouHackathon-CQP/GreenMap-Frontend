import { apiFetch } from './apiClient'; // Giả định bạn có apiClient

// Mock Data dựa trên cấu trúc chuẩn bạn cung cấp
// Tôi sẽ generate ra khoảng 50 điểm quanh Hà Nội để bản đồ nhiệt (Heatmap) trông đẹp mắt
const generateMockWeatherData = () => {
    const baseCoords = [105.8372, 21.0341]; // Hà Nội
    const mockData = [];

    for (let i = 0; i < 50; i++) {
        // Tạo tọa độ ngẫu nhiên quanh Hà Nội (loang ra khoảng 15km)
        const lng = baseCoords[0] + (Math.random() - 0.5) * 0.15;
        const lat = baseCoords[1] + (Math.random() - 0.5) * 0.15;
        
        // Giả lập lượng mưa (mm) - Từ 0 đến 100mm
        const rainValue = Math.random() > 0.7 ? 0 : Math.floor(Math.random() * 80); 

        mockData.push({
            "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld",
            "id": `urn:ngsi-ld:WeatherObserved:Hanoi:Point${i}`,
            "type": "https://smartdatamodels.org/dataModel.Environment/WeatherObserved",
            "https://smartdatamodels.org/address": {
                "addressLocality": "Hanoi",
                "addressCountry": "VN"
            },
            "location": {
                "type": "Point",
                "coordinates": [lng, lat]
            },
            // Các chỉ số thời tiết
            "https://smartdatamodels.org/dataModel.Environment/precipitation": rainValue, // Lượng mưa
            "https://smartdatamodels.org/dataModel.Environment/temperature": 24 + Math.random() * 5,
            "https://smartdatamodels.org/dataModel.Environment/relativeHumidity": 0.5 + Math.random() * 0.4,
            "https://smartdatamodels.org/dataModel.Environment/weatherType": rainValue > 0 ? "Mưa rào" : "Nhiều mây",
            "https://smartdatamodels.org/dateObserved": new Date().toISOString()
        });
    }
    return mockData;
};

export const fetchWeatherData = async () => {
    // Giả lập gọi API với độ trễ nhỏ để mô phỏng tải dữ liệu
    // Sau này bạn thay bằng: return await apiFetch('weather/hanoi');
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(generateMockWeatherData());
        }, 800);
    });
};
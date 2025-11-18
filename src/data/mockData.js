
export const aqiTrendData = [
  { name: '00:00', aqi: 45 },
  { name: '03:00', aqi: 50 },
  { name: '06:00', aqi: 55 },
  { name: '09:00', aqi: 70 },
  { name: '12:00', aqi: 65 },
  { name: '15:00', aqi: 75 },
  { name: '18:00', aqi: 85 },
  { name: '21:00', aqi: 80 },
];

export const areaStatsData = [
  { name: 'Hoàn Kiếm', aqi: 85, noise: 70 },
  { name: 'Đống Đa', aqi: 72, noise: 65 },
  { name: 'Tây Hồ', aqi: 65, noise: 60 },
  { name: 'Cầu Giấy', aqi: 78, noise: 72 },
  { name: 'Hà Đông', aqi: 90, noise: 68 },
];

export const sensorData = [
  { id: 'SS-001', location: '21.0285, 105.8542', type: 'AQI', status: 'Active', lastUpdate: '2 phút trước' },
  { id: 'SS-002', location: '21.0228, 105.8019', type: 'Noise', status: 'Active', lastUpdate: '3 phút trước' },
  { id: 'SS-003', location: '20.9850, 105.7938', type: 'AQI', status: 'Inactive', lastUpdate: '2 giờ trước' },
  { id: 'SS-004', location: '21.0374, 105.7839', type: 'AQI & Noise', status: 'Maintenance', lastUpdate: '1 ngày trước' },
];

export const userReportsData = [
  { id: 'RP-101', type: 'Điểm nóng ô nhiễm', location: 'Ngã tư Sở', description: 'Khói bụi nghiêm trọng.', status: 'Pending' },
  { id: 'RP-102', type: 'Thiếu cây xanh', location: 'Khu đô thị Mỗ Lao', description: 'Ít cây xanh, rất nóng.', status: 'Pending' },
  { id: 'RP-103', type: 'Rác thải nhiều', location: 'Bờ hồ Văn Quán', description: 'Rác thải sinh hoạt.', status: 'Approved' },
];

export const greenPointsData = [
  { id: 'GP-01', name: 'Công viên Thống Nhất', type: 'Công viên' },
  { id: 'GP-02', name: 'Vườn hoa Lý Thái Tổ', type: 'Vườn hoa' },
];

export const chargingStationsData = [
  { id: 'CS-01', name: 'Vinfast Times City', provider: 'Vinfast', status: 'Available' },
  { id: 'CS-02', name: 'EVCap Cầu Giấy', provider: 'EVCap', status: 'In Use' },
];

// Mới thêm: Dữ liệu thông báo
export const notificationsData = [
  { id: 1, title: "Cảnh báo AQI", message: "Khu vực Hoàn Kiếm vượt ngưỡng 150.", time: "10 phút trước", type: "alert" },
  { id: 2, title: "Báo cáo mới", message: "Người dân gửi báo cáo rác thải tại Hồ Tây.", time: "30 phút trước", type: "info" },
  { id: 3, title: "Hệ thống", message: "Đã hoàn tất sao lưu dữ liệu định kỳ.", time: "2 giờ trước", type: "success" },
];

// --- THÊM MỚI: Dữ liệu cho bản đồ ---
export const mapSensorData = [
  { id: 'SS-001', lat: 21.0285, lng: 105.8542, name: 'Hoàn Kiếm', type: 'AQI' },
  { id: 'SS-002', lat: 21.0228, lng: 105.8019, name: 'Đống Đa', type: 'Noise' },
  { id: 'SS-003', lat: 20.9850, lng: 105.7938, name: 'Hà Đông', type: 'AQI' },
  { id: 'SS-004', lat: 21.0374, lng: 105.7839, name: 'Cầu Giấy', type: 'AQI & Noise' },
];

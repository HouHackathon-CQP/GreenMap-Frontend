export const FALLBACK_AQI_DATA = {
  source: "Fallback Data",
  data: [
    { sensor_id: "1", station_name: "ĐH Bách Khoa (Mẫu)", value: 45, unit: "µg/m³", coordinates: { latitude: 21.005, longitude: 105.843 } },
    { sensor_id: "2", station_name: "Hoàn Kiếm (Mẫu)", value: 155, unit: "µg/m³", coordinates: { latitude: 21.028, longitude: 105.852 } },
    { sensor_id: "3", station_name: "Cầu Giấy (Mẫu)", value: 65, unit: "µg/m³", coordinates: { latitude: 21.034, longitude: 105.795 } },
    { sensor_id: "4", station_name: "Tây Hồ (Mẫu)", value: 30, unit: "µg/m³", coordinates: { latitude: 21.055, longitude: 105.805 } },
  ]
};

export const MOCK_LOCATIONS = [
    { id: 101, name: "Công viên Thống Nhất", location_type: "PUBLIC_PARK", latitude: 21.016, longitude: 105.842, is_active: true, description: "Công viên trung tâm." },
    { id: 201, name: "VinFast Times City", location_type: "CHARGING_STATION", latitude: 20.995, longitude: 105.868, is_active: true, description: "Trạm sạc nhanh." },
    { id: 301, name: "TNGo Tràng Tiền", location_type: "BICYCLE_RENTAL", latitude: 21.025, longitude: 105.855, is_active: true, description: "Xe đạp công cộng." },
    { id: 401, name: "Hoàng Thành Thăng Long", location_type: "TOURIST_ATTRACTION", latitude: 21.036, longitude: 105.840, is_active: true, description: "Di sản văn hóa." },
];

export const MOCK_USERS = [
    { id: 1, full_name: "Nguyễn Văn Admin", email: "admin@greenmap.vn", role: "ADMIN", is_active: true, last_login: new Date().toISOString() },
    { id: 2, full_name: "Trần Quản Lý", email: "manager@greenmap.vn", role: "MANAGER", is_active: true, last_login: "2023-11-20T10:00:00" },
];

export const MOCK_REPORTS = [
    { id: 1, title: "Rác thải bừa bãi", description: "Rác tự phát ven hồ.", latitude: 20.985, longitude: 105.855, status: "PENDING", image_url: null },
    { id: 2, title: "Cây đổ chắn đường", description: "Cây đổ sau bão.", latitude: 21.040, longitude: 105.840, status: "APPROVED", image_url: null },
];
import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import GreenMap from '../components/GreenMap'; 

import { fetchLiveAQI, fetchLocations } from '../apiService';

// --- DỮ LIỆU GIẢ CHO BIỂU ĐỒ (API CHƯA CÓ) ĐƯỢC CHUYỂN VÀO ĐÂY ---
const aqiTrendData = [
  { name: '00:00', aqi: 45 }, { name: '03:00', aqi: 50 }, { name: '06:00', aqi: 55 },
  { name: '09:00', aqi: 70 }, { name: '12:00', aqi: 65 }, { name: '15:00', aqi: 75 },
  { name: '18:00', aqi: 85 }, { name: '21:00', aqi: 80 },
];
const areaStatsData = [
  { name: 'Hoàn Kiếm', aqi: 85, noise: 70 }, { name: 'Đống Đa', aqi: 72, noise: 65 },
  { name: 'Tây Hồ', aqi: 65, noise: 60 }, { name: 'Cầu Giấy', aqi: 78, noise: 72 },
  { name: 'Hà Đông', aqi: 90, noise: 68 },
];
// --- ----------------------------------------------- ---


// Hàm helper tô màu
const getSensorStatusChip = (status) => {
  let color = '';
  switch (status) {
    case 'Active':
      color = 'bg-green-500/30 text-green-300';
      break;
    case 'Inactive':
    default:
      color = 'bg-gray-500/30 text-gray-300';
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}>
      {status}
    </span>
  );
};

export default function Dashboard() {
  // 3. State cho dữ liệu KPI và Tình trạng
  const [kpiData, setKpiData] = useState({
    totalLocations: 0,
    activeLocations: 0,
    avgAqi: 0,
    pendingReports: 0,
  });
  const [sensorStatusList, setSensorStatusList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 4. useEffect để gọi API
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Gọi song song 2 API
        const [aqiResult, locationsResult] = await Promise.all([
          fetchLiveAQI(),
          fetchLocations(null) // Lấy tất cả locations (không lọc)
        ]);

        // Xử lý dữ liệu AQI
        let totalAqi = 0;
        let validReadings = 0;
        const liveSensors = [];

        if (aqiResult && aqiResult.data) {
          aqiResult.data.forEach(sensor => {
            if (sensor.value !== null && sensor.value !== undefined) {
              totalAqi += sensor.value;
              validReadings++;
            }
            liveSensors.push({
              id: sensor.sensor_id,
              name: sensor.station_name,
              value: sensor.value,
              status: (sensor.value !== null) ? 'Active' : 'Inactive'
            });
          });
        }

        // Xử lý dữ liệu Locations (Tổng Địa điểm / Hoạt động)
        let totalLocations = 0;
        let activeLocations = 0;
        if (locationsResult) {
          totalLocations = locationsResult.length;
          activeLocations = locationsResult.filter(loc => loc.is_active).length;
        }

        // Tính toán
        const avgAqi = (validReadings > 0) ? (totalAqi / validReadings) : 0;
        
        // Cập nhật State
        setKpiData({
          totalLocations: totalLocations,
          activeLocations: activeLocations,
          avgAqi: Math.round(avgAqi),
          pendingReports: 3 // Cập nhật (vì userReportsData nội bộ của ReportApproval có 3 item)
        });
        
        // Chỉ hiển thị 5 sensor đầu tiên trong danh sách
        setSensorStatusList(liveSensors.slice(0, 5));

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []); // Chạy 1 lần khi mount

  // 5. Render Thẻ KPI
  const kpiCards = [
    { title: 'Tổng Địa điểm', value: kpiData.totalLocations, icon: Database, color: 'text-blue-400' },
    { title: 'Đang Hoạt động', value: kpiData.activeLocations, icon: CheckCircle, color: 'text-green-400' },
    { title: 'Báo cáo chờ duyệt', value: kpiData.pendingReports, icon: Clock, color: 'text-yellow-400' },
    { title: 'AQI (PM2.5) TB', value: kpiData.avgAqi, icon: AlertCircle, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpiCards.map((kpi) => (
          <div key={kpi.title} className="bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50 flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-gray-700 ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">{kpi.title}</p>
              {isLoading ? (
                <Loader2 size={20} className="animate-spin mt-1" />
              ) : (
                <p className="text-2xl font-bold">{kpi.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section (GreenMap tự gọi API của nó) */}
        <div className="lg:col-span-2 bg-gray-800/60 rounded-xl shadow-lg border border-gray-700/50 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-700/50 bg-gray-800/80">
            <h3 className="text-sm font-semibold text-green-300">Bản đồ Trạm đo AQI Thời gian thực</h3>
          </div>
          <div className="h-[400px] w-full relative">
            <GreenMap /> 
          </div>
        </div>

        {/* 6. Tình trạng Cảm biến (Từ API) */}
        <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-green-300">Tình trạng Cảm biến (Live)</h3>
          <ul className="space-y-3 h-[400px] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 size={30} className="animate-spin text-gray-500" />
              </div>
            ) : (
              sensorStatusList.map((sensor) => (
                <li key={sensor.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-200 truncate w-40" title={sensor.name}>{sensor.name}</p>
                    <p className="text-xs text-gray-400 mt-1">PM2.5: {sensor.value ?? 'N/A'}</p>
                  </div>
                  {getSensorStatusChip(sensor.status)}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

       {/* 7. Charts (Vẫn dùng mock data nội bộ) */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-green-300">Xu hướng AQI (24h) - (Dữ liệu giả)</h3>
          <ResponsiveContainer width="100%" height={300}>
            {/* Sử dụng biến 'aqiTrendData' nội bộ */}
            <LineChart data={aqiTrendData}> 
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} cursor={{stroke: '#4B5563', strokeWidth: 2}} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="aqi" name="Chỉ số AQI" stroke="#F97316" strokeWidth={3} dot={{r: 4, fill: '#F97316'}} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-green-300">Thống kê theo Khu vực - (Dữ liệu giả)</h3>
          <ResponsiveContainer width="100%" height={300}>
            {/* Sử dụng biến 'areaStatsData' nội bộ */}
            <BarChart data={areaStatsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} cursor={{fill: '#374151', opacity: 0.4}} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="aqi" name="AQI" fill="#F97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="noise" name="Tiếng ồn (dB)" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
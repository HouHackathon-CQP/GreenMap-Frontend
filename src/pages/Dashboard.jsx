import React, { useState, useEffect } from 'react';
import { Radio, Signal, Clock, AlertCircle, Loader2, X, MapPin, Activity, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import GreenMap from '../components/GreenMap'; 
import { fetchLiveAQI } from '../services';

// --- 1. MODAL CHI TIẾT ---
const StationDetailModal = ({ station, onClose }) => {
  if (!station) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl p-6 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X/></button>
            <h2 className="text-xl font-bold text-white mb-4">{station.name}</h2>
            <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-green-400">{station.value}</span>
                <span className="text-gray-400">{station.unit}</span>
            </div>
            <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-300">
                <p>Toạ độ: {station.coordinates?.latitude.toFixed(4)}, {station.coordinates?.longitude.toFixed(4)}</p>
                <p>Nguồn: {station.provider}</p>
            </div>
        </div>
    </div>
  )
};

// --- 2. HÀM HELPER ---
const getAqiColor = (val) => {
    if (val <= 50) return '#10b981';
    if (val <= 100) return '#eab308';
    if (val <= 150) return '#f97316';
    return '#ef4444';
};

// Hàm tách tên Quận từ tên Trạm (Simple Logic)
const detectDistrict = (stationName) => {
    const name = stationName.toLowerCase();
    const districts = [
        "Hoàn Kiếm", "Đống Đa", "Ba Đình", "Hai Bà Trưng", 
        "Hoàng Mai", "Thanh Xuân", "Long Biên", "Nam Từ Liêm", 
        "Bắc Từ Liêm", "Tây Hồ", "Cầu Giấy", "Hà Đông", 
        "Sơn Tây", "Ba Vì", "Phúc Thọ", "Đan Phượng", 
        "Hoài Đức", "Quốc Oai", "Thạch Thất", "Chương Mỹ", 
        "Thanh Oai", "Thường Tín", "Phú Xuyên", "Ứng Hòa", 
        "Mỹ Đức", "Gia Lâm", "Đông Anh", "Sóc Sơn", "Mê Linh"
    ];

    for (let d of districts) {
        if (name.includes(d.toLowerCase())) return d;
    }
    return "Khu vực khác"; // Nếu không tìm thấy tên quận trong tên trạm
};

export default function Dashboard() {
  const [kpiData, setKpiData] = useState({ totalStations: 0, activeStations: 0, avgAqi: 0, pendingReports: 3 });
  const [sensorList, setSensorList] = useState([]);
  
  // State dữ liệu Thống kê Quận
  const [districtPollutionData, setDistrictPollutionData] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const aqiResult = await fetchLiveAQI();
        
        let totalAqi = 0, validReadings = 0, activeCount = 0;
        const processedSensors = [];
        
        // Biến để tính trung bình theo quận
        const districtStats = {}; // { "Hà Đông": { total: 150, count: 2 }, ... }

        if (aqiResult && Array.isArray(aqiResult.data)) {
          aqiResult.data.forEach(sensor => {
            const val = Number(sensor.value);
            const isValid = sensor.value !== null && !isNaN(val);

            if (isValid) { 
                totalAqi += val; 
                validReadings++; 
                activeCount++; 

                // --- LOGIC GOM NHÓM THEO QUẬN ---
                const districtName = detectDistrict(sensor.station_name || "");
                if (!districtStats[districtName]) {
                    districtStats[districtName] = { total: 0, count: 0 };
                }
                districtStats[districtName].total += val;
                districtStats[districtName].count += 1;
            }

            processedSensors.push({
              id: sensor.sensor_id || Math.random(),
              name: sensor.station_name || "Trạm chưa đặt tên",
              value: isValid ? val : null,
              unit: sensor.unit,
              status: isValid ? 'Online' : 'Offline',
              coordinates: sensor.coordinates,
              provider: sensor.provider_name
            });
          });
        }

        // --- TÍNH TOÁN DỮ LIỆU BIỂU ĐỒ QUẬN ---
        const chartData = Object.keys(districtStats).map(key => ({
            name: key,
            aqi: Math.round(districtStats[key].total / districtStats[key].count) // Tính trung bình cộng
        }));

        // Sắp xếp từ cao xuống thấp và lấy Top 5 quận ô nhiễm nhất
        chartData.sort((a, b) => b.aqi - a.aqi);
        setDistrictPollutionData(chartData.slice(0, 6));

        // Tính KPI toàn thành phố
        const avg = (validReadings > 0) ? (totalAqi / validReadings) : 0;
        setKpiData({ 
            totalStations: processedSensors.length, 
            activeStations: activeCount, 
            avgAqi: Math.round(avg), 
            pendingReports: 3 
        });
        setSensorList(processedSensors);

      } catch (error) { console.error(error); } 
      finally { setIsLoading(false); }
    };
    loadDashboardData();
  }, []);

  // Dữ liệu giả cho biểu đồ Trend (vì API chưa có history)
  const aqiTrendData = [
    { name: '00:00', aqi: kpiData.avgAqi * 0.8 },
    { name: '06:00', aqi: kpiData.avgAqi * 0.9 },
    { name: '12:00', aqi: kpiData.avgAqi * 1.1 },
    { name: '18:00', aqi: kpiData.avgAqi },
  ];

  const kpiCards = [
    { title: 'Tổng Trạm Đo', value: kpiData.totalStations, icon: Radio, color: 'text-blue-400', bgIcon: 'bg-blue-500/20' },
    { title: 'Đang Online', value: kpiData.activeStations, icon: Signal, color: 'text-green-400', bgIcon: 'bg-green-500/20' },
    { title: 'Cảnh báo', value: kpiData.pendingReports, icon: Clock, color: 'text-yellow-400', bgIcon: 'bg-yellow-500/20' },
    { title: 'PM2.5 Toàn TP', value: kpiData.avgAqi, icon: AlertCircle, color: 'text-orange-400', bgIcon: 'bg-orange-500/20' },
  ];

  return (
    <div className="space-y-6 pb-10">
      <StationDetailModal station={selectedStation} onClose={() => setSelectedStation(null)} />

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((kpi) => (
          <div key={kpi.title} className="bg-gray-900 p-5 rounded-2xl border border-gray-800 flex items-center space-x-4">
            <div className={`p-3.5 rounded-xl ${kpi.bgIcon} ${kpi.color}`}><kpi.icon size={26} /></div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{kpi.title}</p>
              {isLoading ? <Loader2 size={24} className="animate-spin mt-1 text-gray-500" /> : <p className="text-3xl font-black text-white mt-1">{kpi.value}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden h-[500px] relative">
            <div className="absolute top-0 left-0 right-0 p-4 bg-gray-900/80 backdrop-blur z-10 border-b border-gray-800">
                <h3 className="font-bold text-white">Bản đồ Trạm Quan Trắc</h3>
            </div>
            <div className="h-full w-full"><GreenMap /></div>
        </div>

        {/* List */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 h-[500px] flex flex-col p-4">
            <h3 className="font-bold text-white mb-4">Danh sách Trạm ({sensorList.length})</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <ul className="space-y-2">
                    {sensorList.map((s, i) => (
                        <li key={i} onClick={() => setSelectedStation(s)} className="flex justify-between p-3 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800 border border-transparent hover:border-green-500/50">
                            <span className="text-sm text-gray-300 truncate w-32">{s.name}</span>
                            <span className={`font-bold ${s.value > 100 ? 'text-red-400' : 'text-green-400'}`}>{s.value ?? '--'}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend */}
        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
          <h3 className="font-bold text-white mb-6 flex items-center"><Activity size={18} className="mr-2 text-orange-500"/> Xu hướng PM2.5 (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={aqiTrendData}> 
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="aqi" stroke="#f97316" strokeWidth={3} dot={{r:4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* --- BIỂU ĐỒ PHÂN TÍCH THEO QUẬN (MỚI) --- */}
        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
          <h3 className="font-bold text-white mb-6 flex items-center"><BarChart3 size={18} className="mr-2 text-blue-500"/> Top Quận/Huyện Ô nhiễm TB</h3>
          
          {districtPollutionData.length === 0 ? (
             <div className="flex h-[250px] items-center justify-center text-gray-500">Chưa có đủ dữ liệu phân tích.</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={districtPollutionData} layout="vertical" margin={{left: 0, right: 20}}> 
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" hide />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" tickLine={false} axisLine={false} width={100} tick={{fontSize: 12, fill: '#d1d5db'}} />
                <Tooltip 
                    cursor={{fill: '#374151', opacity: 0.2}} 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} 
                />
                <Bar dataKey="aqi" radius={[0, 4, 4, 0]} barSize={20}>
                    {districtPollutionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getAqiColor(entry.aqi)} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}
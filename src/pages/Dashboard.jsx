// Copyright 2025 HouHackathon-CQP
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Radio, Signal, AlertCircle, Activity, BarChart3, MapPin, X, Wind, CloudRain, Thermometer, Droplets } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, AreaChart, Area } from 'recharts';
import GreenMap from '../components/GreenMap'; 
import WeatherWidget from '../components/WeatherWidget'; 
import { fetchLiveAQI } from '../services';
import { fetchWeatherForecast } from '../services/weatherService'; 
import { getAQIInfo } from '../utils/aqiCalculator';
import { useTheme } from '../context/ThemeContext'; 

// --- HELPER: Phân loại quận ---
const detectDistrict = (stationName) => {
    const name = stationName ? stationName.toLowerCase() : "";
    const districts = ["Hoàn Kiếm", "Đống Đa", "Ba Đình", "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân", "Long Biên", "Nam Từ Liêm", "Bắc Từ Liêm", "Tây Hồ", "Cầu Giấy", "Hà Đông", "Gia Lâm", "Đông Anh", "Sóc Sơn"];
    for (let d of districts) if (name.includes(d.toLowerCase())) return d;
    return "Khu vực khác";
};

// --- COMPONENT: MODAL CHI TIẾT TRẠM ---
const StationDetailModal = ({ station, onClose }) => {
  const [localForecast, setLocalForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (station?.coordinates) {
        setLoadingForecast(true);
        fetchWeatherForecast(station.coordinates.latitude, station.coordinates.longitude)
            .then(data => setLocalForecast(data))
            .catch(err => console.error(err))
            .finally(() => setLoadingForecast(false));
    }
  }, [station]);

  if (!station) return null;
  const info = getAQIInfo(station.value); 
  const formatTime = (iso) => { try { return new Date(iso).getHours() + 'h'; } catch { return ''; } };

  return (
    <div 
        onClick={onClose} 
        // --- FIX: Bỏ 'zoom-in', chỉ giữ 'fade-in' ---
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300 cursor-pointer"
    >
        <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-700/60 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden cursor-default flex flex-col max-h-[90vh] transition-colors duration-300">
            {/* Background Effect */}
            <div className={`absolute top-0 right-0 w-64 h-64 ${info.bg.replace('/20','')} rounded-full blur-3xl opacity-10 dark:opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none`}></div>
            
            <div className="p-6 relative z-10 overflow-y-auto custom-scrollbar">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"><X size={18}/></button>

                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">{station.station_name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{station.provider || 'Trạm quan trắc'}</p>
                    
                    {/* Vòng tròn chỉ số AQI */}
                    <div className={`inline-flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 ${info.border} ${info.bg} mb-6 shadow-lg`}>
                        <span className={`text-5xl font-black ${info.text}`}>{station.value}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mt-1">AQI US</span>
                    </div>

                    {/* Chỉ số phụ */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex justify-center items-center"><Thermometer size={12} className="mr-1"/> Nhiệt độ</div>
                            <div className="font-bold text-lg text-gray-900 dark:text-white">{station.temperature}°</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex justify-center items-center"><Droplets size={12} className="mr-1"/> Độ ẩm</div>
                            <div className="font-bold text-lg text-gray-900 dark:text-white">{station.humidity}%</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex justify-center items-center"><Wind size={12} className="mr-1"/> Gió</div>
                            <div className="font-bold text-lg text-gray-900 dark:text-white">{station.wind_speed} <span className="text-xs">m/s</span></div>
                        </div>
                    </div>

                    {/* Chart Dự báo nhỏ trong Modal */}
                    <div className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-4 mb-4 text-left">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center"><Activity size={14} className="mr-2 text-yellow-500"/> Dự báo 24h tới</h4>
                            {localForecast?.current && <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-400/20">{localForecast.current.desc}</span>}
                        </div>
                        <div className="h-[150px] w-full min-w-0">
                            {loadingForecast ? (
                                <div className="h-full flex items-center justify-center text-gray-500 text-xs"><Wind className="animate-spin mr-2" size={16}/> Đang tải...</div>
                            ) : localForecast && localForecast.hourly_24h ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <AreaChart data={localForecast.hourly_24h}>
                                        <defs><linearGradient id="modalTemp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} vertical={false} />
                                        <XAxis dataKey="time" tickFormatter={formatTime} stroke="#9ca3af" axisLine={false} tickLine={false} tick={{fontSize: 10}} interval={3}/>
                                        <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                                        <Tooltip contentStyle={{backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', border: '1px solid #374151', borderRadius:'8px', fontSize:'12px', color: theme === 'dark' ? '#fff' : '#000'}} itemStyle={{color:'#fbbf24', fontWeight:'bold'}} labelFormatter={(lbl) => formatTime(lbl)} formatter={(value) => [`${value}°C`, 'Nhiệt độ']}/>
                                        <Area type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#modalTemp)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500 text-xs">Không có dữ liệu dự báo</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- HÀM HELPER LẤY VỊ TRÍ ---
const getUserLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
        }
        const options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            (err) => reject(err),
            options
        );
    });
};

// --- MAIN DASHBOARD ---
export default function Dashboard() {
  const { theme } = useTheme(); 
  const [kpiData, setKpiData] = useState({ total: 0, active: 0, avgAqi: 0 });
  const [sensorList, setSensorList] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [locationTitle, setLocationTitle] = useState("Hà Nội (Mặc định)");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Cấu hình màu Chart theo Theme
  const chartColors = {
      text: theme === 'dark' ? '#9ca3af' : '#4b5563',
      grid: theme === 'dark' ? '#374151' : '#e5e7eb',
      tooltipBg: theme === 'dark' ? '#1f2937' : '#ffffff',
      tooltipBorder: theme === 'dark' ? '#374151' : '#e5e7eb',
      tooltipText: theme === 'dark' ? '#fff' : '#111827'
  };

  useEffect(() => {
    const timer = setInterval(() => { setCurrentTime(new Date()); }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      let userLat = null, userLon = null;
      try {
          const locationPromise = getUserLocation();
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject("Timeout"), 3000));
          const pos = await Promise.race([locationPromise, timeoutPromise]);
          userLat = pos.lat; userLon = pos.lon;
          setLocationTitle("Vị trí của bạn");
      } catch (err) {}
      
      try {
        const [aqiResult, weatherResult] = await Promise.all([fetchLiveAQI(), fetchWeatherForecast(userLat, userLon)]);
        const sensorsData = aqiResult.data || (Array.isArray(aqiResult) ? aqiResult : []);
        let totalAqi = 0, count = 0, active = 0;
        const sensors = [];
        const distMap = {};

        if (sensorsData && sensorsData.length > 0) {
          sensorsData.forEach(s => {
            const val = s.value; 
            if (val !== null && !isNaN(val)) {
               totalAqi += val; count++; active++;
               const dName = detectDistrict(s.station_name);
               if(!distMap[dName]) distMap[dName] = { total:0, count:0 };
               distMap[dName].total += val; distMap[dName].count++;
            }
            sensors.push({ ...s, status: (val!==null)?'Online':'Offline' });
          });
        }

        const distChart = Object.keys(distMap).map(k => ({ name: k, aqi: Math.round(distMap[k].total/distMap[k].count) })).sort((a,b) => b.aqi - a.aqi).slice(0, 6);
        setDistrictData(distChart);
        setSensorList(sensors);
        setKpiData({ total: sensors.length, active, avgAqi: count ? Math.round(totalAqi/count) : 0 });
        if (weatherResult) setWeatherData(weatherResult);

      } catch (e) { console.error("API Error:", e); } 
      finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  // Class chung cho các Card
  const cardClass = "bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-none transition-colors duration-300";

  return (
    <div className="space-y-6 pb-10">
      <StationDetailModal station={selectedStation} onClose={() => setSelectedStation(null)} />

      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Dashboard Tổng quan</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Hệ thống Quan trắc Môi trường Thông minh</p>
        </div>
        
        <div className="text-right hidden sm:block">
            <p className="text-gray-800 dark:text-white font-bold text-lg">{currentTime.toLocaleTimeString('vi-VN')}</p>
            <p className="text-gray-500 text-xs">{currentTime.toLocaleDateString('vi-VN', {weekday: 'long', day:'numeric', month:'long'})}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className={cardClass}>
            <div className="flex justify-between mb-4"><div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400"><Radio size={24}/></div></div>
            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">{kpiData.total}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tổng trạm lắp đặt</div>
        </div>
        {/* Card 2 */}
        <div className={cardClass}>
            <div className="flex justify-between mb-4"><div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400"><Signal size={24}/></div></div>
            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">{kpiData.active}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Trạm đang Online</div>
        </div>
        {/* Card 3 */}
        <div className={cardClass}>
            <div className="flex justify-between mb-4"><div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-600 dark:text-yellow-400"><AlertCircle size={24}/></div></div>
            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">0</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Cảnh báo / Bảo trì</div>
        </div>
        
        {/* Card 4: Trung bình toàn TP (Đã sửa lỗi hiển thị màu) */}
        <div className={`${cardClass} relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Activity size={60} className="text-emerald-500"/>
            </div>
            <div className="flex justify-between mb-4 relative z-10">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Activity size={24}/>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase border ${getAQIInfo(kpiData.avgAqi).bg} ${getAQIInfo(kpiData.avgAqi).text} ${getAQIInfo(kpiData.avgAqi).border}`}>{getAQIInfo(kpiData.avgAqi).level}</span>
            </div>
            <div className="text-4xl font-black text-gray-900 dark:text-white mb-1 relative z-10">
                {kpiData.avgAqi} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">AQI</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium relative z-10">Trung bình toàn TP</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
        {/* Map Container */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111318] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl dark:shadow-none relative flex flex-col h-[400px] lg:h-full transition-colors duration-300">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="bg-white/80 dark:bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 pointer-events-auto flex items-center shadow-sm">
                    <MapPin className="text-emerald-500 mr-2" size={16}/> 
                    <span className="text-gray-900 dark:text-white text-xs font-bold">Bản đồ Trực tuyến</span>
                </div>
            </div>
            <div className="flex-1 w-full h-full"><GreenMap onStationSelect={setSelectedStation} /></div>
        </div>
        
        {/* Sensor List */}
        <div className="bg-white dark:bg-[#111318] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl dark:shadow-none flex flex-col overflow-hidden h-[400px] lg:h-full transition-colors duration-300">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white font-bold text-lg">Trạm đo ({sensorList.length})</h3>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20 px-2 py-1 rounded">Live</div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {sensorList.map((s, i) => (
                    <div key={i} onClick={() => setSelectedStation(s)} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer border border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                        <div className="truncate pr-2">
                            <h4 className="text-gray-800 dark:text-gray-200 text-sm font-bold truncate">{s.station_name}</h4>
                            <p className="text-[10px] text-gray-500 truncate">{s.provider || 'N/A'}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${getAQIInfo(s.value).bg} ${getAQIInfo(s.value).text}`}>
                            {s.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[550px]"> 
            <WeatherWidget data={weatherData} locationName={locationTitle} />
        </div>
        <div className={cardClass + " h-[550px] flex flex-col"}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-gray-900 dark:text-white font-bold text-lg flex items-center"><BarChart3 className="text-blue-500 mr-2"/> Ô nhiễm theo Quận</h3>
            </div>
            <div className="flex-1 min-h-0 min-w-0">
                {districtData.length === 0 ? <div className="h-full flex items-center justify-center text-gray-500 italic font-medium">Chưa đủ dữ liệu phân tích</div> : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={districtData} layout="vertical" margin={{left: 0, right: 20}}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false}/>
                            <XAxis type="number" stroke={chartColors.text} hide/>
                            <YAxis dataKey="name" type="category" stroke={chartColors.text} tickLine={false} axisLine={false} width={100} tick={{fontSize: 12, fill: chartColors.text, fontWeight: 500}}/>
                            <Tooltip cursor={{fill: chartColors.grid, opacity: 0.2}} contentStyle={{backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius:'12px'}} itemStyle={{color: chartColors.tooltipText, fontWeight:'bold'}}/>
                            <Bar dataKey="aqi" radius={[0, 6, 6, 0]} barSize={24}>
                                {districtData.map((entry, index) => <Cell key={`cell-${index}`} fill={getAQIInfo(entry.aqi).color} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
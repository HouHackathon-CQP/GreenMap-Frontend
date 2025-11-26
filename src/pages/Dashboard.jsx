import React, { useState, useEffect } from 'react';
import { Radio, Signal, Clock, AlertCircle, Loader2, X, MapPin, Activity, BarChart3, Wind, Droplets, Thermometer } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Cell } from 'recharts';
import GreenMap from '../components/GreenMap'; 
import { fetchLiveAQI } from '../services';

// --- 1. HELPER & CONSTANTS ---
const getAqiColorInfo = (val) => {
    if (val === null || val === undefined) return { color: '#9ca3af', text: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30', label: 'N/A' };
    if (val <= 50) return { color: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', label: 'Tốt' };
    if (val <= 100) return { color: '#eab308', text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', label: 'Trung bình' };
    if (val <= 150) return { color: '#f97316', text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', label: 'Kém' };
    return { color: '#ef4444', text: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30', label: 'Xấu' };
};

const detectDistrict = (stationName) => {
    const name = stationName ? stationName.toLowerCase() : "";
    const districts = ["Hoàn Kiếm", "Đống Đa", "Ba Đình", "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân", "Long Biên", "Nam Từ Liêm", "Bắc Từ Liêm", "Tây Hồ", "Cầu Giấy", "Hà Đông", "Gia Lâm", "Đông Anh", "Sóc Sơn"];
    for (let d of districts) if (name.includes(d.toLowerCase())) return d;
    return "Khu vực khác";
};

// --- 2. MODAL CHI TIẾT (FIX: Click Outside to Close) ---
const StationDetailModal = ({ station, onClose }) => {
  if (!station) return null;
  const info = getAqiColorInfo(station.value);
  // Mock data biểu đồ nhỏ trong modal
  const mockHistory = Array.from({length: 6}, (_, i) => ({ time: `${i*4}h`, value: Math.max(10, (station.value || 50) + (Math.random()-0.5)*20) }));

  // Mock data chỉ số phụ (nếu API chưa có)
  const wind = station.wind || (Math.random() * 5).toFixed(1);
  const temp = station.temp || (28 + Math.random() * 5).toFixed(0);
  const humidity = station.humidity || (60 + Math.random() * 10).toFixed(0);

  return (
    <div 
        onClick={onClose} // Click nền để đóng
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200 cursor-pointer"
    >
        <div 
            onClick={(e) => e.stopPropagation()} // Chặn click xuyên qua
            className="bg-[#111318] border border-gray-700/60 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden cursor-default"
        >
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 ${info.bg} rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none`}></div>

            <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{station.name}</h2>
                        <p className="text-sm text-gray-400 flex items-center mt-1"><MapPin size={14} className="mr-1 text-emerald-500"/> {station.provider || 'Trạm quan trắc'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-800/50 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"><X size={20}/></button>
                </div>

                {/* Main Stat */}
                <div className={`flex items-center justify-between p-5 rounded-2xl border ${info.border} ${info.bg} mb-6 backdrop-blur-xl`}>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-1">Chỉ số PM2.5</p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-6xl font-black ${info.text} tracking-tighter`}>{station.value ?? '--'}</span>
                            <span className="text-sm font-medium text-gray-400">{station.unit || 'µg/m³'}</span>
                        </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full border ${info.border} bg-black/20 backdrop-blur text-sm font-bold text-white uppercase tracking-wide`}>
                        {info.label}
                    </div>
                </div>

                {/* Sub Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/50 text-center">
                        <Wind size={18} className="mx-auto text-blue-400 mb-1"/>
                        <div className="text-lg font-bold text-white">{wind}</div>
                        <div className="text-[10px] text-gray-500 uppercase">Gió (m/s)</div>
                    </div>
                    <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/50 text-center">
                        <Thermometer size={18} className="mx-auto text-orange-400 mb-1"/>
                        <div className="text-lg font-bold text-white">{temp}°</div>
                        <div className="text-[10px] text-gray-500 uppercase">Nhiệt độ</div>
                    </div>
                    <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/50 text-center">
                        <Droplets size={18} className="mx-auto text-cyan-400 mb-1"/>
                        <div className="text-lg font-bold text-white">{humidity}%</div>
                        <div className="text-[10px] text-gray-500 uppercase">Độ ẩm</div>
                    </div>
                </div>

                {/* Mini Chart */}
                <div className="h-32 w-full opacity-80">
                    <ResponsiveContainer>
                        <AreaChart data={mockHistory}>
                            <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={info.color} stopOpacity={0.4}/><stop offset="100%" stopColor={info.color} stopOpacity={0}/></linearGradient></defs>
                            <Area type="monotone" dataKey="value" stroke={info.color} fill="url(#grad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- 3. MAIN DASHBOARD ---
export default function Dashboard() {
  const [kpiData, setKpiData] = useState({ total: 0, active: 0, avgAqi: 0 });
  const [sensorList, setSensorList] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  // Load Data Logic
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const aqiResult = await fetchLiveAQI();
        
        let totalAqi = 0, count = 0, active = 0;
        const sensors = [];
        const distMap = {};

        if (aqiResult && Array.isArray(aqiResult.data)) {
          aqiResult.data.forEach(s => {
            const val = Number(s.value);
            const isValid = s.value !== null && !isNaN(val);
            
            if (isValid) {
               totalAqi += val; count++; active++;
               
               // District Stats Logic
               const dName = detectDistrict(s.station_name);
               if(!distMap[dName]) distMap[dName] = { total:0, count:0 };
               distMap[dName].total += val; distMap[dName].count++;
            }
            
            sensors.push({ 
                ...s, 
                value: isValid ? val : null, 
                status: isValid ? 'Online' : 'Offline' 
            });
          });
        }

        // Calculate District Averages
        const distChart = Object.keys(distMap)
            .map(k => ({ name: k, aqi: Math.round(distMap[k].total/distMap[k].count) }))
            .sort((a,b) => b.aqi - a.aqi)
            .slice(0, 6); // Top 6

        setDistrictData(distChart);
        setSensorList(sensors);
        setKpiData({ total: sensors.length, active, avgAqi: count ? Math.round(totalAqi/count) : 0 });

      } catch (e) { console.error(e); } 
      finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  // Trend Chart Data (Mock based on current AVG)
  const trendData = [
      { time: '00:00', val: Math.round(kpiData.avgAqi * 0.8) }, 
      { time: '06:00', val: Math.round(kpiData.avgAqi * 0.9) },
      { time: '12:00', val: Math.round(kpiData.avgAqi * 1.1) }, 
      { time: '18:00', val: kpiData.avgAqi }
  ];

  return (
    <div className="space-y-6 pb-10">
      <StationDetailModal station={selectedStation} onClose={() => setSelectedStation(null)} />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-2">
        <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Dashboard Tổng quan</h1>
            <p className="text-gray-400 text-sm mt-1">Cập nhật: {new Date().toLocaleTimeString('vi-VN')} • Hà Nội</p>
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-[#111318] border border-gray-800 p-6 rounded-2xl relative overflow-hidden group hover:border-gray-600 transition-all shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100"></div>
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><Radio size={24}/></div>
                <span className="text-xs font-bold bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">+2 Mới</span>
            </div>
            <div className="text-3xl font-black text-white mb-1">{kpiData.total}</div>
            <div className="text-sm text-gray-400 font-medium">Tổng trạm lắp đặt</div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#111318] border border-gray-800 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><Signal size={24}/></div>
                <div className="flex items-center space-x-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span><span className="text-xs font-bold text-emerald-500">Live</span>
                </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">{kpiData.active}</div>
            <div className="text-sm text-gray-400 font-medium">Trạm đang Online</div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#111318] border border-gray-800 p-6 rounded-2xl relative overflow-hidden group hover:border-yellow-500/50 transition-all shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400"><AlertCircle size={24}/></div>
            </div>
            <div className="text-3xl font-black text-white mb-1">3</div>
            <div className="text-sm text-gray-400 font-medium">Cảnh báo / Bảo trì</div>
        </div>

        {/* Card 4 (AQI AVG) */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 p-6 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/10 rounded-xl text-white"><Activity size={24}/></div>
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase border ${getAqiColorInfo(kpiData.avgAqi).bg} ${getAqiColorInfo(kpiData.avgAqi).text} ${getAqiColorInfo(kpiData.avgAqi).border}`}>
                    {getAqiColorInfo(kpiData.avgAqi).label}
                </span>
            </div>
            <div className="text-4xl font-black text-white mb-1">{kpiData.avgAqi} <span className="text-sm font-medium text-gray-400">PM2.5</span></div>
            <div className="text-sm text-gray-400 font-medium">Trung bình toàn TP</div>
        </div>
      </div>

      {/* --- MAP & LIST SECTION --- */}
      {/* FIX: Responsive Height (h-auto on mobile, 600px on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
        
        {/* MAP CONTAINER */}
        <div className="lg:col-span-2 bg-[#111318] rounded-3xl border border-gray-800 overflow-hidden shadow-xl relative flex flex-col h-[400px] lg:h-auto">
            <div className="absolute top-0 left-0 w-full z-10 p-5 bg-gradient-to-b from-black/80 to-transparent pointer-events-none flex justify-between items-start">
                <div>
                    <h3 className="text-white font-bold text-lg flex items-center"><MapPin className="mr-2 text-emerald-500" size={20}/> Bản đồ Trực quan</h3>
                    <p className="text-gray-400 text-xs font-medium">Dữ liệu thời gian thực</p>
                </div>
                {/* Legend */}
                <div className="flex items-center space-x-2 bg-black/40 backdrop-blur p-1.5 rounded-lg border border-white/10 pointer-events-auto shadow-lg">
                    <div className="flex items-center px-2 text-[10px] font-bold text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 shadow-[0_0_5px_#10b981]"></span>Tốt</div>
                    <div className="flex items-center px-2 text-[10px] font-bold text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5 shadow-[0_0_5px_#eab308]"></span>TB</div>
                    <div className="flex items-center px-2 text-[10px] font-bold text-red-500"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 shadow-[0_0_5px_#ef4444]"></span>Xấu</div>
                </div>
            </div>
            <div className="flex-1 w-full bg-gray-900">
                <GreenMap onStationSelect={setSelectedStation} />
            </div>
        </div>

        {/* LIST CONTAINER */}
        <div className="bg-[#111318] rounded-3xl border border-gray-800 shadow-xl flex flex-col overflow-hidden h-[400px] lg:h-auto">
            <div className="p-5 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center backdrop-blur-sm">
                <h3 className="text-white font-bold text-lg">Trạm đo ({sensorList.length})</h3>
                <div className="text-xs text-emerald-400 font-bold bg-emerald-900/20 border border-emerald-500/20 px-2 py-1 rounded flex items-center"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>Live</div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-gradient-to-b from-[#111318] to-[#0f1014]">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-emerald-500">
                        <Loader2 size={40} className="animate-spin mb-3"/>
                        <span className="text-xs uppercase tracking-widest font-bold">Đang đồng bộ...</span>
                    </div>
                ) : sensorList.map((s, i) => {
                    const info = getAqiColorInfo(s.value);
                    return (
                        <div key={i} onClick={() => setSelectedStation(s)} className="group flex items-center justify-between p-3.5 bg-gray-800/30 hover:bg-gray-800 border border-transparent hover:border-gray-700 rounded-2xl cursor-pointer transition-all duration-200">
                            <div className="min-w-0 flex-1 pr-4">
                                <div className="flex items-center mb-1">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${s.status==='Online' ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-gray-500'}`}></span>
                                    <h4 className="text-gray-200 text-sm font-bold truncate group-hover:text-white transition-colors">{s.station_name || "Trạm không tên"}</h4>
                                </div>
                                <p className="text-[11px] text-gray-500 truncate pl-4 font-medium">{s.provider || 'N/A'}</p>
                            </div>
                            
                            {/* FIX: AQI Box Alignment */}
                            <div className={`flex flex-col items-center justify-center flex-shrink-0 w-14 h-14 rounded-xl ${info.bg} border ${info.border} shadow-sm`}>
                                <span className={`text-xl font-black ${info.text}`}>{s.value ?? '-'}</span>
                                <span className="text-[9px] font-bold text-gray-400/80 uppercase tracking-tighter">AQI</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Chart */}
        <div className="bg-[#111318] border border-gray-800 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-lg flex items-center"><Activity className="text-orange-500 mr-2"/> Xu hướng 24h</h3>
            </div>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>
                        <XAxis dataKey="time" stroke="#9ca3af" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10}/>
                        <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tick={{fontSize: 12}}/>
                        
                        {/* FIX: Tooltip White Text */}
                        <Tooltip 
                            contentStyle={{backgroundColor:'#111827', border:'1px solid #374151', borderRadius:'12px', boxShadow:'0 10px 15px rgba(0,0,0,0.5)'}} 
                            itemStyle={{color:'#fff', fontWeight:'bold'}} 
                            labelStyle={{color:'#9ca3af', fontSize:'12px', marginBottom:'5px'}}
                        />
                        <Area type="monotone" dataKey="val" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* District Chart */}
        <div className="bg-[#111318] border border-gray-800 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-lg flex items-center"><BarChart3 className="text-blue-500 mr-2"/> Ô nhiễm theo Quận (Top 5)</h3>
            </div>
            <div className="h-64 w-full">
                {districtData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-600 italic font-medium">Chưa đủ dữ liệu phân tích</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={districtData} layout="vertical" margin={{left: 0}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false}/>
                            <XAxis type="number" stroke="#9ca3af" hide/>
                            <YAxis dataKey="name" type="category" stroke="#9ca3af" tickLine={false} axisLine={false} width={100} tick={{fontSize: 12, fill: '#e5e7eb', fontWeight: 500}}/>
                            
                            {/* FIX: Tooltip White Text */}
                            <Tooltip 
                                cursor={{fill: '#374151', opacity: 0.2}} 
                                contentStyle={{backgroundColor:'#111827', border:'1px solid #374151', borderRadius:'12px', boxShadow:'0 10px 15px rgba(0,0,0,0.5)'}} 
                                itemStyle={{color:'#fff', fontWeight:'bold'}} 
                                labelStyle={{color:'#9ca3af', fontSize:'12px', marginBottom:'5px'}}
                            />
                            <Bar dataKey="aqi" radius={[0, 6, 6, 0]} barSize={24}>
                                {districtData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getAqiColorInfo(entry.aqi).color} />
                                ))}
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
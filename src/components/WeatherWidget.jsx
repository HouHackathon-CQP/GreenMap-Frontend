import React from 'react';
import { Cloud, Droplets, Wind, Sun, CloudRain, CloudLightning, Calendar } from 'lucide-react';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.getHours().toString().padStart(2, '0') + ':00';
};

const getWeatherIcon = (desc) => {
    const d = desc?.toLowerCase() || '';
    if (d.includes('mưa')) return <CloudRain className="text-blue-400" size={32} />;
    if (d.includes('dông') || d.includes('sấm')) return <CloudLightning className="text-purple-400" size={32} />;
    if (d.includes('mây') || d.includes('âm u')) return <Cloud className="text-gray-400" size={32} />;
    return <Sun className="text-yellow-400" size={32} />;
};

// --- NHẬN THÊM PROP locationName ---
const WeatherWidget = ({ data, locationName }) => {
    if (!data) return (
        <div className="bg-[#111318] border border-gray-800 p-6 rounded-3xl h-full flex flex-col items-center justify-center text-gray-500 animate-pulse">
            <Cloud className="mb-2 opacity-50" size={40}/>
            <span>Đang tải dữ liệu thời tiết...</span>
        </div>
    );

    const { current, hourly_24h, daily_7days } = data;

    const chartData = hourly_24h.map(item => ({
        time: formatTime(item.time),
        temp: item.temp,
        rain: item.rain_prob, 
        desc: item.desc
    }));

    return (
        <div className="bg-[#111318] border border-gray-800 p-6 rounded-3xl shadow-lg flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>

            {/* 1. Header */}
            <div className="flex justify-between items-start mb-4 z-10 flex-shrink-0">
                <div>
                    <h3 className="text-white font-bold text-lg flex items-center mb-1">
                        {/* HIỂN THỊ TÊN VỊ TRÍ ĐỘNG */}
                        {locationName || "Hà Nội, Việt Nam"}
                    </h3>
                    <p className="text-emerald-400 text-sm font-medium flex items-center">
                         {getWeatherIcon(current.desc)} 
                         <span className="ml-2">{current.desc}</span>
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-black text-white tracking-tighter">{current.temp}°</div>
                    <p className="text-xs text-gray-500 mt-1">{new Date(current.time).toLocaleDateString('vi-VN', {weekday: 'long', day:'numeric', month:'numeric'})}</p>
                </div>
            </div>

            {/* 2. Chỉ số phụ */}
            <div className="grid grid-cols-2 gap-4 mb-4 z-10 flex-shrink-0">
                <div className="bg-gray-800/40 p-3 rounded-2xl border border-gray-700/50 flex items-center">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 mr-3"><Wind size={18}/></div>
                    <div><span className="block text-white font-bold text-sm">{current.wind_speed} km/h</span><span className="text-[10px] text-gray-500">Tốc độ gió</span></div>
                </div>
                <div className="bg-gray-800/40 p-3 rounded-2xl border border-gray-700/50 flex items-center">
                    <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 mr-3"><Droplets size={18}/></div>
                    <div><span className="block text-white font-bold text-sm">{current.humidity}%</span><span className="text-[10px] text-gray-500">Độ ẩm</span></div>
                </div>
            </div>

            {/* 3. Biểu đồ 24h */}
            <div className="flex-1 w-full min-h-[180px] z-10">
                <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center"><Calendar size={12} className="mr-1"/> Dự báo 24 giờ tới</p>
                    <div className="flex gap-3 text-[9px] font-bold"><span className="flex items-center text-yellow-500"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>Nhiệt độ</span><span className="flex items-center text-blue-500"><span className="w-2 h-2 rounded-sm bg-blue-500 mr-1"></span>Mưa (%)</span></div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs><linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.5} />
                        <XAxis dataKey="time" stroke="#6b7280" axisLine={false} tickLine={false} tick={{fontSize: 10}} interval={3} />
                        <YAxis yAxisId="left" hide domain={['dataMin - 2', 'dataMax + 2']} />
                        <YAxis yAxisId="right" hide domain={[0, 100]} />
                        <Tooltip contentStyle={{backgroundColor:'#1f2937', border:'1px solid #374151', borderRadius:'12px', fontSize:'12px'}} itemStyle={{fontWeight:'bold'}} labelStyle={{color:'#9ca3af', marginBottom:'5px'}}/>
                        <Bar yAxisId="right" dataKey="rain" name="Khả năng mưa" fill="#3b82f6" opacity={0.6} barSize={12} radius={[2, 2, 0, 0]}/>
                        <Area yAxisId="left" type="monotone" dataKey="temp" name="Nhiệt độ" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            
            {/* 4. Dự báo 3 ngày tới */}
            {daily_7days && (
                <div className="mt-2 pt-3 border-t border-gray-800 space-y-2 z-10 flex-shrink-0">
                    {daily_7days.slice(0, 3).map((day, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-gray-300 hover:bg-gray-800/50 p-1 rounded transition-colors">
                            <span className="w-24 opacity-70 font-mono">{idx === 0 ? 'Hôm nay' : day.date}</span>
                            <span className="flex-1 text-center font-medium truncate px-2">{day.desc}</span>
                            <span className="w-16 text-right font-bold text-white"><span className="opacity-50 text-[10px]">{Math.round(day.temp_min)}°</span> / {Math.round(day.temp_max)}°</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WeatherWidget;
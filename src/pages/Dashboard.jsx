import React from 'react';
import { Database, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { aqiTrendData, areaStatsData, sensorData } from '../data/mockData';
import GreenMap from '../components/GreenMap'; 

export default function Dashboard() {
  const kpiData = [
    { title: 'Tổng Cảm biến', value: 120, icon: Database, color: 'text-blue-400' },
    { title: 'Hoạt động', value: 115, icon: CheckCircle, color: 'text-green-400' },
    { title: 'Báo cáo chờ duyệt', value: 12, icon: Clock, color: 'text-yellow-400' },
    { title: 'AQI Trung bình', value: 78, icon: AlertCircle, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpiData.map((kpi) => (
          <div key={kpi.title} className="bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50 flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-gray-700 ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">{kpi.title}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- KHU VỰC BẢN ĐỒ (Đã xóa p-1 để tràn viền) --- */}
        <div className="lg:col-span-2 bg-gray-800/60 rounded-xl shadow-lg border border-gray-700/50 overflow-hidden flex flex-col">
          {/* Header nhỏ cho bản đồ để trông chuyên nghiệp hơn */}
          <div className="p-3 border-b border-gray-700/50 bg-gray-800/80">
            <h3 className="text-sm font-semibold text-green-300">Bản đồ Thời gian thực</h3>
          </div>
          {/* Container bản đồ */}
          <div className="h-[400px] w-full relative">
            <GreenMap /> 
          </div>
        </div>

        {/* Sensor Status */}
        <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-green-300">Tình trạng Cảm biến</h3>
          <ul className="space-y-3 h-[400px] overflow-y-auto pr-2">
            {sensorData.map((sensor) => (
              <li key={sensor.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <div>
                  <p className="font-semibold text-gray-200">{sensor.id} <span className="text-xs font-normal text-gray-400">({sensor.type})</span></p>
                  <p className="text-xs text-gray-500 mt-1">{sensor.location}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sensor.status === 'Active' ? 'bg-green-900/60 text-green-400 border border-green-700' : 'bg-gray-700 text-gray-400 border border-gray-600'}`}>{sensor.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

       {/* Charts */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-green-300">Xu hướng AQI (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
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
          <h3 className="text-lg font-semibold mb-4 text-green-300">Thống kê theo Khu vực</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={areaStatsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} cursor={{fill: '#374151', opacity: 0.4}} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="aqi" name="AQI" fill="#F97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="noise" name="Tiếng ồn (dB)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
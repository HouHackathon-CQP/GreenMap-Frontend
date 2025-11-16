import React from 'react';
import { Database, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { aqiTrendData, areaStatsData, sensorData } from '../data/mockData';

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
        <div className="lg:col-span-2 bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-green-300">Bản đồ Trạm đo (Goong Map)</h3>
          <div className="h-[400px] bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">[Tích hợp Goong Map tại đây]</span>
          </div>
        </div>
        <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-green-300">Tình trạng Cảm biến</h3>
          <ul className="space-y-3 h-[400px] overflow-y-auto">
            {sensorData.map((sensor) => (
              <li key={sensor.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-semibold">{sensor.id} <span className="text-xs font-light">({sensor.type})</span></p>
                  <p className="text-xs text-gray-400">{sensor.location}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${sensor.status === 'Active' ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-300'}`}>{sensor.status}</span>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} labelStyle={{ color: '#E5E7EB' }} />
              <Legend />
              <Line type="monotone" dataKey="aqi" name="AQI" stroke="#F97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-green-300">Thống kê theo Khu vực</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={areaStatsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} labelStyle={{ color: '#E5E7EB' }} />
              <Legend />
              <Bar dataKey="aqi" name="AQI" fill="#F97316" />
              <Bar dataKey="noise" name="Tiếng ồn (dB)" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

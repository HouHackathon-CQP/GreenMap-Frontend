// GreenMap-Frontend/src/pages/Analytics.jsx
import React from 'react';
import { BrainCircuit, FileText, Download } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-300">Phân tích & Dự báo Nâng cao</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/60 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center"><BrainCircuit size={20} className="mr-2" /> Mô hình Dự báo Ô nhiễm</h3>
          <p className="text-gray-400 mb-4">Sử dụng AI/ML để dự đoán AQI.</p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">Chạy lại Mô hình</button>
        </div>
        <div className="bg-gray-800/60 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center"><FileText size={20} className="mr-2" /> Báo cáo PDF Tự động</h3>
          <p className="text-gray-400 mb-4">Tạo và gửi báo cáo định kỳ.</p>
          <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg">Tạo Báo cáo mới</button>
        </div>
      </div>
    </div>
  );
}

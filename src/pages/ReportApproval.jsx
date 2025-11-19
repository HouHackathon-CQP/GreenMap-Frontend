// src/pages/ReportApproval.jsx
import React from 'react';
import { ExternalLink } from 'lucide-react';
// --- ĐÃ XÓA DÒNG IMPORT MOCKDATA ---

// --- DỮ LIỆU GIẢ ĐÃ ĐƯỢC CHUYỂN VÀO ĐÂY ---
// (Vì API backend chưa có /reports)
const userReportsData = [
  { id: 'RP-101', type: 'Điểm nóng ô nhiễm', location: 'Ngã tư Sở', description: 'Khói bụi nghiêm trọng.', status: 'Pending' },
  { id: 'RP-102', type: 'Thiếu cây xanh', location: 'Khu đô thị Mỗ Lao', description: 'Ít cây xanh, rất nóng.', status: 'Pending' },
  { id: 'RP-103', type: 'Rác thải nhiều', location: 'Bờ hồ Văn Quán', description: 'Rác thải sinh hoạt.', status: 'Approved' },
];

// Component không còn nhận prop 'initialReports'
export default function ReportApproval() {
  const reports = userReportsData; // Sử dụng biến nội bộ

  return (
    <div className="bg-gray-800/60 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700/50">
      <h2 className="text-2xl font-bold text-green-300 mb-6">Duyệt Báo cáo từ Người dân (Dữ liệu giả)</h2>
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-gray-700/50 p-4 rounded-lg flex flex-col md:flex-row justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-bold text-lg">{report.type}</span>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${report.status === 'Pending' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-green-500/30 text-green-300'}`}>
                  {report.status}
                </span>
              </div>
              <p className="text-gray-300 mb-1"><span className="font-semibold">Vị trí:</span> {report.location}</p>
              <p className="text-gray-400 text-sm"><span className="font-semibold">Mô tả:</span> {report.description}</p>
            </div>
            {report.status === 'Pending' && (
              <div className="flex space-x-3">
                <button className="flex-1 md:flex-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg">Duyệt</button>
                <button className="flex-1 md:flex-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg">Từ chối</button>
                <button className="flex-1 md:flex-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"><ExternalLink size={16} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
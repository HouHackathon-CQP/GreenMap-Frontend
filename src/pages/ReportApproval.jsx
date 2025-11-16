import React from 'react';
import { ExternalLink } from 'lucide-react';
import { userReportsData } from '../data/mockData';

export default function ReportApproval() {
  return (
    <div className="bg-gray-800/60 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700/50">
      <h2 className="text-2xl font-bold text-green-300 mb-6">Duyệt Báo cáo từ Người dân</h2>
      <div className="space-y-4">
        {userReportsData.map((report) => (
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

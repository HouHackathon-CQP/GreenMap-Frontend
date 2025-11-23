// GreenMap-Frontend/src/pages/ReportApproval.jsx
import React, { useEffect, useState } from 'react';
import { fetchReports, updateReportStatus } from '../apiService';
import { Check, X, MapPin, Loader2 } from 'lucide-react';

export default function ReportApproval() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    const data = await fetchReports();
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    // Load danh sách ngay khi mount; rule được tắt vì đây là fetch dữ liệu có chủ đích
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(false);
  }, []);

  const handleStatus = async (id, status) => {
    setReports(reports.map(r => r.id === id ? { ...r, status } : r));
    await updateReportStatus(id, status);
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-green-500"/></div>;

  return (
    <div className="bg-gray-800/60 p-6 rounded-xl shadow-lg border border-gray-700">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-300">Duyệt Báo Cáo</h2>
        <button onClick={load} className="text-blue-400 text-sm">Làm mới</button>
      </div>
      <div className="space-y-4">
        {reports.length === 0 ? <p className="text-gray-500 text-center">Không có báo cáo.</p> : reports.map(r => (
            <div key={r.id} className="bg-gray-700/40 p-5 rounded-lg border border-gray-700 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="flex justify-between">
                        <h3 className="font-bold text-white text-lg">{r.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.status==='PENDING'?'bg-yellow-500/20 text-yellow-400':r.status==='APPROVED'?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400'}`}>{r.status}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1 flex items-center"><MapPin size={12} className="mr-1"/> {r.latitude}, {r.longitude}</p>
                    <p className="text-gray-300 mt-2 text-sm bg-gray-800/50 p-2 rounded">{r.description}</p>
                    {r.status === 'PENDING' && (
                        <div className="flex gap-3 mt-3">
                            <button onClick={()=>handleStatus(r.id, 'APPROVED')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm flex items-center"><Check size={14} className="mr-1"/> Duyệt</button>
                            <button onClick={()=>handleStatus(r.id, 'REJECTED')} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm flex items-center"><X size={14} className="mr-1"/> Từ chối</button>
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}

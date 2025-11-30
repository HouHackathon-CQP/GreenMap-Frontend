import React, { useEffect, useState } from 'react';
import { fetchReports, updateReportStatus, createReport } from '../services'; // Import thêm createReport
import { Check, X, MapPin, Loader2, Calendar, Filter, Image as ImageIcon, PlusCircle } from 'lucide-react'; // Import PlusCircle

const STATUS_TABS = [
    { id: 'PENDING', label: 'Chờ xử lý' },
    { id: 'APPROVED', label: 'Đã duyệt' },
    { id: 'REJECTED', label: 'Đã từ chối' },
];

export default function ReportApproval() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('PENDING');

  // Hàm load dữ liệu
  const loadReports = async (status) => {
    setLoading(true);
    try {
        const data = await fetchReports(status, 0, 100);
        setReports(data);
    } catch (error) {
        console.error(error);
        setReports([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(currentStatus);
  }, [currentStatus]);

  // Xử lý duyệt/từ chối
  const handleProcess = async (id, newStatus) => {
    try {
        await updateReportStatus(id, newStatus);
        // Loại bỏ item khỏi danh sách hiện tại (vì nó đã đổi trạng thái)
        setReports(prev => prev.filter(r => r.id !== id));
    } catch (error) {
        alert("Có lỗi xảy ra khi cập nhật trạng thái.");
    }
  };

  // --- XỬ LÝ TẠO BÁO CÁO TEST ---
  const handleCreateTest = async () => {
      const testData = {
          title: "Báo cáo Test " + new Date().toLocaleTimeString(),
          description: "Đây là dữ liệu test nhanh từ Admin Dashboard.",
          latitude: 21.0285, // Tọa độ Hà Nội
          longitude: 105.8542,
          image_url: "https://images.unsplash.com/photo-1611273426761-53c8577a3dc7" // Ảnh mẫu
      };

      try {
          await createReport(testData);
          alert("✅ Đã tạo thành công! Kiểm tra danh sách 'Chờ xử lý'.");
          
          // Nếu đang ở tab PENDING thì reload lại để thấy ngay
          if (currentStatus === 'PENDING') {
              loadReports('PENDING');
          } else {
              // Nếu đang ở tab khác thì chuyển về PENDING
              setCurrentStatus('PENDING');
          }
      } catch (e) {
          alert("❌ Tạo thất bại: " + e.message);
      }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
                <Filter className="mr-3 text-emerald-500" size={28}/> Quản lý Báo cáo
            </h2>
            <div className="flex items-center gap-4 mt-2 ml-10">
                <p className="text-gray-400 text-sm">Phản ánh từ người dân</p>
                
                {/* --- NÚT TẠO TEST --- */}
                <button 
                    onClick={handleCreateTest}
                    className="flex items-center px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                >
                    <PlusCircle size={14} className="mr-1.5"/> Tạo Test Nhanh
                </button>
            </div>
        </div>
        
        {/* TABS */}
        <div className="flex bg-[#111318] p-1 rounded-xl border border-gray-700">
            {STATUS_TABS.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setCurrentStatus(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        currentStatus === tab.id 
                        ? `bg-gray-700 text-white shadow-lg` 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* LIST VIEW */}
      <div className="bg-[#111318] border border-gray-800 rounded-3xl shadow-xl overflow-hidden min-h-[400px]">
        {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Loader2 className="animate-spin mb-2" size={32}/> Đang tải dữ liệu...
            </div>
        ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p>Không có báo cáo nào ở trạng thái này.</p>
            </div>
        ) : (
            <div className="divide-y divide-gray-800">
                {reports.map(report => (
                    <div key={report.id} className="p-6 hover:bg-gray-800/30 transition-colors flex flex-col md:flex-row gap-6">
                        {/* Ảnh Thumbnail */}
                        <div className="w-full md:w-48 h-32 flex-shrink-0 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex items-center justify-center group">
                            {report.image_url ? (
                                <img src={report.image_url} alt="Report" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                            ) : (
                                <div className="text-gray-600 flex flex-col items-center">
                                    <ImageIcon size={24} className="mb-1"/>
                                    <span className="text-xs">Không có ảnh</span>
                                </div>
                            )}
                        </div>

                        {/* Nội dung chi tiết */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-white">{report.title}</h3>
                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                                    report.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                    report.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                    {report.status}
                                </span>
                            </div>
                            
                            <p className="text-gray-300 text-sm mb-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 leading-relaxed">
                                {report.description}
                            </p>

                            <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-mono items-center">
                                <span className="flex items-center"><MapPin size={12} className="mr-1"/> {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}</span>
                                <span className="flex items-center"><Calendar size={12} className="mr-1"/> {report.created_at ? new Date(report.created_at).toLocaleString('vi-VN') : 'N/A'}</span>
                                <span className="bg-gray-800 px-2 py-0.5 rounded text-[10px]">ID: #{report.id}</span>
                            </div>
                        </div>

                        {/* Actions (Chỉ hiện nút Duyệt/Xóa khi ở tab PENDING) */}
                        {currentStatus === 'PENDING' && (
                            <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6">
                                <button 
                                    onClick={() => handleProcess(report.id, 'APPROVED')}
                                    className="flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg transition-transform active:scale-95"
                                >
                                    <Check size={16} className="mr-1.5"/> Duyệt
                                </button>
                                <button 
                                    onClick={() => handleProcess(report.id, 'REJECTED')}
                                    className="flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white rounded-xl text-sm font-bold transition-colors"
                                >
                                    <X size={16} className="mr-1.5"/> Từ chối
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
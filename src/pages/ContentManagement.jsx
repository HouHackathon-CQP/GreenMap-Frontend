import React, { useState, useEffect } from 'react';
import { fetchLocations, createLocation, updateLocation, deleteLocation } from '../services'; 
import { Loader2, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, X, Save, AlertTriangle, MapPin, Filter, LayoutList } from 'lucide-react';

// --- MODAL VÀ DELETE MODAL (GIỮ NGUYÊN CODE CŨ CỦA BẠN VÌ ĐÃ ĐẸP RỒI) ---
// (Tôi lược bỏ phần code UI của Modal ở đây để tập trung vào Logic chính cho gọn)
// ... Hãy giữ nguyên code Modal và DeleteConfirmModal ...

const LocationModal = ({ isOpen, onClose, onSubmit, initialData, title }) => {
    if (!isOpen) return null;
    const [formData, setFormData] = useState({ name: '', location_type: 'PUBLIC_PARK', latitude: '', longitude: '', is_active: true });
    useEffect(() => { if (initialData) setFormData(initialData); else setFormData({ name: '', location_type: 'PUBLIC_PARK', latitude: '', longitude: '', is_active: true }); }, [initialData, isOpen]);
    const handleSubmit = (e) => { e.preventDefault(); onSubmit({...formData, latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude)}); };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-[#111318] border border-gray-700/60 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                <h3 className="text-lg font-bold text-white mb-5">{title}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-emerald-500 outline-none" placeholder="Tên địa điểm" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})}/>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" step="any" className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-emerald-500 outline-none" placeholder="Lat" value={formData.latitude} onChange={e=>setFormData({...formData, latitude:e.target.value})}/>
                        <input type="number" step="any" className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-emerald-500 outline-none" placeholder="Lng" value={formData.longitude} onChange={e=>setFormData({...formData, longitude:e.target.value})}/>
                    </div>
                    <div className="flex justify-end gap-3 mt-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-bold">Hủy</button>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-emerald-900/20">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-[#111318] border border-red-900/40 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                <h3 className="text-white font-bold text-xl mb-2">Xác nhận xóa?</h3>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl font-bold hover:bg-gray-700">Hủy</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500">Xóa ngay</button>
                </div>
            </div>
        </div>
    );
};

export default function ContentManagement({ title, locationType }) {
  // 1. State chứa TOÀN BỘ dữ liệu
  const [allLocations, setAllLocations] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. State Search & Phân trang Client
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // 3. LOAD DATA (Chỉ chạy 1 lần để lấy hết)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Hàm fetchLocations mới sẽ tự loop để lấy đủ 1000+ bản ghi
        const data = await fetchLocations(locationType);
        setAllLocations(data);
        setPage(1);
        setSearchTerm('');
      } catch (err) { console.error(err); } 
      finally { setIsLoading(false); }
    };
    loadData();
  }, [locationType]);

  // 4. LOGIC LỌC & CẮT TRANG (Xử lý tại trình duyệt)
  // Bước 1: Lọc toàn bộ danh sách theo từ khóa
  const filteredLocations = allLocations.filter(item => 
    (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (item.id && String(item.id).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Bước 2: Tính toán trang
  const totalPages = Math.ceil(filteredLocations.length / limit) || 1;
  const startIndex = (page - 1) * limit;
  
  // Bước 3: Cắt dữ liệu hiển thị
  const currentData = filteredLocations.slice(startIndex, startIndex + limit);

  // Handlers
  const handleSave = async (formData) => {
      setIsModalOpen(false);
      if (editingItem) {
          const updatedList = allLocations.map(l => l.id === editingItem.id ? { ...formData, id: editingItem.id } : l);
          setAllLocations(updatedList);
          await updateLocation(editingItem.id, formData);
      } else {
          const newItem = await createLocation(formData);
          setAllLocations([newItem, ...allLocations]);
      }
  };

  const handleConfirmDelete = async () => {
      if (deletingItem) {
          const updatedList = allLocations.filter(l => l.id !== deletingItem.id);
          setAllLocations(updatedList);
          await deleteLocation(deletingItem.id);
          setDeletingItem(null);
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6 pb-6">
      <LocationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} initialData={editingItem} title={editingItem ? "Cập nhật" : "Thêm mới"} />
      <DeleteConfirmModal isOpen={!!deletingItem} onClose={() => setDeletingItem(null)} onConfirm={handleConfirmDelete} />

      {/* HEADER */}
      <div className="bg-[#111318] border border-gray-800 p-6 rounded-3xl shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div>
            <h2 className="text-2xl font-black text-white flex items-center tracking-tight">
                <LayoutList className="mr-3 text-emerald-500" size={28}/> {title}
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium ml-10">
                {/* Hiển thị tổng số bản ghi đã tải */}
                {isLoading ? "Đang đồng bộ dữ liệu..." : `Tổng số: ${filteredLocations.length} kết quả`}
            </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative group flex-1 sm:w-72">
                <Search className="absolute left-3.5 top-3 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    value={searchTerm} 
                    onChange={e => { setSearchTerm(e.target.value); setPage(1); }} // Reset về trang 1 khi search
                    className="block w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                />
            </div>
            <button onClick={() => {setEditingItem(null); setIsModalOpen(true);}} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center whitespace-nowrap active:scale-95">
                <Plus size={20} className="mr-2"/> Thêm
            </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 bg-[#111318] border border-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-900/95 backdrop-blur-md text-gray-400 text-xs uppercase font-bold tracking-wider sticky top-0 z-20 border-b border-gray-800">
                    <tr>
                        <th className="p-5 pl-8 w-28">ID</th>
                        <th className="p-5">Tên Địa điểm</th>
                        <th className="p-5 w-48">Loại hình</th>
                        <th className="p-5 w-48 hidden md:table-cell">Tọa độ</th>
                        <th className="p-5 w-36 text-center">Trạng thái</th>
                        <th className="p-5 w-28 text-right pr-8">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-sm">
                    {isLoading ? (
                        <tr><td colSpan={6} className="p-32 text-center"><div className="flex flex-col items-center justify-center"><Loader2 className="animate-spin text-emerald-500 mb-3" size={48}/><span className="text-gray-500 font-medium">Đang tải toàn bộ dữ liệu...</span></div></td></tr>
                    ) : currentData.length === 0 ? (
                        <tr><td colSpan={6} className="p-32 text-center text-gray-500 flex flex-col items-center"><Filter size={48} className="mb-4 opacity-20"/><p className="font-medium text-lg">{searchTerm ? "Không tìm thấy kết quả" : "Chưa có dữ liệu"}</p></td></tr>
                    ) : (
                        currentData.map(row => (
                            <tr key={row.id} className="hover:bg-gray-800/40 transition-colors group duration-200">
                                <td className="p-5 pl-8 font-mono text-gray-500 text-xs font-medium" title={row.id}>#{row.id.toString().slice(-5)}</td>
                                <td className="p-5"><div className="font-bold text-gray-200 group-hover:text-emerald-400 transition-colors text-base">{row.name}</div></td>
                                <td className="p-5"><span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">{row.location_type}</span></td>
                                <td className="p-5 font-mono text-gray-400 text-xs hidden md:table-cell">{row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}</td>
                                <td className="p-5 text-center">
                                    {row.is_active ? 
                                        <span className="inline-flex items-center justify-center w-24 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>Active</span> : 
                                        <span className="inline-flex items-center justify-center w-24 py-1 rounded-full bg-gray-700/50 text-gray-400 text-xs font-bold border border-gray-600/30">Inactive</span>
                                    }
                                </td>
                                <td className="p-5 pr-8 text-right">
                                    <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <button onClick={() => {setEditingItem(row); setIsModalOpen(true);}} className="p-2.5 bg-gray-800 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 rounded-xl transition-colors border border-transparent hover:border-blue-500/30"><Edit size={16}/></button>
                                        <button onClick={() => setDeletingItem(row)} className="p-2.5 bg-gray-800 hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded-xl transition-colors border border-transparent hover:border-red-500/30"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* FOOTER PAGINATION */}
        <div className="bg-gray-900/90 border-t border-gray-800 p-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 backdrop-blur-md text-sm z-20">
            <div className="flex items-center gap-4 text-gray-400 font-medium">
                <span>Hiển thị</span>
                <select value={limit} onChange={e => {setLimit(Number(e.target.value)); setPage(1);}} className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-gray-600 focus:border-emerald-500">
                    <option value={10}>10 dòng</option>
                    <option value={20}>20 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                </select>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading} className="p-2.5 border border-gray-700 rounded-xl hover:bg-gray-800 hover:text-white text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 hover:border-gray-600"><ChevronLeft size={18}/></button>
                <span className="px-3 font-mono font-bold text-white text-base tracking-widest">
                    Trang <span className="text-emerald-500">{page}</span> / <span className="text-gray-500">{totalPages}</span>
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading} className="p-2.5 border border-gray-700 rounded-xl hover:bg-gray-800 hover:text-white text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 hover:border-gray-600"><ChevronRight size={18}/></button>
            </div>
        </div>
      </div>
    </div>
  );
}
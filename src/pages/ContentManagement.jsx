// Copyright 2025 HouHackathon-CQP
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useState, useEffect } from 'react';
import { 
    fetchLocations, 
    createLocation, 
    updateLocation, 
    deleteLocation, 
    fetchLocationById 
} from '../services'; 
import { Loader2, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, X, LayoutList } from 'lucide-react';

// --- COMPONENT: LOCATION MODAL (Đã cập nhật Dark Mode) ---
const LocationModal = ({ isOpen, onClose, onSubmit, initialData, title, defaultType }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({ 
        name: '', 
        description: '', 
        location_type: defaultType || 'CHARGING_STATION', 
        latitude: '', 
        longitude: '', 
        is_active: true 
    });

    useEffect(() => { 
        if (initialData) {
            setFormData({
                ...initialData,
                description: initialData.description || '',
                is_active: initialData.is_active !== undefined ? initialData.is_active : true
            });
        } else {
            setFormData({ 
                name: '', 
                description: '', 
                location_type: defaultType || 'CHARGING_STATION', 
                latitude: '', 
                longitude: '', 
                is_active: true 
            }); 
        }
    }, [initialData, isOpen, defaultType]);

    const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            {/* Modal Container: Bg White/Dark */}
            <div className="bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-700/60 rounded-3xl w-full max-w-md shadow-2xl p-6 relative transition-colors duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"><X size={20}/></button>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">{title}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Tên địa điểm</label>
                        <input required className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-3 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors placeholder-gray-400" placeholder="Tên địa điểm" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})}/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Mô tả</label>
                        <textarea className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-3 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors placeholder-gray-400" rows="2" placeholder="Thông tin chi tiết..." value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Vĩ độ (Lat)</label>
                            <input required type="number" step="any" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-3 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" value={formData.latitude} onChange={e=>setFormData({...formData, latitude:e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Kinh độ (Lng)</label>
                            <input required type="number" step="any" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-3 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" value={formData.longitude} onChange={e=>setFormData({...formData, longitude:e.target.value})}/>
                        </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Trạng thái hoạt động</span>
                        <button type="button" onClick={() => setFormData({...formData, is_active: !formData.is_active})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold">Hủy</button>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-emerald-900/20">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- COMPONENT: DELETE MODAL ---
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#111318] border border-red-200 dark:border-red-900/40 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transition-colors duration-300">
                <h3 className="text-gray-900 dark:text-white font-bold text-xl mb-2">Xác nhận xóa?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Hành động này không thể hoàn tác.</p>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700">Hủy</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500">Xóa ngay</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
export default function ContentManagement({ title, locationType }) {
  const [allLocations, setAllLocations] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLocations(locationType);
        setAllLocations(data);
        setPage(1);
        setSearchTerm('');
      } catch (err) { console.error(err); } 
      finally { setIsLoading(false); }
    };
    loadData();
  }, [locationType]);

  const filteredLocations = allLocations.filter(item => 
    (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (item.id && String(item.id).toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredLocations.length / limit) || 1;
  const startIndex = (page - 1) * limit;
  const currentData = filteredLocations.slice(startIndex, startIndex + limit);

  const handleEditClick = async (item) => {
    setIsFetchingDetail(true);
    try {
        const freshData = await fetchLocationById(item.id);
        setEditingItem(freshData);
        setIsModalOpen(true);
    } catch (error) { alert("Không thể tải chi tiết. Vui lòng thử lại."); } finally { setIsFetchingDetail(false); }
  };

  const handleCreateClick = () => { setEditingItem(null); setIsModalOpen(true); };

  const handleSave = async (formData) => {
      setIsModalOpen(false);
      try {
          if (editingItem) {
              const updatedItem = await updateLocation(editingItem.id, formData);
              setAllLocations(prev => prev.map(l => l.id === editingItem.id ? updatedItem : l));
          } else {
              const newItem = await createLocation(formData);
              setAllLocations([newItem, ...allLocations]);
          }
      } catch (e) { alert("Lỗi: " + e.message); setIsModalOpen(true); }
  };

  const handleConfirmDelete = async () => {
      if (deletingItem) {
          try {
              await deleteLocation(deletingItem.id);
              setAllLocations(prev => prev.filter(l => l.id !== deletingItem.id));
              setDeletingItem(null);
          } catch (e) { alert("Lỗi xóa: " + e.message); }
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6 pb-6">
      <LocationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} initialData={editingItem} title={editingItem ? "Cập nhật" : "Thêm mới"} defaultType={locationType} />
      <DeleteConfirmModal isOpen={!!deletingItem} onClose={() => setDeletingItem(null)} onConfirm={handleConfirmDelete} />

      {/* Header */}
      <div className="bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 transition-colors duration-300">
        <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center tracking-tight">
                <LayoutList className="mr-3 text-emerald-600 dark:text-emerald-500" size={28}/> {title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium ml-10">
                {isLoading ? "Đang đồng bộ..." : `Tổng số: ${filteredLocations.length} kết quả`}
            </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative group flex-1 sm:w-72">
                <Search className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner placeholder-gray-400 dark:placeholder-gray-600"/>
            </div>
            <button onClick={handleCreateClick} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center whitespace-nowrap active:scale-95">
                <Plus size={20} className="mr-2"/> Thêm
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col relative transition-colors duration-300">
        <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                        <th className="p-5 pl-8 w-28">ID</th>
                        <th className="p-5">Tên Địa điểm</th>
                        <th className="p-5 w-48">Loại hình</th>
                        <th className="p-5 w-48 hidden md:table-cell">Tọa độ</th>
                        <th className="p-5 w-36 text-center">Trạng thái</th>
                        <th className="p-5 w-28 text-right pr-8">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50 text-sm">
                    {isLoading ? (
                        <tr><td colSpan={6} className="p-32 text-center"><div className="flex flex-col items-center justify-center"><Loader2 className="animate-spin text-emerald-500 mb-3" size={48}/><span className="text-gray-500 font-medium">Đang tải dữ liệu...</span></div></td></tr>
                    ) : currentData.length === 0 ? (
                        <tr><td colSpan={6} className="p-32 text-center text-gray-500">Chưa có dữ liệu</td></tr>
                    ) : (
                        currentData.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group duration-200">
                                <td className="p-5 pl-8 font-mono text-gray-500 dark:text-gray-500 text-xs font-medium">#{row.id}</td>
                                <td className="p-5"><div className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-base">{row.name}</div></td>
                                <td className="p-5"><span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-500/20">{row.location_type}</span></td>
                                <td className="p-5 font-mono text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">{row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}</td>
                                <td className="p-5 text-center">
                                    {row.is_active ? 
                                        <span className="inline-flex items-center justify-center w-24 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-500/20"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>Active</span> : 
                                        <span className="inline-flex items-center justify-center w-24 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs font-bold border border-gray-200 dark:border-gray-600/30">Inactive</span>
                                    }
                                </td>
                                <td className="p-5 pr-8 text-right">
                                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-all">
                                        <button onClick={() => handleEditClick(row)} disabled={isFetchingDetail} className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-600/20 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30">
                                            {isFetchingDetail && editingItem?.id === row.id ? <Loader2 size={16} className="animate-spin"/> : <Edit size={16}/>}
                                        </button>
                                        <button onClick={() => setDeletingItem(row)} className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-600/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/30"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 p-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 backdrop-blur-md text-sm z-20">
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 font-medium">
                <span>Hiển thị</span>
                <select value={limit} onChange={e => {setLimit(Number(e.target.value)); setPage(1);}} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white text-xs rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-emerald-500">
                    <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                </select>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading} className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"><ChevronLeft size={18}/></button>
                <span className="px-3 font-mono font-bold text-gray-700 dark:text-white text-base tracking-widest">Trang <span className="text-emerald-600 dark:text-emerald-500">{page}</span> / <span className="text-gray-500">{totalPages}</span></span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading} className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"><ChevronRight size={18}/></button>
            </div>
        </div>
      </div>
    </div>
  );
}
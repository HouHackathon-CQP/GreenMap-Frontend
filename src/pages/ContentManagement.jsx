import React, { useState, useEffect } from 'react';
import { fetchLocations } from '../services'; 
import { Loader2, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const COLUMNS = [
  { key: 'id', name: 'ID', width: 'w-20' },
  { key: 'name', name: 'Tên Địa điểm', width: 'w-auto' },
  { key: 'location_type', name: 'Loại', width: 'w-32' },
  { key: 'latitude', name: 'Vĩ độ', width: 'w-28' },
  { key: 'longitude', name: 'Kinh độ', width: 'w-28' },
  { key: 'is_active', name: 'Trạng thái', width: 'w-28' },
];

export default function ContentManagement({ title, locationType }) {
  // --- STATE DỮ LIỆU ---
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE TÌM KIẾM & PHÂN TRANG ---
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Mặc định 10 dòng

  // 1. Load dữ liệu từ API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Gọi API lấy tối đa 1000 bản ghi để về Client tự lọc
        const data = await fetchLocations(locationType); 
        setLocations(data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [locationType]);

  // 2. LOGIC LỌC (SEARCH)
  // Lọc danh sách dựa trên từ khóa tìm kiếm
  const filteredLocations = locations.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(item.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. LOGIC PHÂN TRANG (PAGINATION)
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLocations = filteredLocations.slice(startIndex, startIndex + itemsPerPage);

  // 4. Xử lý sự kiện
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset về trang 1 khi đổi số lượng
  };

  // Render Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={40} className="animate-spin text-green-500" />
        <span className="ml-3 text-gray-500">Đang tải danh sách...</span>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800 flex flex-col h-full">
      
      {/* --- HEADER & TOOLBAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-sm text-gray-400 mt-1">Tổng số: {filteredLocations.length} địa điểm</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Thanh Tìm kiếm */}
            <div className="relative group">
                <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-green-400 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Tìm tên, ID..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full sm:w-64 pl-10 p-2.5 outline-none transition-all"
                />
            </div>

            <button className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-lg active:scale-95 whitespace-nowrap">
                <Plus size={18} className="mr-2"/> Thêm mới
            </button>
        </div>
      </div>

      {/* --- BẢNG DỮ LIỆU --- */}
      <div className="overflow-hidden rounded-lg border border-gray-700 flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-800 text-gray-400 text-xs uppercase font-semibold sticky top-0 z-10">
                <tr>
                {COLUMNS.map((col) => (
                    <th key={col.key} className={`p-4 border-b border-gray-700 ${col.width}`}>
                    {col.name}
                    </th>
                ))}
                <th className="p-4 border-b border-gray-700 text-right">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm text-gray-300 bg-gray-900">
                {currentLocations.length === 0 ? (
                <tr>
                    <td colSpan={COLUMNS.length + 1} className="text-center p-10 text-gray-500 italic flex flex-col items-center justify-center">
                        <Filter size={40} className="mb-2 opacity-20"/>
                        {searchTerm ? `Không tìm thấy kết quả cho "${searchTerm}"` : "Chưa có dữ liệu nào."}
                    </td>
                </tr>
                ) : (
                currentLocations.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-800 transition-colors group">
                    <td className="p-4 font-mono text-gray-500">#{row.id}</td>
                    <td className="p-4 font-medium text-white">{row.name}</td>
                    <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                        {row.location_type}
                        </span>
                    </td>
                    <td className="p-4 font-mono text-gray-400">{typeof row.latitude==='number'?row.latitude.toFixed(5):'--'}</td>
                    <td className="p-4 font-mono text-gray-400">{typeof row.longitude==='number'?row.longitude.toFixed(5):'--'}</td>
                    <td className="p-4">
                        {row.is_active ? (
                        <span className="inline-flex items-center text-green-400 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shadow-[0_0_5px_#22c55e]"></span> Active
                        </span>
                        ) : (
                        <span className="inline-flex items-center text-gray-500 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2"></span> Inactive
                        </span>
                        )}
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-blue-500/20 rounded text-blue-400 transition-colors" title="Sửa"><Edit size={16} /></button>
                            <button className="p-2 hover:bg-red-500/20 rounded text-red-400 transition-colors" title="Xóa"><Trash2 size={16} /></button>
                        </div>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>

        {/* --- FOOTER: PAGINATION --- */}
        {filteredLocations.length > 0 && (
            <div className="bg-gray-800 p-3 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                
                {/* Chọn số dòng */}
                <div className="flex items-center">
                    <span className="mr-2">Hiển thị</span>
                    <select 
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="bg-gray-900 border border-gray-600 text-white text-xs rounded focus:ring-green-500 focus:border-green-500 p-1.5 outline-none cursor-pointer"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="ml-2">dòng / trang</span>
                </div>

                {/* Điều hướng trang */}
                <div className="flex items-center space-x-2">
                    <span className="mr-2">
                        Trang <span className="font-bold text-white">{currentPage}</span> / {totalPages}
                    </span>
                    
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
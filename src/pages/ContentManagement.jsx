import React, { useState, useEffect } from 'react';
import { fetchLocations } from '../apiService'; // Import API
import { Loader2, AlertTriangle } from 'lucide-react'; // Thêm icon

const COLUMNS = [
  { key: 'id', name: 'ID' },
  { key: 'name', name: 'Tên Địa điểm' },
  { key: 'location_type', name: 'Phân loại' },
  { key: 'latitude', name: 'Vĩ độ' },
  { key: 'longitude', name: 'Kinh độ' },
  { key: 'data_source', name: 'Nguồn' },
  { key: 'is_active', name: 'Trạng thái' },
];

export default function ContentManagement({ title, locationType }) {
  // 1. Dùng State để quản lý dữ liệu, loading và lỗi
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. Dùng useEffect để gọi API khi 'locationType' thay đổi
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setLocations([]); // Xóa dữ liệu cũ
      try {
        // Gọi API với locationType được truyền từ App.jsx
        const data = await fetchLocations(locationType);
        setLocations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [locationType]); // Chạy lại mỗi khi locationType thay đổi

  // 3. Hiển thị trạng thái Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={40} className="animate-spin text-green-400" />
        <span className="ml-4 text-xl text-gray-400">Đang tải dữ liệu...</span>
      </div>
    );
  }

  // 4. Hiển thị trạng thái Lỗi
  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-center">
        <AlertTriangle className="mr-3" />
        <div>
          <strong className="font-bold">Lỗi!</strong>
          <p>Không thể tải dữ liệu: {error}</p>
          <p className="text-xs text-red-400">Hãy đảm bảo Backend (localhost:8000) đang chạy và đã fix CORS.</p>
        </div>
      </div>
    );
  }
  
  // 5. Hiển thị bảng dữ liệu từ API
  return (
    <div className="bg-gray-800/60 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-300">{title}</h2>
        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Thêm mới (Chưa kết nối)
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr className="border-b border-gray-600">
              {COLUMNS.map((col) => (
                <th key={col.key} className="p-4 text-gray-400 font-semibold uppercase text-sm">
                  {col.name}
                </th>
              ))}
              <th className="p-4 text-gray-400 font-semibold uppercase text-sm">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="text-center p-8 text-gray-500">
                  Không tìm thấy dữ liệu (Có thể bạn chưa chạy seed data?)
                </td>
              </tr>
            ) : (
              locations.map((row) => (
                <tr key={row.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  {COLUMNS.map((col) => {
                    let value = row[col.key];
                    if (col.key === 'is_active') {
                      value = value ? 'Hoạt động' : 'Tạm ẩn';
                    }
                    if (col.key === 'latitude' || col.key === 'longitude') {
                      value = value.toFixed(5);
                    }
                    return (
                      <td key={col.key} className="p-4 text-gray-200">{value}</td>
                    );
                  })}
                  <td className="p-4">
                    <button className="text-blue-400 hover:text-blue-300 mr-2">Sửa</button>
                    <button className="text-red-400 hover:text-red-300">Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
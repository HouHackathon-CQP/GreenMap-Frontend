import React from 'react';
import { Save, Lock, Bell, Globe } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-300">Cài đặt Hệ thống</h2>

      {/* Thông tin chung */}
      <div className="bg-gray-800/60 p-6 rounded-xl shadow-lg border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Thông tin chung</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tên hiển thị</label>
            <input type="text" defaultValue="Admin User" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input type="email" defaultValue="admin@greenmap.vn" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-gray-400 mb-1">Mô tả / Ghi chú</label>
             <textarea className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-green-500 outline-none" rows="3" defaultValue="Quản trị viên chính của hệ thống Bản Đồ Xanh Hà Nội."></textarea>
          </div>
        </div>
      </div>

      {/* Cấu hình & Bảo mật */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cấu hình */}
        <div className="bg-gray-800/60 p-6 rounded-xl shadow-lg border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2 flex items-center"><Globe size={18} className="mr-2"/> Cấu hình</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-gray-300">Ngôn ngữ</span>
                    <select className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2">
                        <option>Tiếng Việt</option>
                        <option>English</option>
                    </select>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-300">Chế độ tối (Dark Mode)</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-500 right-5"/>
                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-600 cursor-pointer"></label>
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <span className="text-gray-300">Nhận Email báo cáo</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded" />
                </div>
            </div>
        </div>

        {/* Bảo mật */}
        <div className="bg-gray-800/60 p-6 rounded-xl shadow-lg border border-gray-700/50">
             <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2 flex items-center"><Lock size={18} className="mr-2"/> Bảo mật</h3>
             <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Mật khẩu hiện tại</label>
                    <input type="password" value="********" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" disabled />
                </div>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">Đổi mật khẩu</button>
             </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
            <Save size={18} className="mr-2" /> Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

// GreenMap-Frontend/src/components/Header.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Import
import { Bell, ChevronDown, Menu, LogOut, Settings } from 'lucide-react';

const notificationsData = [
  { id: 1, title: "Hệ thống", message: "Đồng bộ dữ liệu AQI hoàn tất.", time: "Vừa xong", type: "success" },
  { id: 2, title: "Cảnh báo", message: "Khu vực Cầu Giấy AQI > 150.", time: "15 phút trước", type: "alert" },
];

export default function Header({ setIsSidebarOpen, onLogout }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate(); // Hook

  return (
    <header className="flex-shrink-0 flex items-center justify-between h-16 p-4 md:px-6 bg-gray-900 border-b border-gray-700/50 relative z-20">
      <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
        <Menu size={24} />
      </button>
      
      <div className="hidden lg:block">
        <h2 className="text-xl font-semibold text-gray-100">Hệ Thống Quản Trị Trung Tâm</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="text-gray-400 hover:text-white relative p-1 rounded-md hover:bg-gray-800">
            <Bell size={20} />
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </button>
          {isNotifOpen && (
             <>
               <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
               <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                 <div className="p-3 border-b border-gray-700 font-semibold text-white">Thông báo</div>
                 <div className="max-h-64 overflow-y-auto">
                   {notificationsData.map(n => (
                     <div key={n.id} className="p-3 border-b border-gray-700/50 hover:bg-gray-700 cursor-pointer">
                        <span className={`text-sm font-bold ${n.type === 'alert' ? 'text-red-400' : 'text-green-400'}`}>{n.title}</span>
                        <p className="text-sm text-gray-300">{n.message}</p>
                     </div>
                   ))}
                 </div>
               </div>
             </>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 hover:bg-gray-800 p-2 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow">A</div>
            <span className="hidden md:inline text-sm font-medium text-gray-200">Admin</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                  <p className="text-sm font-bold text-white">Quản Trị Viên</p>
                  <p className="text-xs text-gray-400">admin@greenmap.vn</p>
                </div>
                <ul className="py-1">
                  <li>
                    <button 
                        onClick={() => { navigate('/settings'); setIsUserMenuOpen(false); }} 
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                        <Settings size={16} className="mr-2"/> Cài đặt
                    </button>
                  </li>
                  <li className="border-t border-gray-700 mt-1">
                    <button onClick={onLogout} className="flex items-center w-full px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300">
                      <LogOut size={16} className="mr-2" /> Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
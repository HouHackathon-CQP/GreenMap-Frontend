import React, { useState } from 'react';
import { Bell, User, ChevronDown, Menu, LogOut, Settings, UserCircle } from 'lucide-react';
import { notificationsData } from '../data/mockData'; // Nhớ import dữ liệu

export default function Header({ setIsSidebarOpen, setCurrentPage }) {
  // State để quản lý đóng/mở dropdown
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="flex-shrink-0 flex items-center justify-between h-16 p-4 md:px-6 bg-gray-900 border-b border-gray-700/50 relative z-20">
      <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
        <Menu size={24} />
      </button>
      
      <div className="hidden lg:block">
        <h2 className="text-xl font-semibold text-gray-100">Quản Trị Hệ Thống</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* --- 1. DROPDOWN THÔNG BÁO --- */}
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="text-gray-400 hover:text-white relative focus:outline-none p-1 rounded-md hover:bg-gray-800"
          >
            <Bell size={20} />
            {/* Dấu chấm đỏ thông báo */}
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </button>

          {/* Nội dung Dropdown Thông báo */}
          {isNotifOpen && (
            <>
              {/* Lớp nền vô hình để click ra ngoài thì đóng menu */}
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                <div className="p-3 border-b border-gray-700 font-semibold text-white flex justify-between items-center">
                  <span>Thông báo mới</span>
                  <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">3</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notificationsData.map((notif) => (
                    <div key={notif.id} className="p-3 border-b border-gray-700/50 hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-bold ${notif.type === 'alert' ? 'text-red-400' : 'text-blue-400'}`}>{notif.title}</span>
                        <span className="text-xs text-gray-500">{notif.time}</span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{notif.message}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center border-t border-gray-700 bg-gray-800">
                  <button className="text-xs text-green-400 hover:text-green-300 font-medium">Đánh dấu đã đọc tất cả</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* --- 2. DROPDOWN TÀI KHOẢN --- */}
        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 focus:outline-none hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">A</div>
            <span className="hidden md:inline text-sm font-medium text-gray-200">Admin</span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Nội dung Dropdown User */}
          {isUserMenuOpen && (
            <>
               <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
               <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                  <p className="text-sm font-bold text-white">Quản Trị Viên</p>
                  <p className="text-xs text-gray-400 truncate">admin@greenmap.vn</p>
                </div>
                <ul className="py-1">
                  <li>
                    <button 
                      onClick={() => { setCurrentPage('settings'); setIsUserMenuOpen(false); }}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <UserCircle size={16} className="mr-2 text-blue-400" /> Hồ sơ cá nhân
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { setCurrentPage('settings'); setIsUserMenuOpen(false); }}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <Settings size={16} className="mr-2 text-gray-400" /> Cài đặt hệ thống
                    </button>
                  </li>
                  <li className="border-t border-gray-700 mt-1">
                    <button className="flex items-center w-full px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors">
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
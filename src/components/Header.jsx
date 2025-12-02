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
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Menu, LogOut, Settings, User } from 'lucide-react';
import { fetchReports } from '../services';

export default function Header({ setIsSidebarOpen, onLogout }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [userInfo, setUserInfo] = useState({ name: 'Quản Trị Viên'});
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotifications = async () => {
        try {
            const data = await fetchReports('PENDING', 0, 5);
            const notifs = data.map(report => ({
                id: report.id,
                title: "Báo cáo mới",
                message: report.title,
                time: new Date(report.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
                type: 'alert'
            }));
            setNotifications(notifs);
        } catch (error) { console.error(error); }
    };

    const storedUser = localStorage.getItem('user_info');
    if (storedUser) { try { setUserInfo(JSON.parse(storedUser)); } catch (e) {} }

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex-shrink-0 flex items-center justify-between h-16 p-4 md:px-6 bg-gray-900 border-b border-gray-700/50 relative z-20">
      <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
        <Menu size={24} />
      </button>
      
      <div className="hidden lg:block">
        <h2 className="text-xl font-semibold text-gray-100 tracking-tight">Hệ Thống Quản Trị Trung Tâm</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* --- NOTIFICATIONS --- */}
        <div className="relative">
          <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="text-gray-400 hover:text-white relative p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </button>

          {isNotifOpen && (
             <>
               <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
               
               {/* --- SỬA Ở ĐÂY: CSS Responsive cho Dropdown --- */}
               <div className="
                    z-50 bg-[#111318] rounded-xl shadow-2xl border border-gray-700 overflow-hidden 
                    animate-in fade-in zoom-in-95 duration-200 mt-2
                    
                    /* MOBILE: Dùng Fixed để căn giữa màn hình, cách lề trái phải 1rem */
                    fixed top-16 left-4 right-4 w-auto
                    
                    /* DESKTOP (md trở lên): Dùng Absolute để dính vào icon chuông */
                    md:absolute md:top-full md:right-0 md:left-auto md:w-80
               ">
                 <div className="p-4 border-b border-gray-700 font-bold text-white flex justify-between items-center">
                     <span>Thông báo</span>
                     <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{notifications.length} mới</span>
                 </div>
                 <div className="max-h-80 overflow-y-auto custom-scrollbar">
                   {notifications.length === 0 ? (
                       <div className="p-6 text-center text-gray-500 text-sm">Không có thông báo mới.</div>
                   ) : (
                       notifications.map(n => (
                         <div key={n.id} onClick={() => { navigate('/reports'); setIsNotifOpen(false); }} className="p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors group">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-bold text-red-400 group-hover:text-red-300 transition-colors">{n.title}</span>
                                <span className="text-[10px] text-gray-500">{n.time}</span>
                            </div>
                            <p className="text-sm text-gray-300 line-clamp-2">{n.message}</p>
                         </div>
                       ))
                   )}
                 </div>
                 {notifications.length > 0 && (
                     <div onClick={() => { navigate('/reports'); setIsNotifOpen(false); }} className="p-3 text-center text-xs font-bold text-emerald-500 hover:bg-gray-800 cursor-pointer border-t border-gray-700">
                         Xem tất cả báo cáo
                     </div>
                 )}
               </div>
             </>
          )}
        </div>

        {/* --- USER MENU --- */}
        <div className="relative">
          <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-3 hover:bg-gray-800 p-1.5 pl-3 rounded-xl transition-colors border border-transparent hover:border-gray-700">
            <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-gray-200 leading-tight">{userInfo.name}</div>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/20">
                {userInfo.name.charAt(0).toUpperCase()}
            </div>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-60 bg-[#111318] rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-800 bg-gray-800/30">
                  <p className="text-sm font-bold text-white truncate">{userInfo.name}</p>
                </div>
                <ul className="py-1.5">
                  <li>
                    <button onClick={() => { navigate('/settings'); setIsUserMenuOpen(false); }} className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                        <Settings size={16} className="mr-3 text-gray-500"/> Cài đặt tài khoản
                    </button>
                  </li>
                  <li className="border-t border-gray-800 mt-1 pt-1">
                    <button onClick={onLogout} className="flex items-center w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut size={16} className="mr-3" /> Đăng xuất
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
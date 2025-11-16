import React from 'react';
import { LayoutDashboard, Map, MapPin, BatteryCharging, Flag, BarChart3, Settings, X, Globe } from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, isOpen, setIsOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'airMap', label: 'Bản đồ Phân vùng', icon: Globe },
    { id: 'sensors', label: 'Quản lý Cảm biến', icon: MapPin },
    { id: 'greenPoints', label: 'Quản lý Điểm Xanh', icon: Map },
    { id: 'chargingStations', label: 'Quản lý Trạm Sạc', icon: BatteryCharging },
    { id: 'reports', label: 'Duyệt Báo cáo', icon: Flag },
    { id: 'analytics', label: 'Phân tích & Dự báo', icon: BarChart3 },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setIsOpen(false)}></div>
      )}
      <nav className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:flex lg:flex-col border-r border-gray-700/50`}>
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700/50">
          <h1 className="text-xl font-bold text-green-400">Bản Đồ Xanh</h1>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <ul className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <li key={item.id}>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(item.id); setIsOpen(false); }} className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${currentPage === item.id ? 'bg-green-600/20 text-green-300 font-medium' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}>
                <item.icon size={20} className="mr-3" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t border-gray-700/50">
          <p className="text-xs text-gray-500">© 2025 Green Hanoi Project</p>
        </div>
      </nav>
    </>
  );
}
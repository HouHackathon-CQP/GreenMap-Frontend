// GreenMap-Frontend/src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom'; // <-- Dùng NavLink
import { 
  LayoutDashboard, Map, BatteryCharging, Flag, 
  BarChart3, Settings, X, Globe, Bike, MapPin, 
  Newspaper, Users, ShieldCheck 
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  
  // Hàm tạo Link thông minh
  const NavItem = ({ to, label, icon: Icon }) => (
    <li>
      <NavLink
        to={to}
        onClick={() => setIsOpen(false)} // Đóng sidebar mobile khi click
        className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors duration-200 mb-1 ${
            isActive
              ? 'bg-green-600 text-white font-semibold shadow-md' // Style khi đang chọn
              : 'text-gray-400 hover:bg-gray-800 hover:text-green-400' // Style thường
          }`
        }
      >
        <Icon size={20} className="mr-3" />
        <span className="text-sm">{label}</span>
      </NavLink>
    </li>
  );

  const SectionTitle = ({ title }) => (
    <li className="px-3 mt-6 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
      {title}
    </li>
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setIsOpen(false)}></div>
      )}

      <nav className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:flex lg:flex-col border-r border-gray-700`}>
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded bg-green-600 flex items-center justify-center mr-2 font-bold text-white">GM</div>
            <span className="text-lg font-bold text-white tracking-tight">Admin Portal</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <ul className="flex-1 p-3 overflow-y-auto custom-scrollbar">
          <SectionTitle title="Giám sát" />
          <NavItem to="/dashboard" label="Tổng quan" icon={LayoutDashboard} />
          <NavItem to="/map" label="Bản đồ AQI" icon={Globe} />
          <NavItem to="/news" label="Tin tức" icon={Newspaper} />

          <SectionTitle title="Dữ liệu" />
          <NavItem to="/parks" label="Công viên" icon={Map} />
          <NavItem to="/charging" label="Trạm sạc" icon={BatteryCharging} />
          <NavItem to="/bikes" label="Xe đạp" icon={Bike} />
          <NavItem to="/tourist" label="Du lịch" icon={MapPin} />

          <SectionTitle title="Quản trị" />
          <NavItem to="/reports" label="Duyệt Báo cáo" icon={Flag} />
          <NavItem to="/users" label="Người dùng" icon={Users} />

          <SectionTitle title="Hệ thống" />
          <NavItem to="/analytics" label="Phân tích" icon={BarChart3} />
          <NavItem to="/settings" label="Cấu hình" icon={Settings} />
        </ul>

        <div className="p-4 border-t border-gray-700 bg-gray-800/30">
          <div className="flex items-center text-xs text-gray-400">
             <ShieldCheck className="text-green-500 mr-2" size={16}/> Secure Admin Access
          </div>
        </div>
      </nav>
    </>
  );
}
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

import React from 'react';
import { NavLink } from 'react-router-dom'; 
import { 
  LayoutDashboard, Map, BatteryCharging, Flag, 
  BarChart3, Settings, X, Globe, Bike, MapPin, 
  Newspaper, Users, ShieldCheck 
} from 'lucide-react';

import logoImg from '../assets/logo.png'; 

const NavItem = ({ to, label, icon: IconComponent, onNavigate }) => (
  <li>
    <NavLink
      to={to}
      onClick={onNavigate} 
      className={({ isActive }) => 
        `flex items-center p-3 rounded-lg transition-colors duration-200 mb-1 ${
          isActive
            ? 'bg-green-600 text-white font-semibold shadow-md' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-green-600 dark:hover:text-green-400' 
        }`
      }
    >
      {React.createElement(IconComponent, { size: 20, className: 'mr-3' })}
      <span className="text-sm">{label}</span>
    </NavLink>
  </li>
);

const SectionTitle = ({ title }) => (
  <li className="px-3 mt-6 mb-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
    {title}
  </li>
);

export default function Sidebar({ isOpen, setIsOpen }) {
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={closeSidebar}></div>
      )}

      <nav className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 
        bg-white dark:bg-gray-900 
        transition-all duration-300 ease-in-out transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:flex lg:flex-col 
        border-r border-gray-200 dark:border-gray-700
      `}>
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded flex items-center justify-center mr-2 overflow-hidden">
                <img src={logoImg} alt="Logo" className="w-full h-full object-contain"/>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Admin Portal</span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <ul className="flex-1 p-3 overflow-y-auto custom-scrollbar">
          <SectionTitle title="Giám sát" />
          <NavItem to="/dashboard" label="Tổng quan" icon={LayoutDashboard} onNavigate={closeSidebar} />
          <NavItem to="/map" label="Bản đồ chính" icon={Globe} onNavigate={closeSidebar} />
          <NavItem to="/news" label="Tin tức" icon={Newspaper} onNavigate={closeSidebar} />

          <SectionTitle title="Dữ liệu" />
          <NavItem to="/parks" label="Công viên" icon={Map} onNavigate={closeSidebar} />
          <NavItem to="/charging" label="Trạm sạc" icon={BatteryCharging} onNavigate={closeSidebar} />
          <NavItem to="/bikes" label="Xe đạp" icon={Bike} onNavigate={closeSidebar} />
          <NavItem to="/tourist" label="Du lịch" icon={MapPin} onNavigate={closeSidebar} />

          <SectionTitle title="Quản trị" />
          <NavItem to="/reports" label="Duyệt Báo cáo" icon={Flag} onNavigate={closeSidebar} />
          <NavItem to="/users" label="Người dùng" icon={Users} onNavigate={closeSidebar} />

          <SectionTitle title="Hệ thống" />
          <NavItem to="/analytics" label="Phân tích" icon={BarChart3} onNavigate={closeSidebar} />
          <NavItem to="/settings" label="Cấu hình" icon={Settings} onNavigate={closeSidebar} />
        </ul>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
             <ShieldCheck className="text-green-600 dark:text-green-500 mr-2" size={16}/> Secure Admin Access
          </div>
        </div>
      </nav>
    </>
  );
}
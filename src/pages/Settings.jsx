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
import { Save, Lock, Globe, Mail } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-emerald-300 transition-colors duration-300">Cài đặt Hệ thống</h2>

      {/* Thông tin chung */}
      <div className="bg-white dark:bg-gray-800/60 p-6 rounded-xl shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Thông tin chung</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tên hiển thị</label>
            <input 
                type="text" 
                defaultValue="Admin User" 
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
            <input 
                type="email" 
                defaultValue="admin@greenmap.vn" 
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors" 
            />
          </div>
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Mô tả / Ghi chú</label>
             <textarea 
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors" 
                rows="3" 
                defaultValue="Quản trị viên chính của hệ thống Bản Đồ Xanh Hà Nội."
             ></textarea>
          </div>
        </div>
      </div>

      {/* Cấu hình & Bảo mật */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cấu hình */}
        <div className="bg-white dark:bg-gray-800/60 p-6 rounded-xl shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center">
                <Globe size={18} className="mr-2 text-blue-500"/> Cấu hình
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Ngôn ngữ hiển thị</span>
                    <select className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2 outline-none">
                        <option>Tiếng Việt</option>
                        <option>English</option>
                    </select>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 flex items-center"><Mail size={16} className="mr-2 opacity-70"/> Nhận Email báo cáo</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600" />
                </div>
            </div>
        </div>

        {/* Bảo mật */}
        <div className="bg-white dark:bg-gray-800/60 p-6 rounded-xl shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center">
                <Lock size={18} className="mr-2 text-red-500"/> Bảo mật
             </h3>
             <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Mật khẩu hiện tại</label>
                    <input type="password" value="********" className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white cursor-not-allowed" disabled />
                </div>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium hover:underline">Đổi mật khẩu</button>
             </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-transform transform hover:scale-105 active:scale-95">
            <Save size={18} className="mr-2" /> Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
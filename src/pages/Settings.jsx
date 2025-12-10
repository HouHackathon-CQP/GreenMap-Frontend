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

import React, { useEffect, useState } from 'react';
import { Save, Lock, User, Loader2, CheckCircle, AlertCircle, Shield, Key, Camera } from 'lucide-react';
import { findUserByEmail, updateUser, changePasswordMe } from '../services';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // State chứa thông tin user
  const [profile, setProfile] = useState({
      id: null, full_name: '', email: '', role: '', is_active: true
  });

  // State form đổi mật khẩu
  const [passwords, setPasswords] = useState({
      current: '', new: '', confirm: ''
  });

  // State thông báo
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. KHI VÀO TRANG: LẤY THÔNG TIN
  useEffect(() => {
      const loadMyProfile = async () => {
          setDataLoading(true);
          const stored = localStorage.getItem('user_info');
          if (stored) {
              const u = JSON.parse(stored);
              const myUser = await findUserByEmail(u.email);
              if (myUser) setProfile(myUser);
          }
          setDataLoading(false);
      };
      loadMyProfile();
  }, []);

  const showMessage = (type, text) => {
      setMessage({ type, text });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // 2. CẬP NHẬT TÊN / EMAIL
  const handleUpdateProfile = async () => {
      if (!profile.id) return;
      setLoading(true);
      try {
          await updateUser(profile.id, {
              full_name: profile.full_name,
              email: profile.email,
              role: profile.role,
              is_active: profile.is_active
          });
          
          const stored = JSON.parse(localStorage.getItem('user_info') || '{}');
          localStorage.setItem('user_info', JSON.stringify({
              ...stored,
              name: profile.full_name,
              email: profile.email,
              avatar: profile.full_name.charAt(0).toUpperCase()
          }));

          showMessage('success', 'Đã lưu thông tin hồ sơ.');
          window.dispatchEvent(new Event('storage')); 
      } catch (error) {
          showMessage('error', 'Lỗi cập nhật: ' + error.message);
      } finally {
          setLoading(false);
      }
  };

  // 3. ĐỔI MẬT KHẨU
  const handleChangePassword = async () => {
      if (!passwords.current || !passwords.new || !passwords.confirm) {
          showMessage('error', 'Vui lòng nhập đủ thông tin mật khẩu.'); return;
      }
      if (passwords.new !== passwords.confirm) {
          showMessage('error', 'Mật khẩu mới không khớp.'); return;
      }
      if (passwords.new === passwords.current) {
          showMessage('error', 'Mật khẩu mới phải khác mật khẩu hiện tại.'); return;
      }
      if (passwords.new.length < 6) {
          showMessage('error', 'Mật khẩu phải có ít nhất 6 ký tự.'); return;
      }
      
      // Kiểm tra mật khẩu mạnh
      const hasUpperCase = /[A-Z]/.test(passwords.new);
      const hasLowerCase = /[a-z]/.test(passwords.new);
      const hasNumbers = /\d/.test(passwords.new);
      
      if (!hasUpperCase) {
          showMessage('error', 'Mật khẩu phải chứa ít nhất một chữ cái in hoa.'); return;
      }
      if (!hasLowerCase) {
          showMessage('error', 'Mật khẩu phải chứa ít nhất một chữ cái thường.'); return;
      }
      if (!hasNumbers) {
          showMessage('error', 'Mật khẩu phải chứa ít nhất một số.'); return;
      }

      setLoading(true);
      try {
          await changePasswordMe(passwords.current, passwords.new);
          showMessage('success', 'Đổi mật khẩu thành công!');
          setPasswords({ current: '', new: '', confirm: '' });
      } catch (error) {
          showMessage('error', 'Mật khẩu hiện tại không đúng.');
      } finally {
          setLoading(false);
      }
  };

  if (dataLoading) {
      return <div className="h-96 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-emerald-500 mb-2" size={40}/><span className="text-gray-500 font-medium">Đang tải hồ sơ...</span></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* HEADER & TITLE */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
        <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Cài đặt Tài khoản</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý thông tin cá nhân và bảo mật đăng nhập.</p>
        </div>
        {/* Toast Notification */}
        {message.text && (
            <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-xl animate-in slide-in-from-right-10 fade-in duration-300 ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                {message.type === 'success' ? <CheckCircle size={18} className="mr-2"/> : <AlertCircle size={18} className="mr-2"/>}
                {message.text}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === LEFT COLUMN: PROFILE CARD (Span 7) === */}
        <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                {/* Banner Gradient */}
                <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                </div>
                
                {/* Avatar & Content */}
                <div className="px-8 pb-8 flex-1 flex flex-col">
                    <div className="relative -mt-12 mb-6 flex justify-between items-end">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#111318] p-1 shadow-2xl">
                                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-4xl font-bold text-gray-400 dark:text-gray-500">
                                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <User/>}
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full border-2 border-white dark:border-[#111318] text-gray-500 cursor-not-allowed">
                                <Camera size={14}/>
                            </div>
                        </div>
                        <div className="mb-1">
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center">
                                <Shield size={12} className="mr-1.5"/> {profile.role}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Họ và tên</label>
                                <input 
                                    type="text" 
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Email đăng nhập</label>
                                <input 
                                    type="email" 
                                    value={profile.email}
                                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">ID Người dùng</label>
                            <input 
                                type="text" 
                                value={`User ID: #${profile.id}`}
                                disabled
                                className="w-full bg-gray-100 dark:bg-gray-800/50 border border-transparent rounded-xl p-3 text-gray-500 dark:text-gray-400 font-mono text-sm" 
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button onClick={handleUpdateProfile} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center">
                                {loading ? <Loader2 size={18} className="animate-spin mr-2"/> : <Save size={18} className="mr-2" />} 
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* === RIGHT COLUMN: SECURITY CARD (Span 5) === */}
        <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-sm transition-colors duration-300 h-full">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg mr-3 text-red-500"><Key size={20}/></div>
                    Đổi mật khẩu
                </h3>
                
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Mật khẩu hiện tại</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                value={passwords.current}
                                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 pl-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors placeholder-gray-400" 
                                placeholder="••••••••"
                            />
                            <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400"/>
                        </div>
                    </div>
                    
                    <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-2"></div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Mật khẩu mới</label>
                        <input 
                            type="password" 
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors placeholder-gray-400" 
                            placeholder="Tối thiểu 6 ký tự (chữ hoa, thường, số)"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Xác nhận mật khẩu</label>
                        <input 
                            type="password" 
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors placeholder-gray-400" 
                            placeholder="Nhập lại mật khẩu mới"
                        />
                    </div>

                    <button onClick={handleChangePassword} disabled={loading} className="w-full mt-2 bg-white dark:bg-transparent border-2 border-red-500 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                        {loading ? <Loader2 size={18} className="animate-spin"/> : 'Xác nhận thay đổi'}
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
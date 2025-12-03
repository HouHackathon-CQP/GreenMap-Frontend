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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { loginUser } from '../services';
import { Loader2, Lock, User } from 'lucide-react';

import logoImg from '../assets/logo.png'; 

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await loginUser(username, password);
      
      if (data && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        
        const userInfo = {
            name: username === 'admin' ? 'Quản Trị Viên' : username,
            email: `${username}@greenmap.vn`,
            avatar: username.charAt(0).toUpperCase()
        };
        localStorage.setItem('user_info', JSON.stringify(userInfo));

        navigate('/dashboard', { replace: true });
      } else {
        setError('Token không hợp lệ hoặc lỗi server.');
      }
    } catch (err) {
      console.error(err);
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Sửa nền chính: bg-gray-50 (Sáng) / dark:bg-gray-900 (Tối)
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      
      {/* Sửa Card: bg-white (Sáng) / dark:bg-gray-800 (Tối) */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        
        {/* LOGO SECTION */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 mb-4 p-4 border border-emerald-500/30 shadow-lg">
            <img 
              src={logoImg} 
              alt="GreenMap Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">GreenMap Admin</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium">Hệ thống Quản trị Bản đồ Xanh</p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-center text-sm font-medium flex items-center justify-center animate-in fade-in slide-in-from-top-1">
                {error}
            </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">Tài khoản</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-gray-400" size={18} />
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600" 
                placeholder="Nhập username" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-gray-400" size={18} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600" 
                placeholder="••••••••" 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'Đăng Nhập Hệ Thống'}
          </button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
                Quên mật khẩu? <span className="text-emerald-600 dark:text-emerald-500 cursor-pointer hover:underline">Liên hệ kỹ thuật</span>
            </p>
        </div>
      </div>
    </div>
  );
}
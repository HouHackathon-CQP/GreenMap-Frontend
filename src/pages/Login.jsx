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
import { Loader2, Lock, User, AlertCircle } from 'lucide-react';
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
      // 1. Kiểm tra input
      if (!username.trim()) {
        setError('Vui lòng nhập tài khoản/email.');
        setIsLoading(false);
        return;
      }
      if (!password.trim()) {
        setError('Vui lòng nhập mật khẩu.');
        setIsLoading(false);
        return;
      }

      // 2. Lấy Token
      const data = await loginUser(username, password);
      
      if (data && data.access_token) {
        navigate('/dashboard', { replace: true });
      } else {
        setError('❌ Tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      console.error('Login Error:', err);
      
      // Xử lý các lỗi cụ thể từ backend
      if (err.message && err.message.includes('401')) {
        setError('❌ Tài khoản hoặc mật khẩu sai. Vui lòng kiểm tra lại.');
      } else if (err.message && err.message.includes('404')) {
        setError('❌ Tài khoản không tồn tại trong hệ thống.');
      } else if (err.message && err.message.includes('Incorrect')) {
        setError('❌ Tài khoản hoặc mật khẩu sai. Vui lòng thử lại.');
      } else if (err.message && err.message.includes('Not authenticated')) {
        setError('❌ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else {
        setError('❌ Đăng nhập thất bại. Vui lòng kiểm tra kết nối và thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mb-4 shadow-lg shadow-emerald-500/30">
            <img src={logoImg} alt="Logo" className="w-12 h-12 object-contain brightness-0 invert" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">GreenMap Admin</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Hệ thống Quản trị</p>
        </div>

        {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 dark:border-red-500/50 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6 text-sm font-semibold flex items-start animate-in fade-in zoom-in-95">
                <AlertCircle size={20} className="mr-3 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-500"/> 
                <div>
                  <p className="font-bold">Đăng nhập không thành công</p>
                  <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>
                </div>
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">Email / Tài khoản</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-gray-400" size={18} />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} 
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                placeholder="Nhập tài khoản..." required />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-gray-400" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" disabled={isLoading} 
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
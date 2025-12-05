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
import { loginUser, fetchUsers } from '../services'; // Import fetchUsers
import { Loader2, Lock, User, ShieldAlert } from 'lucide-react';
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
      // BƯỚC 1: Login để lấy Token
      const data = await loginUser(username, password);
      
      if (data && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        
        // BƯỚC 2: TỰ TÌM THÔNG TIN CỦA CHÍNH MÌNH (LẤY ID & ROLE)
        // Vì API login không trả về ID, ta phải tìm trong danh sách users
        let currentUser = null;
        try {
            // Lấy 100 user đầu tiên để tìm
            const usersList = await fetchUsers(0, 100);
            
            // Tìm user có email trùng với username vừa nhập
            currentUser = usersList.find(u => 
                u.email.toLowerCase() === username.trim().toLowerCase()
            );
        } catch (err) {
            console.warn("Không thể tải danh sách user để xác thực quyền.");
        }

        // BƯỚC 3: XÁC ĐỊNH ROLE & ID
        // Nếu tìm thấy trong DB thì dùng data thật, nếu không thì fallback (để test)
        const userRole = currentUser ? currentUser.role : (username.includes('admin') ? 'ADMIN' : 'CITIZEN');
        const userId = currentUser ? currentUser.id : null;
        const fullName = currentUser ? currentUser.full_name : username;

        // BƯỚC 4: CHẶN QUYỀN (Chỉ Admin/Manager được vào)
        if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
            throw new Error('Tài khoản của bạn không có quyền truy cập trang Quản trị.');
        }

        if (!userId && userRole !== 'ADMIN') {
             // Nếu không tìm thấy ID mà cũng không phải Admin hardcode -> Cảnh báo
             console.warn("Cảnh báo: Đăng nhập thành công nhưng không tìm thấy ID user.");
        }

        // BƯỚC 5: LƯU LOCALSTORAGE (QUAN TRỌNG: PHẢI CÓ ID)
        const userInfo = {
            id: userId,          // Đây là cái Settings cần
            name: fullName,
            email: username,
            role: userRole,
            avatar: fullName.charAt(0).toUpperCase()
        };
        localStorage.setItem('user_info', JSON.stringify(userInfo));

        navigate('/dashboard', { replace: true });
      } else {
        setError('Token không hợp lệ hoặc lỗi server.');
      }
    } catch (err) {
      console.error(err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 mb-4 p-4 border border-emerald-500/30 shadow-lg">
            <img src={logoImg} alt="GreenMap Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">GreenMap Admin</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium">Hệ thống Quản trị Bản đồ Xanh</p>
        </div>

        {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm font-bold flex items-center animate-in fade-in slide-in-from-top-1">
                <ShieldAlert size={18} className="mr-2 flex-shrink-0"/>
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">Email</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-gray-400" size={18} />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 p-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-600" placeholder="admin@greenmap.vn" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-gray-400" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 p-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-600" placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-70">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
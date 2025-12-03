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
import { fetchUsers, toggleUserStatus } from '../services';
import { Loader2, Search, Shield, ShieldAlert, User, Lock, Unlock } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchUsers().then(data => { setUsers(data); setLoading(false); }); }, []);

  const handleToggleStatus = async (userId) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u);
    setUsers(updatedUsers);
    await toggleUserStatus(userId, true);
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-500" size={30}/></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Quản lý Người dùng</h2>
        <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg pl-10 p-2.5 outline-none focus:border-emerald-500 transition-colors shadow-sm"
            />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold">
                <tr>
                    <th className="px-6 py-4">Tên</th>
                    <th className="px-6 py-4">Vai trò</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                    <tr key={user.id} className="bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 flex items-center">
                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-bold text-gray-700 dark:text-white mr-3 shadow-inner">
                                {user.full_name.charAt(0)}
                            </div>
                            <div>
                                <div className="text-gray-900 dark:text-white font-medium">{user.full_name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            {user.role === 'ADMIN' ? <span className="text-red-600 dark:text-red-400 flex items-center font-bold"><ShieldAlert size={14} className="mr-1"/> Admin</span> :
                             user.role === 'MANAGER' ? <span className="text-blue-600 dark:text-blue-400 flex items-center font-bold"><Shield size={14} className="mr-1"/> Quản lý</span> :
                             <span className="text-gray-600 dark:text-gray-400 flex items-center"><User size={14} className="mr-1"/> Công dân</span>}
                        </td>
                        <td className="px-6 py-4">
                            {user.is_active ? 
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Hoạt động</span> : 
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">Đã khóa</span>
                            }
                        </td>
                        <td className="px-6 py-4 text-right">
                            {user.role !== 'ADMIN' && (
                                <button 
                                    onClick={() => handleToggleStatus(user.id)} 
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 flex items-center ml-auto ${
                                        user.is_active 
                                        ? 'border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                                        : 'border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                    }`}
                                >
                                    {user.is_active ? <><Lock size={12} className="mr-1.5"/> Khóa</> : <><Unlock size={12} className="mr-1.5"/> Mở</>}
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
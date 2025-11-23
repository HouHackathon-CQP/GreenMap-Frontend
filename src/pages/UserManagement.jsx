// GreenMap-Frontend/src/pages/UserManagement.jsx
import React, { useEffect, useState } from 'react';
import { fetchUsers, toggleUserStatus } from '../apiService';
import { Loader2, Search, Shield, ShieldAlert, User, Lock, Unlock } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers().then(data => { setUsers(data); setLoading(false); });
  }, []);

  const handleToggleStatus = async (userId) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u);
    setUsers(updatedUsers);
    await toggleUserStatus(userId, true);
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-green-500" size={30}/></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Quản lý Người dùng</h2>
        <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
            <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 p-2.5 outline-none focus:border-green-500"/>
        </div>
      </div>

      <div className="bg-gray-800/60 rounded-xl shadow border border-gray-700 overflow-hidden">
        <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs uppercase bg-gray-900/50 text-gray-400">
                <tr>
                    <th className="px-6 py-4">Tên</th>
                    <th className="px-6 py-4">Vai trò</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
            </thead>
            <tbody>
                {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                        <td className="px-6 py-4 flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold text-white mr-3">{user.full_name.charAt(0)}</div>
                            <div>
                                <div className="text-white font-medium">{user.full_name}</div>
                                <div className="text-xs">{user.email}</div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            {user.role === 'ADMIN' ? <span className="text-red-400 flex items-center"><ShieldAlert size={14} className="mr-1"/> Admin</span> :
                             user.role === 'MANAGER' ? <span className="text-blue-400 flex items-center"><Shield size={14} className="mr-1"/> Quản lý</span> :
                             <span className="text-gray-400 flex items-center"><User size={14} className="mr-1"/> Công dân</span>}
                        </td>
                        <td className="px-6 py-4">
                            {user.is_active ? <span className="text-green-400">Hoạt động</span> : <span className="text-gray-500">Đã khóa</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                            {user.role !== 'ADMIN' && (
                                <button onClick={() => handleToggleStatus(user.id)} className={`px-3 py-1 rounded text-xs border ${user.is_active ? 'border-red-900 text-red-400 hover:bg-red-900/20' : 'border-green-900 text-green-400 hover:bg-green-900/20'}`}>
                                    {user.is_active ? <span className="flex items-center"><Lock size={12} className="mr-1"/> Khóa</span> : <span className="flex items-center"><Unlock size={12} className="mr-1"/> Mở</span>}
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
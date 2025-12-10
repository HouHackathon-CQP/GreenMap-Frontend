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

import React, { useState, useEffect } from 'react';
import { fetchUsers, createUser, createUserAdmin, updateUser, deleteUser } from '../services';
import { Loader2, Search, Shield, ShieldAlert, User, Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, LayoutList, Lock, Unlock, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';

// --- VALIDATION HELPERS ---
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email không được để trống';
    if (!emailRegex.test(email)) return 'Email không hợp lệ (ví dụ: user@gmail.com)';
    return '';
};

const validatePassword = (password, isEdit = false) => {
    if (isEdit && !password) return '';
    if (!isEdit && !password) return 'Mật khẩu không được để trống';
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    if (password.length > 50) return 'Mật khẩu không vượt quá 50 ký tự';
    if (!/[A-Z]/.test(password)) return 'Phải có ít nhất 1 chữ in hoa (A-Z)';
    if (!/[a-z]/.test(password)) return 'Phải có ít nhất 1 chữ thường (a-z)';
    if (!/[0-9]/.test(password)) return 'Phải có ít nhất 1 chữ số (0-9)';
    return '';
};

const validateFullName = (fullName) => {
    if (!fullName) return 'Họ tên không được để trống';
    if (fullName.trim().length < 2) return 'Họ tên tối thiểu 2 ký tự';
    if (fullName.length > 100) return 'Họ tên tối đa 100 ký tự';
    return '';
};

// --- PASSWORD STRENGTH ---
const PasswordStrengthMeter = ({ password, isEdit }) => {
    if (isEdit && !password) return null;
    const checks = {
        length: password.length >= 6,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    const colors = ['bg-red-500','bg-yellow-500','bg-yellow-500','bg-blue-500','bg-emerald-500'];
    const labels = ['Rất yếu','Yếu','Trung bình','Mạnh','Rất mạnh'];

    return (
        <div className="space-y-2 text-xs">
            <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full ${i < score ? colors[score] : 'bg-gray-300 dark:bg-gray-700'}`} />
                ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <StrengthItem ok={checks.length} label="≥ 6 ký tự" />
                <StrengthItem ok={checks.upper} label="Chữ hoa (A-Z)" />
                <StrengthItem ok={checks.lower} label="Chữ thường (a-z)" />
                <StrengthItem ok={checks.number} label="Chữ số (0-9)" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Mức độ: <span className="font-bold">{labels[score]}</span></p>
        </div>
    );
};

const StrengthItem = ({ ok, label }) => (
    <span className={`flex items-center ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {ok ? <CheckCircle size={14} className="mr-1"/> : <AlertCircle size={14} className="mr-1"/>}
        {label}
    </span>
);

// --- MODAL USER ---
const UserModal = ({ isOpen, onClose, onSubmit, initialData, title, error, setError }) => {
    const [formData, setFormData] = useState({ 
        email: '', full_name: '', password: '', role: 'CITIZEN', is_active: true 
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [passwordVisible, setPasswordVisible] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({ 
                email: initialData.email || '', 
                full_name: initialData.full_name || '', 
                role: initialData.role || 'CITIZEN', 
                is_active: initialData.is_active !== undefined ? initialData.is_active : true,
                password: '' 
            });
        } else {
            setFormData({ email: '', full_name: '', password: '', role: 'CITIZEN', is_active: true });
        }
        setError('');
        setFieldErrors({});
    }, [initialData, isOpen, setError]);

    if (!isOpen) return null;

    const validateFields = () => {
        const errors = {};
        const emailErr = validateEmail(formData.email);
        if (emailErr) errors.email = emailErr;
        const nameErr = validateFullName(formData.full_name);
        if (nameErr) errors.full_name = nameErr;
        const passwordErr = validatePassword(formData.password, Boolean(initialData));
        if (passwordErr) errors.password = passwordErr;
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!validateFields()) return;
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-700/60 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"><X size={20}/></button>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{title}</h3>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-2">
                        <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"/>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Email đăng nhập</label>
                        <input 
                            required 
                            type="email" 
                            className={`w-full bg-gray-50 dark:bg-gray-900 border ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-emerald-500'} p-3 rounded-xl text-gray-900 dark:text-white outline-none transition-colors`} 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            placeholder="user@example.com"
                        />
                        {fieldErrors.email && <p className="text-sm text-red-600 flex items-center mt-1"><AlertCircle size={16} className="mr-1" />{fieldErrors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Họ tên</label>
                        <input 
                            required 
                            type="text" 
                            className={`w-full bg-gray-50 dark:bg-gray-900 border ${fieldErrors.full_name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-emerald-500'} p-3 rounded-xl text-gray-900 dark:text-white outline-none transition-colors`} 
                            value={formData.full_name} 
                            onChange={e => setFormData({...formData, full_name: e.target.value})} 
                            placeholder="Nguyễn Văn A"
                        />
                        {fieldErrors.full_name && <p className="text-sm text-red-600 flex items-center mt-1"><AlertCircle size={16} className="mr-1" />{fieldErrors.full_name}</p>}
                    </div>
                    
                    <div>
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Mật khẩu {initialData && <span className="text-gray-500 text-xs">(để trống nếu không đổi)</span>}</label>
                            <button type="button" onClick={() => setPasswordVisible(p => !p)} className="text-sm text-emerald-600 hover:text-emerald-500 flex items-center">
                                {passwordVisible ? <EyeOff size={16} className="mr-1"/> : <Eye size={16} className="mr-1"/>}
                                {passwordVisible ? 'Ẩn' : 'Hiện'}
                            </button>
                        </div>
                        <input 
                            type={passwordVisible ? 'text' : 'password'} 
                            className={`w-full bg-gray-50 dark:bg-gray-900 border ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-emerald-500'} p-3 rounded-xl text-gray-900 dark:text-white outline-none transition-colors`} 
                            value={formData.password} 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                            placeholder={initialData ? 'Để trống nếu không đổi' : '••••••••'}
                            required={!initialData}
                        />
                        {fieldErrors.password && <p className="text-sm text-red-600 flex items-center mt-1"><AlertCircle size={16} className="mr-1" />{fieldErrors.password}</p>}
                        <div className="mt-2"><PasswordStrengthMeter password={formData.password} isEdit={Boolean(initialData)} /></div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Vai trò</label>
                        <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-3 rounded-xl text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition-colors" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="CITIZEN">Công dân (Citizen)</option>
                            <option value="MANAGER">Quản lý (Manager)</option>
                            <option value="ADMIN">Quản trị viên (Admin)</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Trạng thái hoạt động</span>
                        <button type="button" onClick={() => setFormData({...formData, is_active: !formData.is_active})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Hủy</button>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
export default function UserManagement() {
  const [allUsers, setAllUsers] = useState([]); // Lưu toàn bộ user để search client-side
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalError, setModalError] = useState('');
  
  // Auth
  const [currentUserRole, setCurrentUserRole] = useState('CITIZEN');

  useEffect(() => {
    const stored = localStorage.getItem('user_info');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setCurrentUserRole(u.role || 'CITIZEN');
      } catch (error) {
        console.warn("Failed to parse user info:", error);
      }
    }
  }, []);

  const isAdmin = currentUserRole === 'ADMIN';

  // Load Data (Batch Fetching)
  const loadData = async () => {
      setLoading(true);
      try {
          const data = await fetchUsers();
          setAllUsers(data);
          // Nếu đang ở trang xa mà search/reload -> về trang 1
          if (page > 1 && data.length < (page - 1) * limit) setPage(1); 
      } catch (e) { 
          console.error(e); 
      } finally { 
          setLoading(false); 
      }
  };

  useEffect(() => { loadData(); }, []);

  // Handlers
  const handleCreate = () => { setEditingUser(null); setIsModalOpen(true); };
  const handleEdit = (user) => { setEditingUser(user); setIsModalOpen(true); };

  const handleDelete = async (id) => {
      if(window.confirm("CẢNH BÁO: Bạn chắc chắn muốn xóa người dùng này?")) {
          try { 
              await deleteUser(id); 
              setAllUsers(prev => prev.filter(u => u.id !== id));
          } 
          catch (e) { alert("Lỗi xóa: " + e.message); }
      }
  };

  const handleSubmit = async (formData) => {
      setModalError('');
      try {
          if (editingUser) {
              // Cập nhật user (vẫn dùng API thường)
              await updateUser(editingUser.id, formData);
              setAllUsers(prev => prev.map(u => u.id === editingUser.id ? {...u, ...formData} : u));
          } else {
              // Tạo user mới - sử dụng API admin/create nếu là ADMIN
              let newUser;
              if (isAdmin) {
                  // Dùng API admin/create (có quyền set role)
                  newUser = await createUserAdmin(formData);
              } else {
                  // Dùng API user tường thường (không set role)
                  newUser = await createUser(formData);
                  // Fix lỗi backend không lưu role khi tạo mới
                  if (newUser && newUser.role !== formData.role) {
                      await updateUser(newUser.id, { role: formData.role });
                      newUser.role = formData.role;
                  }
              }
              setAllUsers(prev => [newUser, ...prev]);
          }
          setIsModalOpen(false);
          setEditingUser(null);
      } catch (e) {
          console.error('Error:', e);
          // Xử lý các lỗi cụ thể từ backend
          if (e.message && e.message.includes('already registered')) {
              setModalError('❌ Email này đã được đăng ký. Vui lòng dùng email khác.');
          } else if (e.message && e.message.includes('Not authenticated')) {
              setModalError('❌ Bạn không có quyền thực hiện hành động này. Liên hệ admin.');
          } else if (e.message && e.message.includes('already exists')) {
              setModalError('❌ Tài khoản này đã tồn tại.');
          } else {
              setModalError(`❌ Lỗi: ${e.message || 'Không thể tạo/cập nhật user'}`);
          }
      }
  };

  // --- CLIENT-SIDE FILTER & PAGINATION ---
  const filteredUsers = allUsers.filter(u => 
    (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / limit) || 1;
  const startIndex = (page - 1) * limit;
  const currentData = filteredUsers.slice(startIndex, startIndex + limit);

  return (
    <div className="h-full flex flex-col space-y-6 pb-6">
      <UserModal isOpen={isModalOpen} onClose={() => {setIsModalOpen(false); setModalError('');}} onSubmit={handleSubmit} initialData={editingUser} title={editingUser ? "Cập nhật" : "Thêm User Mới"} error={modalError} setError={setModalError} />
      
      {/* HEADER */}
      <div className="bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 transition-colors duration-300">
        <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center tracking-tight">
                <LayoutList className="mr-3 text-emerald-600 dark:text-emerald-500" size={28}/> Quản lý Người dùng
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium ml-10">
                {loading ? "Đang đồng bộ dữ liệu..." : `Tổng số: ${filteredUsers.length} tài khoản`}
            </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative group flex-1 sm:w-72">
                <Search className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Tìm tên hoặc email..." 
                    value={searchTerm} 
                    onChange={e => { setSearchTerm(e.target.value); setPage(1); }} 
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                />
            </div>
            {isAdmin && (
                <button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center whitespace-nowrap active:scale-95">
                    <Plus size={20} className="mr-2"/> Thêm User
                </button>
            )}
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col relative transition-colors duration-300">
        <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
                <tr>
                    <th className="p-5 pl-8 w-24">ID</th>
                    <th className="p-5">Thông tin</th>
                    <th className="p-5">Vai trò</th>
                    <th className="p-5 w-36 text-center">Trạng thái</th>
                    <th className="p-5 w-28 text-right pr-8">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50 text-sm">
                {loading ? (
                    <tr><td colSpan={5} className="p-32 text-center"><div className="flex flex-col items-center justify-center"><Loader2 className="animate-spin text-emerald-500 mb-3" size={48}/></div></td></tr>
                ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="p-32 text-center text-gray-500">Không tìm thấy kết quả</td></tr>
                ) : currentData.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                        <td className="p-5 pl-8 font-mono text-gray-400 text-xs">#{user.id}</td>
                        <td className="p-5">
                            <div className="flex items-center">
                                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 mr-3 shadow-sm border border-gray-200 dark:border-gray-700">
                                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800 dark:text-gray-200 text-base">{user.full_name || 'No Name'}</div>
                                    <div className="text-xs text-gray-500 font-mono">{user.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-5">
                            {user.role === 'ADMIN' ? 
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-500/20"><ShieldAlert size={12} className="mr-1.5"/> Admin</span> :
                            user.role === 'MANAGER' ? 
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-500/20"><Shield size={12} className="mr-1.5"/> Manager</span> :
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium border border-gray-200 dark:border-gray-700"><User size={12} className="mr-1.5"/> Citizen</span>
                            }
                        </td>
                        <td className="p-5 text-center">
                            {user.is_active ? 
                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">Active</span> : 
                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs font-bold">Locked</span>
                            }
                        </td>
                        <td className="p-5 pr-8 text-right">
                            {isAdmin ? (
                                <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-all">
                                    <button onClick={() => handleEdit(user)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-600/20 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(user.id)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-600/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ) : (
                                <span className="text-[10px] uppercase font-bold text-gray-300 dark:text-gray-600 select-none">Read Only</span>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 p-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 backdrop-blur-md text-sm z-20">
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 font-medium">
                <span>Hiển thị</span>
                <select value={limit} onChange={e => {setLimit(Number(e.target.value)); setPage(1);}} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white text-xs rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-emerald-500">
                    <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                </select>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"><ChevronLeft size={18}/></button>
                <span className="px-3 font-mono font-bold text-gray-700 dark:text-white text-base tracking-widest">Trang <span className="text-emerald-600 dark:text-emerald-500">{page}</span> / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading} className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"><ChevronRight size={18}/></button>
            </div>
        </div>
      </div>
    </div>
  );
}
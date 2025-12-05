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
import { 
    fetchUsers, 
    createUser, 
    updateUser, 
    deleteUser, 
    fetchUserById 
} from '../services';
import { 
    Loader2, Search, Shield, ShieldAlert, User, 
    Lock, Unlock, Plus, Edit, Trash2, 
    ChevronLeft, ChevronRight, X, Mail, Key, AlertTriangle 
} from 'lucide-react';

// --- 1. MODAL THÊM / SỬA USER ---
const UserModal = ({ isOpen, onClose, onSubmit, initialData, currentUserRole }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '', 
        role: 'CITIZEN',
        is_active: true
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        setErrors({});
        if (initialData) {
            setFormData({
                full_name: initialData.full_name || '',
                email: initialData.email || '',
                role: initialData.role || 'CITIZEN',
                is_active: initialData.is_active !== undefined ? initialData.is_active : true,
                password: '' 
            });
        } else {
            setFormData({
                full_name: '',
                email: '',
                password: '',
                // Manager mặc định chỉ tạo được Citizen
                role: 'CITIZEN',
                is_active: true
            });
        }
    }, [initialData, isOpen]);

    const validateForm = () => {
        let newErrors = {};
        let isValid = true;

        const trimmedName = formData.full_name ? formData.full_name.trim() : '';
        if (trimmedName.length < 6) {
            newErrors.full_name = "Tên quá ngắn (tối thiểu 6 ký tự).";
            isValid = false;
        } else if (!trimmedName.includes(' ')) {
            newErrors.full_name = "Vui lòng nhập đầy đủ Họ và Tên.";
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = "Email không đúng định dạng.";
            isValid = false;
        }

        if (!initialData) {
            if (!formData.password || formData.password.length < 8) {
                newErrors.password = "Mật khẩu yếu (tối thiểu 8 ký tự).";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const getInputClass = (fieldName) => `
        w-full pl-9 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-xl text-gray-900 dark:text-white outline-none transition-colors
        ${errors[fieldName] 
            ? 'border-2 border-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10' 
            : 'border border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'}
    `;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-700/60 rounded-3xl w-full max-w-md shadow-2xl p-6 relative transition-colors duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"><X size={20}/></button>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
                    {initialData ? "Cập nhật Người dùng" : "Thêm Người dùng mới"}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* HỌ TÊN */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Họ và Tên <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <User size={16} className={`absolute left-3 top-3 ${errors.full_name ? 'text-red-500' : 'text-gray-400'}`}/>
                            <input className={getInputClass('full_name')} placeholder="Ví dụ: Nguyễn Văn A" value={formData.full_name} onChange={e => {setFormData({...formData, full_name:e.target.value}); if(errors.full_name) setErrors({...errors, full_name: null});}}/>
                        </div>
                        {errors.full_name && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center"><AlertTriangle size={10} className="mr-1"/> {errors.full_name}</p>}
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Email <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Mail size={16} className={`absolute left-3 top-3 ${errors.email ? 'text-red-500' : 'text-gray-400'}`}/>
                            <input type="email" className={getInputClass('email')} placeholder="user@example.com" value={formData.email} onChange={e=>{setFormData({...formData, email:e.target.value}); if(errors.email) setErrors({...errors, email: null});}}/>
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center"><AlertTriangle size={10} className="mr-1"/> {errors.email}</p>}
                    </div>

                    {/* PASSWORD */}
                    {!initialData && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Mật khẩu <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Key size={16} className={`absolute left-3 top-3 ${errors.password ? 'text-red-500' : 'text-gray-400'}`}/>
                                <input type="password" className={getInputClass('password')} placeholder="••••••••" value={formData.password} onChange={e=>{setFormData({...formData, password:e.target.value}); if(errors.password) setErrors({...errors, password: null});}}/>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center"><AlertTriangle size={10} className="mr-1"/> {errors.password}</p>}
                        </div>
                    )}

                    {/* ROLE & STATUS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Vai trò</label>
                            <select 
                                className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 rounded-xl text-gray-900 dark:text-white outline-none ${currentUserRole === 'MANAGER' ? 'opacity-60 cursor-not-allowed' : ''}`} 
                                value={formData.role} 
                                onChange={e=>setFormData({...formData, role:e.target.value})}
                                disabled={currentUserRole === 'MANAGER'} 
                            >
                                <option value="CITIZEN">Công dân</option>
                                {/* Manager không thấy option Manager và Admin */}
                                {currentUserRole === 'ADMIN' && <option value="MANAGER">Quản lý</option>}
                                {currentUserRole === 'ADMIN' && <option value="ADMIN">Admin</option>}
                            </select>
                            {currentUserRole === 'MANAGER' && <p className="text-[10px] text-gray-400 mt-1 italic">*Bạn chỉ được tạo Công dân</p>}
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Trạng thái</label>
                             <div className="flex items-center h-full">
                                <button type="button" onClick={() => setFormData({...formData, is_active: !formData.is_active})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{formData.is_active ? 'Hoạt động' : 'Đã khóa'}</span>
                             </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold">Hủy</button>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-transform">
                            {initialData ? "Lưu thay đổi" : "Tạo mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- 2. MODAL XÁC NHẬN XÓA ---
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#111318] border border-red-200 dark:border-red-900/40 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transition-colors duration-300">
                <div className="flex justify-center mb-4 text-red-500"><AlertTriangle size={48} /></div>
                <h3 className="text-gray-900 dark:text-white font-bold text-xl mb-2">Xác nhận xóa?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Tài khoản này sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700">Hủy</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 shadow-lg shadow-red-900/20">Xóa ngay</button>
                </div>
            </div>
        </div>
    );
};

// --- 3. MAIN PAGE ---
export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [hasMore, setHasMore] = useState(true); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);

    // LẤY ROLE CỦA NGƯỜI DÙNG HIỆN TẠI
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const currentUserRole = userInfo.role || 'CITIZEN';

    // --- HÀM CHECK QUYỀN (UPDATED) ---
    const canModifyUser = (targetUserRole) => {
        // 1. Admin quyền lực tuyệt đối
        if (currentUserRole === 'ADMIN') return true; 
        
        // 2. Manager CHỈ ĐƯỢC thao tác với CITIZEN
        if (currentUserRole === 'MANAGER') {
            return targetUserRole === 'CITIZEN';
        }
        
        return false; 
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const skip = (page - 1) * limit;
            const data = await fetchUsers(skip, limit);
            if (data.length < limit) setHasMore(false); else setHasMore(true);
            setUsers(data);
        } catch (error) { console.error(error); setUsers([]); } finally { setLoading(false); }
    };

    useEffect(() => { loadUsers(); }, [page, limit]);

    const filteredUsers = users.filter(u => 
        (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleCreateClick = () => { setEditingUser(null); setIsModalOpen(true); };

    const handleEditClick = async (user) => {
        // Check quyền trước khi mở modal
        if (!canModifyUser(user.role)) { 
            alert("Bạn không có quyền sửa tài khoản này!"); 
            return; 
        }
        try { const freshData = await fetchUserById(user.id); setEditingUser(freshData); setIsModalOpen(true); } 
        catch (e) { alert("Lỗi tải chi tiết."); }
    };

    const handleSave = async (formData) => {
        setIsModalOpen(false);
        try {
            if (editingUser) { await updateUser(editingUser.id, formData); loadUsers(); } 
            else { await createUser(formData); setPage(1); loadUsers(); }
        } catch (e) { alert("Lỗi lưu: " + e.message); setIsModalOpen(true); }
    };

    const handleDeleteConfirm = async () => {
        if (deletingUser) {
            try { await deleteUser(deletingUser.id); setDeletingUser(null); loadUsers(); } 
            catch (e) { alert("Xóa thất bại: " + e.message); }
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col pb-6">
            <UserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleSave} 
                initialData={editingUser}
                currentUserRole={currentUserRole} 
            />
            <DeleteConfirmModal isOpen={!!deletingUser} onClose={() => setDeletingUser(null)} onConfirm={handleDeleteConfirm} />

            {/* HEADER */}
            <div className="bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 transition-colors duration-300">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center tracking-tight">
                        <User className="mr-3 text-emerald-600 dark:text-emerald-500" size={28}/> Quản lý Người dùng
                    </h2>
                    <div className="mt-1 flex items-center space-x-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Bạn đang đăng nhập với quyền:</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${currentUserRole === 'ADMIN' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>{currentUserRole}</span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative group flex-1 sm:w-72">
                        <Search className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner placeholder-gray-400 dark:placeholder-gray-600"/>
                    </div>
                    <button onClick={handleCreateClick} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center whitespace-nowrap active:scale-95">
                        <Plus size={20} className="mr-2"/> Thêm User
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="flex-1 bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col relative transition-colors duration-300">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="p-5 pl-8 w-20">ID</th>
                                <th className="p-5">Thông tin cá nhân</th>
                                <th className="p-5">Vai trò</th>
                                <th className="p-5">Trạng thái</th>
                                <th className="p-5 text-right pr-8">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50 text-sm">
                            {loading ? (
                                <tr><td colSpan={5} className="p-32 text-center"><div className="flex flex-col items-center justify-center"><Loader2 className="animate-spin text-emerald-500 mb-3" size={48}/><span className="text-gray-500 font-medium">Đang tải dữ liệu...</span></div></td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="p-32 text-center text-gray-500">Không tìm thấy người dùng</td></tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    // LOGIC HIỂN THỊ NÚT SỬA/XÓA
                                    const isEditable = canModifyUser(user.role);

                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                                            <td className="p-5 pl-8 font-mono text-gray-500 text-xs">#{user.id}</td>
                                            <td className="p-5">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-200 mr-3 shadow-inner">
                                                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white">{user.full_name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                {user.role === 'ADMIN' ? <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-500/20"><ShieldAlert size={12} className="mr-1"/> Admin</span> :
                                                 user.role === 'MANAGER' ? <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-500/20"><Shield size={12} className="mr-1"/> Quản lý</span> :
                                                 <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold border border-gray-200 dark:border-gray-700"><User size={12} className="mr-1"/> Công dân</span>}
                                            </td>
                                            <td className="p-5">
                                                {user.is_active ? 
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-500/20"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>Active</span> : 
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs font-bold border border-gray-200 dark:border-gray-600/30"><Lock size={10} className="mr-1.5"/> Locked</span>
                                                }
                                            </td>
                                            <td className="p-5 pr-8 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* NÚT EDIT - Disable nếu không đủ quyền */}
                                                    <button 
                                                        onClick={() => handleEditClick(user)} 
                                                        disabled={!isEditable}
                                                        className={`p-2 rounded-lg transition-colors border border-transparent 
                                                            ${isEditable 
                                                                ? 'bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-600/20 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/30' 
                                                                : 'bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50'}`}
                                                        title={!isEditable ? "Không có quyền sửa Manager/Admin" : "Sửa"}
                                                    >
                                                        <Edit size={16}/>
                                                    </button>

                                                    {/* NÚT DELETE - Disable nếu không đủ quyền */}
                                                    <button 
                                                        onClick={() => setDeletingUser(user)}
                                                        disabled={!isEditable}
                                                        className={`p-2 rounded-lg transition-colors border border-transparent 
                                                            ${isEditable 
                                                                ? 'bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-600/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30' 
                                                                : 'bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50'}`}
                                                        title={!isEditable ? "Không có quyền xóa Manager/Admin" : "Xóa"}
                                                    >
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 p-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 backdrop-blur-md text-sm z-20">
                    <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 font-medium"><span>Hiển thị</span><select value={limit} onChange={e => {setLimit(Number(e.target.value)); setPage(1);}} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white text-xs rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-emerald-500"><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></div>
                    <div className="flex items-center gap-3"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"><ChevronLeft size={18}/></button><span className="px-3 font-mono font-bold text-gray-700 dark:text-white text-base tracking-widest">Trang <span className="text-emerald-600 dark:text-emerald-500">{page}</span></span><button onClick={() => setPage(p => p + 1)} disabled={!hasMore || loading} className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"><ChevronRight size={18}/></button></div>
                </div>
            </div>
        </div>
    );
}
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
import { updateUser, changePassword, fetchUsers, fetchUserById } from '../services'; 
import { 
    Save, Lock, User, Mail, Shield, AlertCircle, CheckCircle, Loader2, 
    Key, AtSign, Fingerprint, Activity 
} from 'lucide-react';

const ROLE_CONFIG = {
    'ADMIN': { label: 'Quản Trị Viên', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    'MANAGER': { label: 'Quản Lý', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    'CITIZEN': { label: 'Công Dân', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
};

export default function Settings() {
    const [loading, setLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Dữ liệu người dùng
    const [currentUser, setCurrentUser] = useState({
        id: null,
        full_name: '',
        email: '',
        role: 'CITIZEN',
        is_active: true
    });

    const [passData, setPassData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    // --- LOGIC LOAD DATA ---
    useEffect(() => {
        const init = async () => {
            const stored = JSON.parse(localStorage.getItem('user_info') || '{}');
            if (stored.id) {
                try {
                    const freshData = await fetchUserById(stored.id);
                    setCurrentUser(freshData);
                } catch (e) {
                    setCurrentUser({ 
                        id: stored.id,
                        full_name: stored.name, 
                        email: stored.email, 
                        role: stored.role,
                        is_active: true
                    });
                }
            } else if (stored.email) {
                try {
                    const users = await fetchUsers(0, 1000);
                    const found = users.find(u => u.email === stored.email);
                    if (found) {
                        setCurrentUser(found);
                        localStorage.setItem('user_info', JSON.stringify({ ...stored, id: found.id, role: found.role }));
                    }
                } catch {}
            }
        };
        init();
    }, []);

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    // --- HANDLE UPDATE INFO ---
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!currentUser.id) throw new Error("Vui lòng đăng nhập lại.");
            await updateUser(currentUser.id, currentUser);
            
            const oldInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            localStorage.setItem('user_info', JSON.stringify({ ...oldInfo, name: currentUser.full_name, email: currentUser.email }));
            
            showMsg('success', 'Đã cập nhật hồ sơ!');
        } catch (err) { showMsg('error', err.message); } 
        finally { setLoading(false); }
    };

    const handlePass = async (e) => {
        e.preventDefault();
        if (passData.new_password.length < 8) return showMsg('error', 'Mật khẩu quá ngắn (< 8 ký tự).');
        if (passData.new_password !== passData.confirm_password) return showMsg('error', 'Mật khẩu xác nhận không khớp.');

        setPassLoading(true);
        try {
            await changePassword(passData.current_password, passData.new_password);
            showMsg('success', 'Đổi mật khẩu thành công!');
            setPassData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) { showMsg('error', 'Mật khẩu cũ không đúng.'); } 
        finally { setPassLoading(false); }
    };

    const roleStyle = ROLE_CONFIG[currentUser.role] || ROLE_CONFIG['CITIZEN'];

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Hồ sơ cá nhân</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý thông tin định danh và bảo mật tài khoản.</p>
            </div>

            {message.text && (
                <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-5 border flex items-center gap-3 backdrop-blur-md ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'}`}>
                    {message.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                    <span className="font-bold text-sm">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* --- LEFT COLUMN: IDENTITY CARD --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-90"></div>
                        <div className="absolute top-0 right-0 w-full h-32 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        
                        <div className="relative flex flex-col items-center mt-12">
                            {/* AVATAR MẶC ĐỊNH (CHỮ CÁI ĐẦU) */}
                            <div className="w-28 h-28 rounded-full border-4 border-white dark:border-[#111318] bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center relative">
                                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-600 select-none">
                                    {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                                </span>
                            </div>

                            <div className="text-center mt-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser.full_name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{currentUser.email}</p>
                                
                                <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${roleStyle.color}`}>
                                    <Shield size={12} className="mr-1.5"/>
                                    {roleStyle.label}
                                </div>
                            </div>

                            <div className="w-full mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">ID</p>
                                    <p className="text-lg font-mono font-bold text-gray-800 dark:text-gray-200">#{currentUser.id}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Trạng thái</p>
                                    <div className="flex justify-center mt-1">
                                        {currentUser.is_active ? 
                                            <span className="flex items-center text-emerald-500 font-bold text-sm"><Activity size={14} className="mr-1"/> Active</span> : 
                                            <span className="flex items-center text-red-500 font-bold text-sm">Locked</span>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: FORMS --- */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* 1. FORM EDIT INFO */}
                    <div className="bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center mb-6">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 mr-4">
                                <Fingerprint size={24}/>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Thông tin cơ bản</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Cập nhật tên hiển thị và thông tin liên hệ của bạn.</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Họ và Tên</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18}/>
                                        <input 
                                            type="text" 
                                            value={currentUser.full_name} 
                                            onChange={e=>setCurrentUser({...currentUser, full_name:e.target.value})} 
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1d24] border border-transparent dark:border-gray-700/50 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#111318] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                            placeholder="Nhập tên của bạn"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Email</label>
                                    <div className="relative group">
                                        <AtSign className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18}/>
                                        <input 
                                            type="email" 
                                            value={currentUser.email} 
                                            onChange={e=>setCurrentUser({...currentUser, email:e.target.value})} 
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1d24] border border-transparent dark:border-gray-700/50 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#111318] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end pt-2">
                                <button 
                                    disabled={loading}
                                    className="flex items-center px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2" size={18}/>}
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* 2. FORM CHANGE PASSWORD */}
                    <div className="bg-white dark:bg-[#111318] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center mb-6">
                            <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-600 dark:text-red-400 mr-4">
                                <Key size={24}/>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Đổi mật khẩu</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Khuyến nghị sử dụng mật khẩu mạnh để bảo vệ tài khoản.</p>
                            </div>
                        </div>

                        <form onSubmit={handlePass} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Mật khẩu hiện tại</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-red-500 transition-colors" size={18}/>
                                    <input 
                                        type="password" 
                                        value={passData.current_password} 
                                        onChange={e=>setPassData({...passData, current_password:e.target.value})} 
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1d24] border border-transparent dark:border-gray-700/50 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#111318] focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        value={passData.new_password} 
                                        onChange={e=>setPassData({...passData, new_password:e.target.value})} 
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1d24] border border-transparent dark:border-gray-700/50 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#111318] focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                                        placeholder="Tối thiểu 8 ký tự"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Xác nhận</label>
                                    <input 
                                        type="password" 
                                        value={passData.confirm_password} 
                                        onChange={e=>setPassData({...passData, confirm_password:e.target.value})} 
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1d24] border border-transparent dark:border-gray-700/50 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#111318] focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button 
                                    disabled={passLoading}
                                    className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {passLoading ? <Loader2 className="animate-spin mr-2"/> : 'Cập nhật mật khẩu'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
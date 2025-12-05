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

import { apiFetch } from './apiClient';

// 1. LẤY DANH SÁCH (Hỗ trợ phân trang)
export const fetchUsers = async (skip = 0, limit = 100) => {
    try {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString()
        });
        const data = await apiFetch(`users?${params.toString()}`);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
};

// 2. LẤY CHI TIẾT
export const fetchUserById = async (id) => {
    return await apiFetch(`users/${id}`);
};

// 3. TẠO MỚI
export const createUser = async (userData) => {
    return await apiFetch('users', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
};

// 4. CẬP NHẬT
export const updateUser = async (id, userData) => {
    const payload = {
        email: userData.email,
        full_name: userData.full_name,
        is_active: userData.is_active,
        role: userData.role
    };
    return await apiFetch(`users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
};

// 5. XÓA
export const deleteUser = async (id) => {
    return await apiFetch(`users/${id}`, {
        method: 'DELETE'
    });
};

// 6. ĐỔI MẬT KHẨU
export const changePassword = async (currentPassword, newPassword) => {
    const payload = { 
        current_password: currentPassword, 
        new_password: newPassword 
    };
    return await apiFetch('users/change-password/me', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
};
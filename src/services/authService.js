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

// --- ĐĂNG NHẬP ---
export const loginUser = async (username, password) => {
  try {
    // Backend dùng schemas.LoginRequest -> Gửi JSON
    return await apiFetch('login', { 
        method: 'POST', 
        body: JSON.stringify({ 
            email: username, 
            password: password 
        }) 
    });
  } catch (e) {
    // Ném lỗi tiếp để Login.jsx hiển thị (setError)
    throw e;
  }
};

// --- ĐĂNG XUẤT ---
export const logoutUser = async () => {
  const token = localStorage.getItem('access_token');
  
  // Nếu không có token thì thôi, chỉ cần xóa ở client
  if (!token) return;

  try {
    // Gọi API để Backend ghi log
    await apiFetch('logout', { 
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
  } catch (error) {
    console.warn("Lỗi gọi API logout (có thể bỏ qua):", error);
  }
};
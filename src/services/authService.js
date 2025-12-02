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

// --- ĐĂNG NHẬP (GIỮ NGUYÊN) ---
export const loginUser = async (username, password) => {
  try {
    return await apiFetch('login', { 
        method: 'POST', 
        body: JSON.stringify({ username, password }) 
    });
  } catch (e) {
    console.error("Login Error:", e);
    throw e;
  }
};

// --- ĐĂNG XUẤT (MỚI) ---
export const logoutUser = async () => {
  // Lấy token hiện tại
  const token = localStorage.getItem('access_token');
  
  // Nếu không có token thì không cần gọi API
  if (!token) return;

  try {
    await apiFetch('logout', { 
        method: 'POST',
        headers: {
            // Quan trọng: Gửi kèm Token để backend biết ai đang logout
            'Authorization': `Bearer ${token}`
        }
    });
  } catch (error) {
    console.warn("API Logout warning:", error);
  }
};
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

const BATCH_SIZE = 100;

export const fetchUsers = async () => {
  let allResults = [];
  let skip = 0;
  let hasMore = true;

  try {
    while (hasMore && allResults.length <= 5000) {
      const chunk = await apiFetch(`users?skip=${skip}&limit=${BATCH_SIZE}`);
      const data = Array.isArray(chunk) ? chunk : (chunk.data || []);

      if (data.length > 0) {
        allResults = [...allResults, ...data];
        if (data.length < BATCH_SIZE) hasMore = false;
        else skip += BATCH_SIZE;
      } else {
        hasMore = false;
      }
    }
    return allResults;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return allResults;
  }
};

export const fetchUserById = async (id) => apiFetch(`users/${id}`);

export const createUser = async (userData) => {
  return apiFetch('users', {
    method: 'POST',
    body: JSON.stringify({
      email: userData.email,
      full_name: userData.full_name,
      password: userData.password,
      role: userData.role,
      is_active: userData.is_active
    })
  });
};

export const updateUser = async (id, userData) => {
  return apiFetch(`users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
};

export const deleteUser = async (id) => {
  await apiFetch(`users/${id}`, { method: 'DELETE' });
  return true;
};

export const toggleUserStatus = async (id, currentStatus) => {
  return updateUser(id, { is_active: !currentStatus });
};

export const findUserByEmail = async (email) => {
  try {
    const users = await fetchUsers();
    return users.find(u => u.email === email || u.full_name === email);
  } catch (e) {
    return null;
  }
};

export const changePasswordMe = async (currentPassword, newPassword) => {
  return apiFetch('users/change-password/me', {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword
    })
  });
};

export const createUserAdmin = async (userData) => {
  return apiFetch('users/admin/create', {
    method: 'POST',
    body: JSON.stringify({
      email: userData.email,
      full_name: userData.full_name,
      password: userData.password,
      role: userData.role || 'CITIZEN',
      is_active: userData.is_active !== undefined ? userData.is_active : true
    })
  });
};
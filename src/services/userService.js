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
import { MOCK_USERS } from './mockData';

export const fetchUsers = async () => {
    try {
        const data = await apiFetch('users');
        return Array.isArray(data) ? data : MOCK_USERS;
    } catch {
        return MOCK_USERS;
    }
};

export const toggleUserStatus = async (id, status) => {
    try {
        return await apiFetch(`users/${id}/status`, { 
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    } catch { return { success: true }; }
};

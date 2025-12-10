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

export const loginUser = async (username, password) => {
  try {
    const response = await apiFetch('login', { 
      method: 'POST', 
      body: JSON.stringify({ email: username, password }) 
    });
    
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user_info', JSON.stringify({
        id: response.id,
        email: response.email,
        full_name: response.full_name,
        role: response.role
      }));
    }
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  try {
    await apiFetch('logout', { method: 'POST' });
  } catch (error) {
    console.warn("Logout API error:", error);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
  }
};
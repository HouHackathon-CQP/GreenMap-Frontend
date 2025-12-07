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

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Simple caching for weather and traffic data
const fetchWithCache = async (url, config, ttl = 5 * 60 * 1000) => { 
  const cacheKey = `cache_${url}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttl) {
        console.log(`Using cache: ${url}`);
        return data;
      }
    } catch (e) { console.warn("Cache error", e); }
  }

  const response = await fetch(url, config);
  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  const data = await response.json();

  try {
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {}

  return data;
};

export const apiFetch = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${BASE_URL}/${cleanEndpoint}`;
  
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = { ...options, headers };

  // Cache only read-only weather and traffic endpoints
  const shouldCache = (!config.method || config.method === 'GET') && 
                      (url.includes('weather') || url.includes('traffic'));

  if (shouldCache) {
    try {
      return await fetchWithCache(url, config);
    } catch (error) {
      // Fallback to stale cache if network error
      const cacheKey = `cache_${url}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached).data;
      throw error;
    }
  }

  try {
    const response = await fetch(url, config);
    
    // Handle authentication errors
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      if (!url.includes('auth')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        window.location.href = '/login';
      }
      throw new Error(errorData?.detail || 'Session expired');
    }

    // Handle permission errors
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.detail || 'Access denied');
    }

    // Handle validation errors
    if (response.status === 422) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.detail || 'Invalid data');
    }

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData?.detail || `HTTP Error: ${response.status}`);
      } catch (e) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
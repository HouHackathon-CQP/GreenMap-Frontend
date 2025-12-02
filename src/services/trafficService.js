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

// --- CẤU HÌNH CACHE ---
const TRAFFIC_MAP_CACHE_KEY = 'greenmap_traffic_map_cache';
const TRAFFIC_MAP_TTL = 24 * 60 * 60 * 1000;

// 1. LẤY BẢN ĐỒ NỀN (Static Map Segments)
export const fetchTrafficMap = async () => {
  const now = Date.now();
  
  // Kiểm tra Cache LocalStorage
  const cached = localStorage.getItem(TRAFFIC_MAP_CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (now - parsed.timestamp < TRAFFIC_MAP_TTL) {
        console.log("📍 Dùng Cache Traffic Map");
        return parsed.data;
      }
    } catch {
      localStorage.removeItem(TRAFFIC_MAP_CACHE_KEY);
    }
  }

  try {
    // Gọi API: GET /traffic/segments (trả về GeoJSON FeatureCollection)
    const geojsonData = await apiFetch('traffic/segments');

    if (!geojsonData || !geojsonData.features) {
        throw new Error("Dữ liệu bản đồ rỗng");
    }

    // Lưu Cache
    localStorage.setItem(TRAFFIC_MAP_CACHE_KEY, JSON.stringify({ 
        data: geojsonData, 
        timestamp: now 
    }));
    
    return geojsonData;

  } catch (error) {
    console.error("❌ Lỗi lấy bản đồ giao thông:", error);
    // Trả về GeoJSON rỗng để không làm crash map
    return { type: 'FeatureCollection', features: [] }; 
  }
};

// 2. LẤY TRẠNG THÁI LIVE (Realtime Traffic Status)
export const fetchTrafficLive = async () => {
  // API này cần realtime nên KHÔNG dùng Cache (hoặc cache cực ngắn 2s)
  try {
    // Gọi API: GET /traffic/live
    // Cấu trúc trả về: { time_in_loop: 123, status: { "edge_1": "red", ... } }
    const liveData = await apiFetch('traffic/live');
    
    if (!liveData || !liveData.status) {
        return { status: {} };
    }

    return {
        timeInLoop: liveData.time_in_loop,
        status: liveData.status // Object dạng { id: color }
    };

  } catch (error) {
    console.error("⚠️ Lỗi cập nhật giao thông:", error);
    return { status: {} }; // Trả về rỗng để giữ nguyên trạng thái cũ
  }
};
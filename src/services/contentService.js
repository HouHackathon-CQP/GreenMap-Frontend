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

const getCentroid = (coords) => {
    if (!coords || coords.length === 0) return { lat: 0, lng: 0 };
    const points = (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) ? coords[0] : coords;
    let sumLat = 0, sumLng = 0, count = 0;
    points.forEach(point => {
        if (Array.isArray(point) && point.length >= 2) {
            sumLng += point[0]; sumLat += point[1]; count++;
        }
    });
    return count === 0 ? { lat: 0, lng: 0 } : { latitude: sumLat / count, longitude: sumLng / count };
};

// Helper Map Data
const mapData = (dataArray, locationType) => {
    return dataArray.map(item => {
        const nameKey = "https://uri.etsi.org/ngsi-ld/name";
        const rawName = item[nameKey] || item.name || "Không tên";
        const loc = item.location || {}; 
        let lat = 0, lng = 0;

        if (loc.type === 'Point' && loc.coordinates) {
            lng = loc.coordinates[0]; lat = loc.coordinates[1];
        } else if (loc.type === 'Polygon' && loc.coordinates) {
            const center = getCentroid(loc.coordinates);
            lat = center.latitude; lng = center.longitude;
        }

        let shortId = item.id;
        if (shortId && shortId.includes(':')) shortId = shortId.split(':').pop();

        return {
            id: shortId,
            name: typeof rawName === 'object' ? (rawName.value || "N/A") : rawName,
            location_type: item.type || locationType || "UNKNOWN",
            is_active: true,
            latitude: lat,
            longitude: lng
        };
    });
};

// Hàm này sẽ tự động gọi API nhiều lần cho đến khi lấy hết dữ liệu
export const fetchLocations = async (locationType = null) => {
  let allResults = [];
  let offset = 0;
  const BATCH_SIZE = 100; // Mỗi lần xin 100 dòng
  let hasMore = true;

  console.log(`🚀 Đang tải toàn bộ dữ liệu ${locationType || ''}...`);

  try {
    while (hasMore) {
        // Tạo URL gọi từng trang
        const params = new URLSearchParams();
        params.append('limit', BATCH_SIZE);
        params.append('offset', offset);
        params.append('options', 'keyValues');
        if (locationType) params.append('location_type', locationType);

        // Gọi API
        const chunk = await apiFetch(`locations?${params.toString()}`);
        
        if (Array.isArray(chunk) && chunk.length > 0) {
            // Map dữ liệu và gộp vào mảng tổng
            const mappedChunk = mapData(chunk, locationType);
            allResults = [...allResults, ...mappedChunk];
            
            // Kiểm tra xem còn dữ liệu không
            if (chunk.length < BATCH_SIZE) {
                // Nếu trả về ít hơn mức xin -> Đã hết
                hasMore = false;
            } else {
                // Vẫn còn, tăng offset để lấy trang tiếp theo
                offset += BATCH_SIZE;
            }
        } else {
            // Mảng rỗng -> Hết
            hasMore = false;
        }

        // Phanh an toàn: Dừng nếu quá 5000 dòng (đề phòng vòng lặp vô tận)
        if (allResults.length > 5000) hasMore = false;
    }

    console.log(`✅ Đã tải xong tổng cộng: ${allResults.length} bản ghi.`);
    return allResults;

  } catch (error) {
    console.error("❌ Lỗi tải dữ liệu:", error);
    return allResults; // Trả về những gì đã lấy được
  }
};

// Mock Functions (Giữ nguyên)
export const createLocation = async (data) => { await new Promise(r => setTimeout(r, 500)); return { ...data, id: Math.random().toString() }; };
export const updateLocation = async (id, data) => { await new Promise(r => setTimeout(r, 500)); return { ...data, id }; };
export const deleteLocation = async (id) => { await new Promise(r => setTimeout(r, 500)); return { success: true }; };
export const fetchLocationStats = () => Promise.resolve({});
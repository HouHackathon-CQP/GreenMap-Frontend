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

// Helper: Tính tâm của đa giác (nếu dữ liệu trả về Polygon)
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

// Helper: Map dữ liệu từ Backend sang format chuẩn của Frontend
const mapData = (dataArray, locationType) => {
    return dataArray.map(item => {
        // Tên có thể nằm ở nhiều key khác nhau tùy backend
        const nameKey = "https://smartdatamodels.org/name";
        const rawName = item[nameKey] || item.name || `Địa điểm #${item.id}`;
        
        const loc = item.location || {}; 
        let lat = 0, lng = 0;

        // Xử lý tọa độ
        if (loc.type === 'Point' && loc.coordinates) {
            lng = loc.coordinates[0]; 
            lat = loc.coordinates[1];
        } else if (loc.type === 'Polygon' && loc.coordinates) {
            const center = getCentroid(loc.coordinates);
            lat = center.latitude; 
            lng = center.longitude;
        }

        return {
            id: item.id,
            name: rawName,
            location_type: item.type || locationType || "UNKNOWN",
            // Lưu ý: List trả về is_editable, Detail trả về is_active. 
            // Ta ưu tiên lấy giá trị boolean nếu tồn tại.
            is_active: item.is_active !== undefined ? item.is_active : (item.is_editable !== undefined ? item.is_editable : true),
            latitude: lat,
            longitude: lng,
            description: item.description || "" 
        };
    });
};

// 1. LẤY DANH SÁCH (GET LIST)
export const fetchLocations = async (locationType = null) => {
    let allResults = [];
    let skip = 0; 
    const BATCH_SIZE = 1000; 
    let hasMore = true;

    console.log(`🚀 Đang tải dữ liệu ${locationType || ''}...`);

    try {
        while (hasMore) {
            const params = new URLSearchParams();
            params.append('limit', BATCH_SIZE);
            params.append('skip', skip);
            params.append('options', 'keyValues');
            
            if (locationType) params.append('location_type', locationType);

            const chunk = await apiFetch(`locations?${params.toString()}`);
            
            if (Array.isArray(chunk) && chunk.length > 0) {
                const mappedChunk = mapData(chunk, locationType);
                allResults = [...allResults, ...mappedChunk];
                
                if (chunk.length < BATCH_SIZE) {
                    hasMore = false;
                } else {
                    skip += BATCH_SIZE;
                }
            } else {
                hasMore = false;
            }

            if (allResults.length > 10000) hasMore = false; // Safety break
        }
        return allResults;

    } catch (error) {
        console.error("❌ Lỗi tải danh sách:", error);
        return allResults; 
    }
};

// 2. LẤY CHI TIẾT (GET BY ID)
export const fetchLocationById = async (id) => {
    try {
        const response = await apiFetch(`locations/${id}`);
        return {
            id: response.id,
            name: response.name,
            location_type: response.location_type,
            description: response.description || "",
            is_active: response.is_active !== undefined ? response.is_active : true,
            latitude: response.latitude,
            longitude: response.longitude,
            data_source: response.data_source
        };
    } catch (error) {
        console.error(`❌ Lỗi lấy chi tiết [${id}]:`, error);
        throw error;
    }
};

// 3. TẠO MỚI (POST)
export const createLocation = async (data) => {
    try {
        const payload = {
            name: data.name,
            location_type: data.location_type,
            description: data.description || "",
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude)
        };

        const response = await apiFetch('locations', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        // Map kết quả trả về để thêm vào list
        return {
            id: response.id || 0, // Fallback nếu backend ko trả ID ngay
            name: response.name,
            location_type: response.location_type,
            description: response.description,
            is_active: true, // Mặc định tạo mới là active
            latitude: response.latitude,
            longitude: response.longitude
        };

    } catch (error) {
        console.error("❌ Lỗi tạo mới:", error);
        throw error;
    }
};

// 4. CẬP NHẬT (PUT)
export const updateLocation = async (id, data) => {
    try {
        const payload = {
            name: data.name,
            description: data.description || "",
            location_type: data.location_type,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            is_active: data.is_active !== undefined ? data.is_active : true
        };

        const response = await apiFetch(`locations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        return {
            id: response.id || id,
            name: response.name,
            location_type: response.location_type,
            description: response.description,
            is_active: response.is_active,
            latitude: response.latitude,
            longitude: response.longitude
        };

    } catch (error) {
        console.error(`❌ Lỗi cập nhật [${id}]:`, error);
        throw error;
    }
};

// 5. XÓA (DELETE)
export const deleteLocation = async (id) => {
    try {
        await apiFetch(`locations/${id}`, {
            method: 'DELETE',
            headers: { 'accept': 'application/json' }
        });
        return { success: true };
    } catch (error) {
        console.error(`❌ Lỗi xóa [${id}]:`, error);
        throw error;
    }
};

// Mock Stats (Giữ nguyên để không lỗi Dashboard)
export const fetchLocationStats = () => Promise.resolve({});
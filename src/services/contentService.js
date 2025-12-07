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

const mapData = (dataArray, defaultType) => {
    return dataArray.map(item => {
        const loc = item.location || {}; 
        let lat = 0, lng = 0;
        if (loc.type === 'Point' && loc.coordinates) {
            lng = loc.coordinates[0]; lat = loc.coordinates[1];
        }
        const id = item.db_id !== undefined && item.db_id !== null ? item.db_id : item.id;
        const urn = item.id;
        const locationType = item.location_type || item.type || defaultType;
        return {
            id,
            urn,
            name: item.name || "Không tên",
            location_type: locationType,
            is_active: item.is_active !== undefined ? item.is_active : true,
            latitude: lat,
            longitude: lng,
            description: item.description || "",
            data_source: item.data_source || "System"
        };
    });
};

// 1. LẤY TOÀN BỘ DANH SÁCH
export const fetchLocations = async (locationType = null) => {
    let allResults = [];
    let skip = 0; 
    const BATCH_SIZE = 100;
    let hasMore = true;

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
                
                if (chunk.length < BATCH_SIZE) hasMore = false;
                else skip += BATCH_SIZE;
            } else {
                hasMore = false;
            }
            // Safety break
            if (allResults.length > 5000) hasMore = false;
        }
        return allResults;
    } catch (error) {
        console.error("❌ Lỗi tải danh sách:", error);
        return allResults; 
    }
};

// ... Các hàm create, update, delete, getById
export const fetchLocationById = async (id) => {
    try { return await apiFetch(`locations/${id}`); } catch (error) { throw error; }
};
export const createLocation = async (data) => {
    try {
        const payload = { ...data };
        if (data.latitude !== undefined && data.latitude !== '') payload.latitude = parseFloat(data.latitude);
        if (data.longitude !== undefined && data.longitude !== '') payload.longitude = parseFloat(data.longitude);
        return await apiFetch('locations', { method: 'POST', body: JSON.stringify(payload) });
    } catch (error) { throw error; }
};
export const updateLocation = async (id, data) => {
    try {
        const payload = { ...data };
        if (data.latitude !== undefined && data.latitude !== '') payload.latitude = parseFloat(data.latitude);
        if (data.longitude !== undefined && data.longitude !== '') payload.longitude = parseFloat(data.longitude);
        return await apiFetch(`locations/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } catch (error) { throw error; }
};
export const deleteLocation = async (id) => {
    try { await apiFetch(`locations/${id}`, { method: 'DELETE' }); return true; } catch (error) { throw error; }
};
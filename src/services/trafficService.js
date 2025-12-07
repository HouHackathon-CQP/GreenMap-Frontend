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

const TRAFFIC_MAP_CACHE_KEY = 'greenmap_traffic_map_cache';
const TRAFFIC_MAP_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const fetchTrafficMap = async () => {
  const now = Date.now();
  const cached = localStorage.getItem(TRAFFIC_MAP_CACHE_KEY);
  
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (now - parsed.timestamp < TRAFFIC_MAP_TTL) {
        console.log("Using cached traffic map");
        return parsed.data;
      }
    } catch {
      localStorage.removeItem(TRAFFIC_MAP_CACHE_KEY);
    }
  }

  try {
    const geojsonData = await apiFetch('traffic/segments');

    if (!geojsonData || !geojsonData.features) {
      throw new Error("Empty traffic map data");
    }

    localStorage.setItem(TRAFFIC_MAP_CACHE_KEY, JSON.stringify({ 
      data: geojsonData, 
      timestamp: now 
    }));
    
    return geojsonData;
  } catch (error) {
    console.error("Error fetching traffic map:", error);
    return { type: 'FeatureCollection', features: [] };
  }
};

export const fetchTrafficLive = async () => {
  try {
    const liveData = await apiFetch('traffic/live');
    
    if (!liveData || !liveData.status) {
      return { status: {} };
    }

    return {
      timeInLoop: liveData.time_in_loop,
      status: liveData.status
    };
  } catch (error) {
    console.error("Error updating traffic status:", error);
    return { status: {} };
  }
};
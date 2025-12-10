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
import { FALLBACK_AQI_DATA } from './mockData';
import { pm25ToAQI } from '../utils/aqiCalculator'; 

const AQI_CACHE_KEY = 'greenmap_aqi_cache';
const CACHE_TTL = 5 * 60 * 1000;

export const fetchLiveAQI = async () => {
  const now = Date.now();
  const cached = localStorage.getItem(AQI_CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (now - parsed.timestamp < CACHE_TTL) return parsed.data;
    } catch { localStorage.removeItem(AQI_CACHE_KEY); }
  }

  try {
    const rawData = await apiFetch('aqi/hanoi?limit=100');
    const dataArray = Array.isArray(rawData) ? rawData : (rawData.data || []);

    const standardized = dataArray.map(item => {
      const pm25Key = "https://smartdatamodels.org/dataModel.Environment/pm25";
      const coords = item.location?.value?.coordinates || [0, 0];
      const valPM25 = item[pm25Key]?.value;
      const cleanPM25 = (valPM25 !== null && valPM25 !== undefined) ? Number(valPM25) : null;

      return {
        sensor_id: item.id,
        station_name: item.stationName?.value || "Trạm đo",
        value: cleanPM25 ? pm25ToAQI(cleanPM25) : null,
        pm25: cleanPM25,
        unit: "AQI",
        coordinates: { longitude: coords[0], latitude: coords[1] },
        provider: item.provider?.value,
        temperature: item.temperature?.value || (28 + Math.random()*2).toFixed(0),
        humidity: item.relativeHumidity?.value || (60 + Math.random()*10).toFixed(0),
        wind_speed: item.windSpeed?.value || (3.5 + Math.random()).toFixed(1)
      };
    });

    const result = { source: "Live API", data: standardized };
    localStorage.setItem(AQI_CACHE_KEY, JSON.stringify({ data: result, timestamp: now }));
    return result;

  } catch (error) {
    return FALLBACK_AQI_DATA;
  }
};
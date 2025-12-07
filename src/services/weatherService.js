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

const parseStationData = (item) => {
  const prefix = "https://smartdatamodels.org/dataModel.Environment/";
  
  const temp = item[`${prefix}temperature`] ?? 0;
  const humidityRaw = item[`${prefix}relativeHumidity`] ?? 0;
  const weatherType = item[`${prefix}weatherType`] ?? "Unknown";
  const windSpeed = item[`${prefix}windSpeed`] ?? 0;

  const typeLower = String(weatherType).toLowerCase();
  const isRaining = typeLower.includes('rain') || typeLower.includes('storm');

  return {
    id: item.id,
    station_name: item["https://smartdatamodels.org/address"]?.addressRegion || "Weather Station",
    location: item.location,
    temperature: temp,
    humidity: Math.round(humidityRaw * 100),
    weatherType: weatherType,
    wind_speed: windSpeed,
    dateObserved: item[`${prefix}dateObserved`],
    isRaining: isRaining
  };
};

export const fetchWeatherStations = async () => {
  try {
    const result = await apiFetch('weather/hanoi?limit=100');
    if (result && Array.isArray(result.data)) {
      return result.data.map(parseStationData);
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch weather stations:", error);
    return [];
  }
};

export const fetchWeatherForecast = async (lat = null, lon = null) => {
  try {
    let url = 'weather/forecast';
    if (lat !== null && lon !== null) {
      url += `?lat=${lat}&lon=${lon}`;
    }
    const result = await apiFetch(url);
    return result.data;
  } catch (error) {
    console.error("Failed to fetch weather forecast:", error);
    return null;
  }
};
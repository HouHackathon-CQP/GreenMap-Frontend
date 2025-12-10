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

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchLiveAQI } from '../services';
import { Loader2, Navigation } from 'lucide-react';

// Thêm prop stations vào đây
const GreenMap = ({ onStationSelect, stations }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  
  const [internalSensors, setInternalSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  // Xác định nguồn dữ liệu: Dùng props (từ Dashboard) hoặc tự fetch (nếu dùng lẻ)
  const sensorsToRender = stations || internalSensors;

  // --- 1. LẤY DỮ LIỆU (CHỈ KHI KHÔNG CÓ PROPS) ---
  useEffect(() => {
    // Nếu cha (Dashboard) đã truyền stations, ta không cần fetch nữa
    if (stations) {
        setIsLoading(false);
        return;
    }

    fetchLiveAQI()
      .then(data => {
        const sensorList = data.data || (Array.isArray(data) ? data : []);
        setInternalSensors(sensorList);
      })
      .catch(err => console.error("Lỗi tải AQI:", err))
      .finally(() => setIsLoading(false));
  }, [stations]);

  // --- HÀM ĐỊNH VỊ USER ---
  const handleLocateUser = () => {
    const map = mapInstanceRef.current;
    if (!map || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const userCoords = [longitude, latitude];

            map.flyTo({ center: userCoords, zoom: 14, pitch: 60, speed: 1.5 });

            const el = document.createElement('div');
            el.className = 'user-location-marker';
            el.title = `Vị trí của bạn (Sai số ~${Math.round(accuracy)}m)`;
            el.innerHTML = `
                <div class="relative flex items-center justify-center">
                  <span class="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-blue-500 opacity-30"></span>
                  <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg"></span>
                </div>
            `;

            if (userMarkerRef.current) userMarkerRef.current.remove();
            userMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat(userCoords).addTo(map);
        },
        (error) => console.warn("Lỗi định vị:", error.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // --- HÀM THÊM 3D BUILDINGS ---
  const add3DBuildings = (map) => {
    if (map.getLayer('3d-buildings')) return;
    
    if (!map.getSource('openfreemap-3d')) {
      map.addSource('openfreemap-3d', { url: 'https://tiles.openfreemap.org/planet', type: 'vector' });
    }
    
    let labelLayerId;
    const layers = map.getStyle().layers;
    for (let i = 0; i < layers.length; i++) { 
      if (layers[i].type === 'symbol' && layers[i].layout['text-field']) { labelLayerId = layers[i].id; break; } 
    }
    
    map.addLayer({
      'id': '3d-buildings',
      'source': 'openfreemap-3d',
      'source-layer': 'building',
      'type': 'fill-extrusion',
      'minzoom': 13,
      'filter': ['!=', ['get', 'hide_3d'], true],
      'paint': {
        'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 0], 0, '#e5e7eb', 200, '#60a5fa', 400, '#2563eb'],
        'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 15.5, ['coalesce', ['get', 'render_height'], 0]],
        'fill-extrusion-base': ['case', ['>=', ['get', 'zoom'], 15.5], ['coalesce', ['get', 'render_min_height'], 0], 0],
        'fill-extrusion-opacity': 0.8
      }
    }, labelLayerId);
  };

  // --- 2. KHỞI TẠO MAP ---
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [105.80, 21.02],
      zoom: 11,
      pitch: 60,
      bearing: -10,
      antialias: true,
    });
    mapInstanceRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showCompass: false }), 'top-right');

    map.on('styleimagemissing', (e) => {
        if (!map.hasImage(e.id)) { 
            const img = new Image(1,1); img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+P///38ACfsD/QVkeKcAAAAASUVORK5CYII='; img.onload = () => map.addImage(e.id, img); 
        }
    });

    map.on('load', async () => {
      map.resize();
      add3DBuildings(map);
      handleLocateUser(); 

      // --- LAYER AQI ---
      if (!map.getSource('aqi-sensors')) {
        map.addSource('aqi-sensors', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      }

      if (!map.getLayer('aqi-points')) {
        map.addLayer({
          id: 'aqi-points',
          type: 'circle',
          source: 'aqi-sensors',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 14, 8],
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff',
            'circle-color': ['step', ['get', 'value'], '#9ca3af', 0, '#10b981', 50, '#eab308', 100, '#f97316', 150, '#ef4444', 300, '#7e0023'],
            'circle-pitch-alignment': 'viewport' 
          }
        });
      }

      map.on('click', 'aqi-points', (e) => {
        e.preventDefault();
        if (onStationSelect && e.features.length > 0) {
          const feature = e.features[0];
          onStationSelect({
            ...feature.properties,
            coordinates: { longitude: feature.geometry.coordinates[0], latitude: feature.geometry.coordinates[1] }
          });
          map.flyTo({ center: feature.geometry.coordinates, zoom: 15, pitch: 60, speed: 1.2 });
        }
      });

      map.on('mouseenter', 'aqi-points', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'aqi-points', () => map.getCanvas().style.cursor = '');

      setIsMapReady(true);
    });
  }, []);

  // --- 3. CẬP NHẬT DỮ LIỆU LÊN MAP (Khi sensorsToRender thay đổi) ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isMapReady || !map || !map.getSource('aqi-sensors')) return;

    // Dữ liệu rỗng hoặc được lọc -> Update GeoJSON
    const validSensors = sensorsToRender.filter(s => s.coordinates?.longitude && s.coordinates?.latitude);
    const geojsonData = {
      type: 'FeatureCollection',
      features: validSensors.map(s => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.coordinates.longitude, s.coordinates.latitude] },
        properties: {
          id: s.sensor_id, 
          station_name: s.station_name, 
          value: Math.round(Number(s.value) || 0),
          unit: s.unit || 'AQI', 
          provider: s.provider || 'N/A',
          temperature: s.temperature || '--', 
          humidity: s.humidity || '--', 
          wind_speed: s.wind_speed || '--',
          status: 'Online'
        }
      }))
    };
    
    // Set data mới cho map
    map.getSource('aqi-sensors').setData(geojsonData);

  }, [sensorsToRender, isMapReady]); // Chạy lại khi danh sách (đã lọc) thay đổi

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div ref={mapContainerRef} className="absolute top-0 left-0 w-full h-full" />
      
      <div className="absolute bottom-4 right-4 z-10">
          <button onClick={handleLocateUser} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-white p-2.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Vị trí của tôi">
              <Navigation size={20} className="text-blue-600 fill-blue-600/20"/>
          </button>
      </div>

      {isLoading && (
        <div className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-black/80 backdrop-blur text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center text-xs font-bold">
          <Loader2 className="animate-spin mr-2" size={14}/> ĐANG TẢI...
        </div>
      )}
    </div>
  );
};

export default GreenMap;
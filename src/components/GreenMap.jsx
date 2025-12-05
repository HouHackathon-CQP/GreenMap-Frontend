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

const GreenMap = ({ onStationSelect }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  // --- 1. LẤY DỮ LIỆU AQI ---
  useEffect(() => {
    fetchLiveAQI()
      .then(data => {
        const sensorList = data.data || (Array.isArray(data) ? data : []);
        setSensors(sensorList);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // --- HÀM ĐỊNH VỊ USER ---
  const handleLocateUser = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!navigator.geolocation) { return; }

    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const userCoords = [longitude, latitude];

            // Zoom sâu hơn (16) và nghiêng (60) để thấy rõ 3D Building
            map.flyTo({ center: userCoords, zoom: 16, pitch: 60, speed: 1.5 });

            const el = document.createElement('div');
            el.className = 'user-location-marker';
            el.title = `Vị trí của bạn (Sai số ~${Math.round(accuracy)}m)`;
            el.innerHTML = `
                <span class="relative flex h-4 w-4">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-sm"></span>
                </span>
            `;

            if (userMarkerRef.current) userMarkerRef.current.remove();
            userMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat(userCoords).addTo(map);
        },
        (error) => console.warn("Lỗi định vị:", error.message),
        options
    );
  };

  // --- 2. KHỞI TẠO MAP ---
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [105.80, 21.02],
      zoom: 15, // Zoom mặc định gần hơn để thấy tòa nhà ngay
      pitch: 45, // Độ nghiêng mặc định
      bearing: -17.6,
      antialias: true, // Quan trọng để render 3D mượt mà
    });
    mapInstanceRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', async () => {
      map.resize();
      handleLocateUser();

      // --- 3D BUILDINGS SETUP (BẮT ĐẦU) ---
      
      // 1. Tìm layer chữ (symbol) để chèn tòa nhà xuống dưới chữ
      const layers = map.getStyle().layers;
      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
              labelLayerId = layers[i].id;
              break;
          }
      }

      // 2. Thêm Source OpenFreeMap Planet (Vector Tiles)
      if (!map.getSource('openfreemap')) {
          map.addSource('openfreemap', {
              url: 'https://tiles.openfreemap.org/planet',
              type: 'vector',
          });
      }

      // 3. Thêm Layer 3D Buildings
      if (!map.getLayer('3d-buildings')) {
          map.addLayer({
              'id': '3d-buildings',
              'source': 'openfreemap',
              'source-layer': 'building',
              'type': 'fill-extrusion',
              'minzoom': 15, // Chỉ hiển thị khi zoom >= 15
              'filter': ['!=', ['get', 'hide_3d'], true],
              'paint': {
                  // Nội suy màu dựa trên chiều cao: Thấp (xám) -> Cao (xanh dương)
                  'fill-extrusion-color': [
                      'interpolate',
                      ['linear'],
                      ['get', 'render_height'],
                      0, '#d1d5db',     // Gray-300
                      200, '#3b82f6',   // Blue-500
                      400, '#1d4ed8'    // Blue-700
                  ],
                  // Nội suy chiều cao dựa trên zoom: Zoom 15 phẳng, Zoom 16 cao thật
                  'fill-extrusion-height': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      15, 0,
                      16, ['get', 'render_height']
                  ],
                  'fill-extrusion-base': [
                      'case',
                      ['>=', ['get', 'zoom'], 16],
                      ['get', 'render_min_height'], 
                      0
                  ],
                  'fill-extrusion-opacity': 0.8 // Làm trong suốt nhẹ để đỡ che bản đồ
              }
          }, labelLayerId); // Chèn layer này TRƯỚC layer nhãn
      }
      // --- 3D BUILDINGS SETUP (KẾT THÚC) ---

      map.on('styleimagemissing', (e) => {
        if (!map.hasImage(e.id)) {
          map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) });
        }
      });

      // --- LAYER AQI ---
      if (!map.getSource('aqi-sensors')) {
        map.addSource('aqi-sensors', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      }

      // Layer AQI sẽ nằm đè lên layer 3D Buildings vì được add sau
      if (!map.getLayer('aqi-points')) {
        map.addLayer({
          id: 'aqi-points',
          type: 'circle',
          source: 'aqi-sensors',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 6, 14, 12],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-color': [
              'step', ['get', 'value'], '#9ca3af', 0, '#10b981', 50, '#eab308', 100, '#f97316', 150, '#ef4444', 300, '#7e0023'
            ],
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
          // Khi click vào trạm, zoom vào và giữ độ nghiêng để xem 3D xung quanh
          map.flyTo({ center: feature.geometry.coordinates, zoom: 16.5, pitch: 55, speed: 1.2 });
        }
      });

      map.on('mouseenter', 'aqi-points', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'aqi-points', () => map.getCanvas().style.cursor = '');

      setIsMapReady(true);
    });
  }, []);

  // --- 3. CẬP NHẬT DỮ LIỆU AQI ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isMapReady || !map || !map.getSource('aqi-sensors')) return;

    if (sensors.length > 0) {
      const validSensors = sensors.filter(s => s.coordinates?.longitude && s.coordinates?.latitude);
      const geojsonData = {
        type: 'FeatureCollection',
        features: validSensors.map(s => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [s.coordinates.longitude, s.coordinates.latitude] },
          properties: {
            id: s.sensor_id, station_name: s.station_name, value: Math.round(Number(s.value) || 0),
            unit: s.unit || 'AQI', provider: s.provider || 'N/A',
            temperature: s.temperature || '--', humidity: s.humidity || '--', wind_speed: s.wind_speed || '--',
            status: 'Online'
          }
        }))
      };
      map.getSource('aqi-sensors').setData(geojsonData);
    }
  }, [sensors, isMapReady]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-900">
      <div ref={mapContainerRef} className="absolute top-0 left-0 w-full h-full" />
      <div className="absolute bottom-6 right-4 z-10">
          <button onClick={handleLocateUser} className="bg-gray-800 text-white p-2.5 rounded-full shadow-lg border border-gray-700 hover:bg-gray-700 transition-colors" title="Vị trí của tôi">
              <Navigation size={20} className="text-blue-500 fill-blue-500/20"/>
          </button>
      </div>
      {isLoading && (
        <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur text-emerald-400 px-3 py-1.5 rounded-lg shadow-lg flex items-center text-xs font-bold">
          <Loader2 className="animate-spin mr-2" size={14}/> ĐANG TẢI...
        </div>
      )}
    </div>
  );
};

export default GreenMap;
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchLiveAQI } from '../apiService';
import { Loader2, AlertTriangle } from 'lucide-react';

// Hàm chuyển đổi giá trị PM2.5 (µg/m³) sang màu sắc
// (Dựa trên thang đo AQI của Mỹ)
const getAqiColor = (pm25Value) => {
  if (pm25Value === null || pm25Value === undefined) return '#9ca3af'; // Màu xám (Không có dữ liệu)
  if (pm25Value <= 12) return '#22c55e'; // Xanh lá (Tốt)
  if (pm25Value <= 35.4) return '#fde047'; // Vàng (Trung bình)
  if (pm25Value <= 55.4) return '#f97316'; // Cam
  if (pm25Value <= 150.4) return '#ef4444'; // Đỏ
  return '#b91c1c'; // Đỏ thẫm
};

const GreenMap = () => {
  const mapContainerRef = useRef(null);
  const [sensors, setSensors] = useState([]); // 3. Dùng State thay vì mock data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Gọi API khi component mount
    const loadAqiData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const aqiData = await fetchLiveAQI();
        // Dữ liệu trả về là { data: [...] }
        if (aqiData && aqiData.data) {
          setSensors(aqiData.data);
        }
      } catch (err) {
        setError(err.message);
        console.error("Không thể tải dữ liệu AQI:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAqiData();
  }, []);

  useEffect(() => {
    // Chỉ render map khi có dữ liệu hoặc đã load xong (dù lỗi)
    if (!mapContainerRef.current) return;
    
    // Nếu đang load, không render map
    if (isLoading) return; 

    // Nếu có dữ liệu, tính toán bounds
    const bounds = new maplibregl.LngLatBounds();
    let hasValidSensors = false;
    if (sensors.length > 0) {
        sensors.forEach((sensor) => {
          if (sensor.coordinates && sensor.coordinates.longitude && sensor.coordinates.latitude) {
            bounds.extend([sensor.coordinates.longitude, sensor.coordinates.latitude]);
            hasValidSensors = true;
          }
        });
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      // Nếu không có sensor, zoom về trung tâm HN, nếu có thì để map.fitBounds tự xử lý
      center: hasValidSensors ? bounds.getCenter() : [105.83, 21.02],
      zoom: hasValidSensors ? 15.5 : 12, // Zoom xa hơn nếu không có data
      pitch: 45,
      bearing: -17.6,
      antialias: true,
    });

    map.on('load', () => {
      if (hasValidSensors && !bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 50, maxZoom: 16 });
        map.once('idle', () => {
          if (map.getZoom() < 15) map.easeTo({ zoom: 15, duration: 800 });
        });
      }
      map.resize();
      
      // ... (Code 3D Extrusion giữ nguyên)
      const layers = map.getStyle().layers || [];
      const labelLayer = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
      );
      const labelLayerId = labelLayer?.id;
      if (!map.getSource('openfreemap')) {
        map.addSource('openfreemap', {
          url: 'https://tiles.openfreemap.org/planet',
          type: 'vector',
        });
      }
      if (!map.getLayer('3d-buildings')) {
        const extrusionHeight = ['coalesce', ['get', 'render_height'], ['get', 'height'], ['*', ['coalesce', ['get', 'building:levels'], ['get', 'levels'], 0], 3]];
        const extrusionMinHeight = ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], ['*', ['coalesce', ['get', 'min_level'], 0], 3], 0];
        map.addLayer({
          id: '3d-buildings',
          source: 'openfreemap',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 15,
          filter: ['!=', ['get', 'hide_3d'], true],
          paint: {
            'fill-extrusion-color': ['interpolate', ['linear'], extrusionHeight, 0, 'lightgray', 200, 'royalblue', 400, 'lightblue'],
            'fill-extrusion-height': ['case', ['>=', ['zoom'], 15], extrusionHeight, 0],
            'fill-extrusion-base': ['case', ['>=', ['zoom'], 15], extrusionMinHeight, 0],
            'fill-extrusion-opacity': 0.8,
          },
        }, labelLayerId);
      }

      // Loop qua dữ liệu API (sensors)
      sensors.forEach((sensor) => {
        if (!sensor.coordinates || !sensor.coordinates.longitude) return; 

        const el = document.createElement('div');
        el.className = 'marker';
        // Đặt màu dựa trên giá trị PM2.5
        el.style.backgroundColor = getAqiColor(sensor.value);
        el.style.width = '16px';
        el.style.height = '16px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        // Cập nhật Popup với dữ liệu API
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
            `<div style="color: #333; font-family: sans-serif;">
            <strong style="font-size: 14px;">${sensor.station_name}</strong>
            <div style="font-size: 12px; margin-top: 4px;">PM2.5: <b>${sensor.value ?? 'N/A'} ${sensor.unit ?? ''}</b></div>
            <div style="font-size: 10px; color: #666;">Nguồn: ${sensor.provider_name}</div>
            <div style="font-size: 10px; color: #666;">Cập nhật: ${sensor.datetime_utc ? new Date(sensor.datetime_utc).toLocaleString('vi-VN') : 'N/A'}</div>
            </div>`
        );

        new maplibregl.Marker({ element: el })
            .setLngLat([sensor.coordinates.longitude, sensor.coordinates.latitude])
            .setPopup(popup)
            .addTo(map);
      });
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
    };
  }, [sensors, isLoading]); // Re-render khi 'sensors' hoặc 'isLoading' thay đổi

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-700">
      {/* Container chứa bản đồ */}
      <div ref={mapContainerRef} className="absolute top-0 left-0 w-full h-full" />
      
      {/* Trạng thái Loading */}
      {isLoading && (
         <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-900/50 backdrop-blur-sm z-20">
            <Loader2 size={40} className="animate-spin text-green-400" />
            <span className="mt-3 text-white font-semibold">Đang tải dữ liệu AQI...</span>
         </div>
      )}

      {/* Trạng thái Lỗi */}
      {error && !isLoading && (
        <div className="absolute top-4 left-4 z-10 bg-red-800/90 text-white p-3 rounded-lg shadow-lg flex items-center border border-red-500">
          <AlertTriangle className="mr-3" />
          Lỗi tải dữ liệu: {error}
        </div>
      )}

      {/* Chú thích (Legend) */}
      <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-md text-xs text-gray-800 z-10 border border-gray-200 backdrop-blur-sm">
        <div className="font-bold mb-2 text-gray-600 uppercase tracking-wider" style={{fontSize: '10px'}}>Trạm đo PM2.5</div>
        <div className="flex items-center mb-1.5"><span className="w-3 h-3 rounded-full bg-green-500 mr-2 border border-white shadow-sm"></span> Tốt (0-12)</div>
        <div className="flex items-center mb-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400 mr-2 border border-white shadow-sm"></span> TB (12-35.4)</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2 border border-white shadow-sm"></span> Xấu (>35.4)</div>
      </div>
    </div>
  );
};

export default GreenMap;
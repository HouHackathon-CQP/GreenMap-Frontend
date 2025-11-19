import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchLiveAQI } from '../apiService';
import { Loader2, AlertTriangle } from 'lucide-react';

const GreenMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // 1. THÊM TRẠNG THÁI: Bản đồ đã sẵn sàng chưa?
  const [isMapReady, setIsMapReady] = useState(false);

  // 2. GỌI API (Chạy độc lập)
  useEffect(() => {
    const loadAqiData = async () => {
      try {
        const aqiData = await fetchLiveAQI();
        if (aqiData && aqiData.data) {
          setSensors(aqiData.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadAqiData();
  }, []);

  // 3. KHỞI TẠO BẢN ĐỒ (Chỉ chạy 1 lần)
  useEffect(() => {
    if (mapInstanceRef.current) return; 

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [105.83, 21.02],
      zoom: 12,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
    });

    mapInstanceRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      map.resize();
      
      // Thêm nguồn dữ liệu rỗng trước
      if (!map.getSource('aqi-sensors')) {
        map.addSource('aqi-sensors', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }

      // Thêm 3D Buildings
      add3DBuildings(map);

      // Thêm Layer hiển thị điểm (Circle Layer)
      if (!map.getLayer('aqi-points')) {
        map.addLayer({
          id: 'aqi-points',
          type: 'circle',
          source: 'aqi-sensors',
          paint: {
            'circle-radius': 8, // To hơn chút cho dễ nhìn
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-color': [
              'case',
              ['==', ['get', 'value'], null], '#9ca3af',
              ['<=', ['get', 'value'], 12], '#22c55e',
              ['<=', ['get', 'value'], 35.4], '#fde047',
              ['<=', ['get', 'value'], 55.4], '#f97316',
              ['<=', ['get', 'value'], 150.4], '#ef4444',
              '#b91c1c'
            ]
          }
        });
      }

      // Xử lý click popup
      map.on('click', 'aqi-points', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { name, value, unit } = e.features[0].properties;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new maplibregl.Popup({ offset: 10 })
          .setLngLat(coordinates)
          .setHTML(`
            <div style="color: #333; font-family: sans-serif;">
              <strong style="font-size: 14px;">${name}</strong>
              <div style="font-size: 12px; margin-top: 4px;">
                PM2.5: <b>${value !== null ? Math.round(value * 10) / 10 : 'N/A'} ${unit || ''}</b>
              </div>
            </div>
          `)
          .addTo(map);
      });

      map.on('mouseenter', 'aqi-points', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'aqi-points', () => map.getCanvas().style.cursor = '');

      // 4. QUAN TRỌNG: Đánh dấu bản đồ đã sẵn sàng
      setIsMapReady(true);
    });

  }, []);

  // 5. CẬP NHẬT DỮ LIỆU (Chạy khi `sensors` thay đổi HOẶC `isMapReady` thay đổi)
  useEffect(() => {
    const map = mapInstanceRef.current;
    
    // Chỉ chạy khi CẢ HAI đều sẵn sàng
    if (!isMapReady || !map || !map.getSource('aqi-sensors')) return;

    if (sensors.length > 0) {
        console.log("🗺️ Đang vẽ", sensors.length, "trạm lên bản đồ...");
        
        const geojsonData = {
            type: 'FeatureCollection',
            features: sensors
                .filter(s => s.coordinates && s.coordinates.longitude)
                .map(s => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [s.coordinates.longitude, s.coordinates.latitude]
                    },
                    properties: {
                        name: s.station_name,
                        value: s.value,
                        unit: s.unit
                    }
                }))
        };

        map.getSource('aqi-sensors').setData(geojsonData);

        // Zoom vào vùng có dữ liệu
        if (geojsonData.features.length > 0) {
            const bounds = new maplibregl.LngLatBounds();
            geojsonData.features.forEach(f => bounds.extend(f.geometry.coordinates));
            // Fit bounds nhẹ nhàng
            map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
        }
    }
  }, [sensors, isMapReady]); // <-- Theo dõi cả 2 biến này

  // Hàm helper thêm 3D buildings
  const add3DBuildings = (map) => {
      if (map.getLayer('3d-buildings')) return;
      const layers = map.getStyle().layers || [];
      const labelLayer = layers.find(l => l.type === 'symbol' && l.layout && l.layout['text-field']);
      const labelLayerId = labelLayer?.id;

      if (!map.getSource('openfreemap')) {
        map.addSource('openfreemap', { url: 'https://tiles.openfreemap.org/planet', type: 'vector' });
      }

      map.addLayer({
        id: '3d-buildings',
        source: 'openfreemap',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 14,
        filter: ['!=', ['get', 'hide_3d'], true],
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['get', 'render_height'], 0, 'lightgray', 200, 'royalblue', 400, 'lightblue'
          ],
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'], 14, 0, 14.05, ['get', 'render_height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'], 14, 0, 14.05, ['get', 'render_min_height']
          ],
          'fill-extrusion-opacity': 0.8,
        },
      }, labelLayerId);
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-700">
      <div ref={mapContainerRef} className="absolute top-0 left-0 w-full h-full" />
      
      {isLoading && (
         <div className="absolute top-2 right-14 z-10 bg-white/90 text-gray-800 px-3 py-1 rounded-full flex items-center shadow-md text-xs font-medium">
            <Loader2 size={14} className="animate-spin mr-2 text-green-600" />
            Đang cập nhật dữ liệu...
         </div>
      )}

      {error && (
        <div className="absolute top-4 left-4 z-10 bg-red-800/90 text-white p-2 rounded shadow text-xs flex items-center">
          <AlertTriangle size={16} className="mr-2"/> {error}
        </div>
      )}

      {/* Legend */}
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
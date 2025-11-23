// GreenMap-Frontend/src/components/GreenMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchLiveAQI } from '../apiService';
import { Loader2 } from 'lucide-react';

const GreenMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  // Lấy dữ liệu
  useEffect(() => {
    fetchLiveAQI().then(data => {
        if(data && data.data) setSensors(data.data);
    }).finally(() => setIsLoading(false));
  }, []);

  // Khởi tạo Map
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

      if (!map.getSource('aqi-sensors')) {
        map.addSource('aqi-sensors', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      }

      // --- FIX LỖI STYLE 3D BUILDINGS ---
      // Style cũ bị lỗi expression, đây là style đơn giản hơn và an toàn
      if (!map.getSource('openfreemap')) {
        map.addSource('openfreemap', { url: 'https://tiles.openfreemap.org/planet', type: 'vector' });
      }
      if (!map.getLayer('3d-buildings')) {
        map.addLayer({
            id: '3d-buildings',
            source: 'openfreemap',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-opacity': 0.6,
                // Cách viết style mới an toàn hơn
                'fill-extrusion-height': ['get', 'render_height'],
                'fill-extrusion-base': ['get', 'render_min_height']
            }
        });
      }

      // Layer hiển thị điểm
      if (!map.getLayer('aqi-points')) {
        map.addLayer({
          id: 'aqi-points',
          type: 'circle',
          source: 'aqi-sensors',
          paint: {
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-color': [
              'case',
              ['==', ['get', 'value'], null], '#9ca3af',
              ['<=', ['get', 'value'], 50], '#22c55e',
              ['<=', ['get', 'value'], 100], '#eab308',
              ['<=', ['get', 'value'], 150], '#f97316',
              '#ef4444'
            ]
          }
        });
      }

      // Popup khi click
      map.on('click', 'aqi-points', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { name, value, unit } = e.features[0].properties;
        new maplibregl.Popup({ offset: 10 })
          .setLngLat(coordinates)
          .setHTML(`<b>${name}</b><br/>PM2.5: ${value} ${unit}`)
          .addTo(map);
      });

      map.on('mouseenter', 'aqi-points', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'aqi-points', () => map.getCanvas().style.cursor = '');

      setIsMapReady(true);
    });
  }, []);

  // Vẽ dữ liệu lên Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isMapReady || !map || !map.getSource('aqi-sensors')) return;

    if (sensors.length > 0) {
        // --- QUAN TRỌNG: LỌC DỮ LIỆU ---
        const validSensors = sensors.filter(s => 
             s.coordinates?.longitude && 
             s.coordinates?.latitude &&
             s.value !== null && 
             s.value !== undefined &&
             !isNaN(Number(s.value))
        );

        console.log(`🗺️ Vẽ ${validSensors.length} trạm hợp lệ.`);
        
        const geojsonData = {
            type: 'FeatureCollection',
            features: validSensors.map(s => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [s.coordinates.longitude, s.coordinates.latitude] },
                properties: { name: s.station_name, value: Number(s.value), unit: s.unit }
            }))
        };

        map.getSource('aqi-sensors').setData(geojsonData);
        
        if (geojsonData.features.length > 0) {
            const bounds = new maplibregl.LngLatBounds();
            geojsonData.features.forEach(f => bounds.extend(f.geometry.coordinates));
            map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
        }
    }
  }, [sensors, isMapReady]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-700">
      <div ref={mapContainerRef} className="absolute top-0 left-0 w-full h-full" />
      {isLoading && <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow text-xs flex items-center"><Loader2 className="animate-spin mr-1" size={12}/> Loading...</div>}
    </div>
  );
};

export default GreenMap;
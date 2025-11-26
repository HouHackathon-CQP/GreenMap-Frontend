import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchLiveAQI } from '../services';
import { Loader2 } from 'lucide-react';

const GreenMap = ({ onStationSelect }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. LẤY DỮ LIỆU
  useEffect(() => {
    fetchLiveAQI().then(data => {
        if(data && data.data) setSensors(data.data);
    }).finally(() => setIsLoading(false));
  }, []);

  // 2. KHỞI TẠO MAP
  useEffect(() => {
    if (mapInstanceRef.current) return; 

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright', 
      center: [105.83, 21.02],
      zoom: 11,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });
    mapInstanceRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      map.resize();

      if (!map.getSource('aqi-sensors')) {
        map.addSource('aqi-sensors', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      }

      // Lớp Điểm
      if (!map.getLayer('aqi-points')) {
        map.addLayer({
          id: 'aqi-points',
          type: 'circle',
          source: 'aqi-sensors',
          paint: {
            'circle-radius': 8, 
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff',
            'circle-color': [
              'step', ['get', 'value'],
              '#9ca3af', 0, '#10b981', 50, '#eab308', 100, '#f97316', 150, '#ef4444', 300, '#7e0023'
            ]
          }
        });
      }

      // --- QUAN TRỌNG: GỌI CALLBACK KHI CLICK ---
      map.on('click', 'aqi-points', (e) => {
        if (onStationSelect) {
            const props = e.features[0].properties;
            const coords = e.features[0].geometry.coordinates;
            
            // Tái tạo object station để gửi lên cha
            onStationSelect({
                id: props.id,
                name: props.name,
                station_name: props.name,
                value: props.value,
                unit: props.unit,
                provider: props.provider,
                status: props.status,
                coordinates: { longitude: coords[0], latitude: coords[1] }
            });
        }
      });

      map.on('mouseenter', 'aqi-points', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'aqi-points', () => map.getCanvas().style.cursor = '');

      setIsMapReady(true);
    });
  }, []);

  // 3. CẬP NHẬT DỮ LIỆU LÊN MAP
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isMapReady || !map || !map.getSource('aqi-sensors')) return;

    if (sensors.length > 0) {
        const validSensors = sensors.filter(s => s.coordinates?.longitude && s.coordinates?.latitude && !isNaN(Number(s.value)));

        const geojsonData = {
            type: 'FeatureCollection',
            features: validSensors.map(s => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [s.coordinates.longitude, s.coordinates.latitude] },
                properties: { 
                    id: s.sensor_id || Math.random(),
                    name: s.station_name, 
                    value: Math.round(Number(s.value)), 
                    unit: s.unit,
                    provider: s.provider_name || 'Trạm quan trắc',
                    status: (s.value !== null) ? 'Online' : 'Offline'
                }
            }))
        };
        map.getSource('aqi-sensors').setData(geojsonData);
        
        if (geojsonData.features.length > 0) {
            const bounds = new maplibregl.LngLatBounds();
            geojsonData.features.forEach(f => bounds.extend(f.geometry.coordinates));
            map.fitBounds(bounds, { padding: 50, maxZoom: 13 });
        }
    }
  }, [sensors, isMapReady]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-900">
      <div ref={mapContainerRef} className="absolute top-0 left-0 w-full h-full" />
      {isLoading && (
        <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur text-emerald-400 px-3 py-1.5 rounded-lg shadow-lg flex items-center text-xs font-bold">
            <Loader2 className="animate-spin mr-2" size={14}/> ĐANG TẢI...
        </div>
      )}
    </div>
  );
};

export default GreenMap;
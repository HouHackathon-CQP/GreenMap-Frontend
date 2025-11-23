// GreenMap-Frontend/src/pages/AirQualityMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchLiveAQI } from '../apiService';
import { Loader2 } from 'lucide-react';

const AirQualityMap = () => {
  const mapContainerRef = useRef(null);
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLiveAQI().then(data => {
        if(data && data.data) setSensors(data.data);
    }).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [105.82, 21.03],
      zoom: 12,
      pitch: 45,
      bearing: -10,
      antialias: true,
    });

    map.on('load', () => {
      // 3D Buildings - Style an toàn
      if (!map.getSource('openfreemap')) map.addSource('openfreemap', { url: 'https://tiles.openfreemap.org/planet', type: 'vector' });
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
                'fill-extrusion-height': ['get', 'render_height'],
                'fill-extrusion-base': ['get', 'render_min_height']
            }
        });
      }

      // Lọc dữ liệu an toàn
      const validSensors = sensors.filter(s => 
          s.coordinates?.longitude && 
          s.coordinates?.latitude &&
          s.value !== null && !isNaN(Number(s.value))
      );

      const features = validSensors.map(s => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [s.coordinates.longitude, s.coordinates.latitude] },
          properties: { value: Number(s.value), name: s.station_name }
      }));

      map.addSource('aqi-source', { type: 'geojson', data: { type: 'FeatureCollection', features } });

      // Heatmap
      map.addLayer({
        id: 'aqi-heatmap',
        type: 'heatmap',
        source: 'aqi-source',
        minzoom: 9,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'value'], 0, 0, 150, 1],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)', 0.2, 'rgba(34, 197, 94, 0.5)', 0.8, 'rgba(239, 68, 68, 0.7)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 20, 15, 200],
          'heatmap-opacity': 0.7
        }
      });

      // Points
      map.addLayer({
        id: 'aqi-points',
        type: 'circle',
        source: 'aqi-source',
        minzoom: 11,
        paint: {
          'circle-radius': 5,
          'circle-color': ['step', ['get', 'value'], '#22c55e', 50, '#eab308', 100, '#ef4444'],
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1
        }
      });
    });

    return () => map.remove();
  }, [sensors]);

  return (
    <div className="h-full w-full flex flex-col space-y-4">
      <h2 className="text-2xl font-bold text-green-300">Bản đồ Phân vùng AQI</h2>
      <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-700 shadow-lg">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        {isLoading && <div className="absolute inset-0 flex justify-center items-center bg-gray-900/50"><Loader2 className="animate-spin text-green-400" size={40}/></div>}
      </div>
    </div>
  );
};

export default AirQualityMap;
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchLiveAQI } from '../services'; // Bỏ fetchTraffic
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

            map.flyTo({ center: userCoords, zoom: 15, speed: 1.5 });

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
      zoom: 12.5,
      pitch: 60,
      bearing: -10,
      antialias: true,
    });
    mapInstanceRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', async () => {
      map.resize();
      handleLocateUser();

      map.on('styleimagemissing', (e) => {
        if (!map.hasImage(e.id)) {
          map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) });
        }
      });

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
          map.flyTo({ center: feature.geometry.coordinates, zoom: 14, pitch: 60, speed: 1.2 });
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
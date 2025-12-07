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

import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Loader2, Wind, CloudRain, LocateFixed, Car, Sun, 
  TreePine, Zap, Bike, Camera, Info, X, 
  Thermometer, Droplets, CheckCircle, XCircle,
  Search, ArrowRight, Building2, Filter
} from 'lucide-react';
import ReactDOMServer from 'react-dom/server';
import { fetchLiveAQI, fetchTrafficMap, fetchTrafficLive, fetchLocations } from '../services'; 
import { fetchWeatherStations } from '../services/weatherService';
import { useTheme } from '../context/ThemeContext'; 

// --- CẤU HÌNH CONFIG ---
const MODE_CONFIG = {
    AQI: { color: '#10b981', icon: Wind, label: 'Chất lượng không khí' },
    RAIN: { color: '#3b82f6', icon: CloudRain, label: 'Thời tiết' },
    TRAFFIC: { color: '#f97316', icon: Car, label: 'Giao thông' },
    PUBLIC_PARK: { color: '#22c55e', icon: TreePine, label: 'Công viên' },
    CHARGING_STATION: { color: '#eab308', icon: Zap, label: 'Trạm sạc' },
    BICYCLE_RENTAL: { color: '#06b6d4', icon: Bike, label: 'Thuê xe' },
    TOURIST_ATTRACTION: { color: '#a855f7', icon: Camera, label: 'Du lịch' },
};

const TYPE_TRANSLATION = { 'PUBLIC_PARK': 'Công viên công cộng', 'CHARGING_STATION': 'Trạm sạc xe điện', 'BICYCLE_RENTAL': 'Điểm thuê xe đạp', 'TOURIST_ATTRACTION': 'Điểm tham quan du lịch' };
const FIELD_TRANSLATION = { 'location_type': 'Loại hình', 'data_source': 'Nguồn', 'is_active': 'Trạng thái', 'provider': 'Nhà cung cấp', 'address': 'Địa chỉ', 'capacity': 'Sức chứa', 'opening_hours': 'Giờ mở cửa' };
const RADIUS_OPTIONS = [{ value: 0, label: 'Tất cả' }, { value: 1, label: 'Gần tôi (< 1km)' }, { value: 3, label: 'Bán kính 3km' }, { value: 5, label: 'Bán kính 5km' }, { value: 10, label: 'Bán kính 10km' }];

// --- HÀM BỔ TRỢ TÍNH KHOẢNG CÁCH & VẼ VÒNG TRÒN ---
const haversineDistance = (coords1, coords2) => {
    if (!coords1 || !coords2) return null;
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Bán kính trái đất km
    const dLat = toRad(coords2[1] - coords1[1]);
    const dLon = toRad(coords2[0] - coords1[0]);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(toRad(coords1[1])) * Math.cos(toRad(coords2[1]));
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const createGeoJSONCircle = (center, radiusInKm, points = 64) => {
    if (!center) return null;
    const coords = { latitude: center[1], longitude: center[0] };
    const km = radiusInKm;
    const ret = [];
    const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
    const distanceY = km / 110.574;
    for (let i = 0; i < points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const x = distanceX * Math.cos(theta);
        const y = distanceY * Math.sin(theta);
        ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);
    return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ret] } };
};

const AirQualityMap = () => {
  const { theme } = useTheme(); 
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]); 
  const userMarkerRef = useRef(null); 

  // --- STATE ---
  const [viewMode, setViewMode] = useState('AQI'); 
  const [aqiData, setAqiData] = useState([]);
  const [rainData, setRainData] = useState([]);
  const [locations, setLocations] = useState({});
  const [trafficStatus, setTrafficStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  
  // New States for Features
  const [isMapReady, setIsMapReady] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [filterRadius, setFilterRadius] = useState(0);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // --- 1. XỬ LÝ DỮ LIỆU & LỌC (Memoized) ---
  const currentDataList = useMemo(() => {
      let sourceList = [];
      if (viewMode === 'AQI') sourceList = aqiData;
      else if (viewMode === 'RAIN') sourceList = rainData;
      else if (viewMode === 'TRAFFIC') sourceList = [];
      else sourceList = locations[viewMode] || [];

      // Lọc theo bán kính nếu có User Location và Radius > 0
      if (userLocation && filterRadius > 0) {
          sourceList = sourceList.filter(item => {
              let itemCoords;
              if (item.coordinates) itemCoords = [item.coordinates.longitude, item.coordinates.latitude];
              else if (item.location?.coordinates) itemCoords = item.location.coordinates;
              else itemCoords = [item.longitude, item.latitude];
              
              const dist = haversineDistance(userLocation, itemCoords);
              item.distance = dist; 
              return dist <= filterRadius;
          });
          sourceList.sort((a, b) => a.distance - b.distance);
      }
      return sourceList;
  }, [viewMode, aqiData, rainData, locations, userLocation, filterRadius]);

  // --- 2. XỬ LÝ TÌM KIẾM ---
  useEffect(() => {
      if (!searchTerm.trim()) { setSearchResults([]); return; }
      const lowerTerm = searchTerm.toLowerCase();
      const results = currentDataList.filter(item => {
          const name = item.name || item.station_name || '';
          const desc = item.description || '';
          return name.toLowerCase().includes(lowerTerm) || desc.toLowerCase().includes(lowerTerm);
      }).slice(0, 5); // Lấy tối đa 5 kết quả
      setSearchResults(results);
  }, [searchTerm, currentDataList]);

  // --- 3. CÁC HÀM MAP UTILS ---
  const loadIconsToMap = (map) => {
      ['PUBLIC_PARK', 'CHARGING_STATION', 'BICYCLE_RENTAL', 'TOURIST_ATTRACTION'].forEach(key => {
          const config = MODE_CONFIG[key];
          const iconString = ReactDOMServer.renderToStaticMarkup(
              React.createElement(config.icon, { size: 20, color: "white", strokeWidth: 2.5 })
          );
          const svg = `
            <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/></filter>
                <path d="M20 0C8.95 0 0 8.95 0 20C0 31 20 50 20 50C20 50 40 31 40 20C40 8.95 31.05 0 20 0Z" fill="${config.color}" stroke="white" stroke-width="2" filter="url(#shadow)"/>
                <circle cx="20" cy="20" r="14" fill="rgba(255,255,255,0.2)"/>
                <g transform="translate(10, 10)">${iconString.replace('width="20"', 'width="20"').replace('height="20"', 'height="20"')}</g>
            </svg>`;
          const img = new Image(40, 50);
          img.onload = () => { if (!map.hasImage(`icon-${key}`)) map.addImage(`icon-${key}`, img, { pixelRatio: 1 }); };
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      });
  };

  const add3DBuildings = (map) => {
      if (map.getLayer('3d-buildings')) return;
      if (!map.getSource('openfreemap-3d')) map.addSource('openfreemap-3d', { url: 'https://tiles.openfreemap.org/planet', type: 'vector' });
      
      let labelLayerId;
      const layers = map.getStyle().layers;
      for (let i = 0; i < layers.length; i++) { 
          if (layers[i].type === 'symbol' && layers[i].layout['text-field']) { labelLayerId = layers[i].id; break; } 
      }
      
      map.addLayer({
          'id': '3d-buildings', 'source': 'openfreemap-3d', 'source-layer': 'building', 'type': 'fill-extrusion', 'minzoom': 14, 
          'filter': ['!=', ['get', 'hide_3d'], true],
          'paint': {
              'fill-extrusion-color': [
                  'interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 0],
                  0, '#e5e7eb', 200, '#60a5fa', 400, '#2563eb'
              ],
              'fill-extrusion-height': [
                  'interpolate', ['linear'], ['zoom'], 14, 0, 15.5, ['coalesce', ['get', 'render_height'], 0]
              ],
              'fill-extrusion-base': [
                  'case', ['>=', ['get', 'zoom'], 15.5], ['coalesce', ['get', 'render_min_height'], 0], 0
              ],
              'fill-extrusion-opacity': 0.8
          }
      }, labelLayerId);
  };

  // --- 4. KHỞI TẠO MAP ---
  useEffect(() => {
    if (mapInstanceRef.current) return;
    
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright', 
      center: [105.83, 21.02], zoom: 15, pitch: 60, bearing: -10, antialias: true,
    });
    mapInstanceRef.current = map;
    setIs3DMode(true); 

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', async () => {
        loadIconsToMap(map);
        add3DBuildings(map);

        // Layer Giao Thông
        try {
          const trafficData = await fetchTrafficMap();
          if (trafficData.features) trafficData.features = trafficData.features.map(f => ({...f, id: String(f.id)}));
          map.addSource('traffic-source', { type: 'geojson', data: trafficData, promoteId: 'id' });
          map.addLayer({ id: 'traffic-lines', type: 'line', source: 'traffic-source', layout: { 'line-join': 'round', 'line-cap': 'round', 'visibility': 'none' }, paint: { 'line-width': 4, 'line-color': ['case', ['boolean', ['feature-state', 'isRed'], false], '#ef4444', ['boolean', ['feature-state', 'isOrange'], false], '#f97316', '#22c55e'], 'line-opacity': 0.8 } });
        } catch (error) {
          console.warn("Failed to load traffic layer:", error);
        }

        // Layer Vòng Tròn Bán Kính
        map.addSource('radius-overlay', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({ id: 'radius-fill', type: 'fill', source: 'radius-overlay', paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.15 } });
        map.addLayer({ id: 'radius-outline', type: 'line', source: 'radius-overlay', paint: { 'line-color': '#3b82f6', 'line-width': 2, 'line-dasharray': [2, 2] } });

        // Layer Clustering
        map.addSource('locations-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, cluster: true, clusterMaxZoom: 14, clusterRadius: 50 });
        map.addLayer({ id: 'clusters', type: 'circle', source: 'locations-source', filter: ['has', 'point_count'], paint: { 'circle-color': '#51bbd6', 'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40], 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });
        map.addLayer({ id: 'cluster-count', type: 'symbol', source: 'locations-source', filter: ['has', 'point_count'], layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['Noto Sans Regular'], 'text-size': 12 }, paint: { 'text-color': '#ffffff' } });
        map.addLayer({ id: 'unclustered-point', type: 'symbol', source: 'locations-source', filter: ['!has', 'point_count'], layout: { 'icon-image': ['concat', 'icon-', ['get', 'type']], 'icon-size': 1, 'icon-anchor': 'bottom', 'icon-allow-overlap': true } });

        // Events
        map.on('click', 'clusters', async (e) => { 
            const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] }); 
            const clusterId = features[0].properties.cluster_id; 
            const source = map.getSource('locations-source'); 
            const zoom = await source.getClusterExpansionZoom(clusterId); 
            map.easeTo({ center: features[0].geometry.coordinates, zoom }); 
        });

        map.on('click', 'unclustered-point', (e) => { 
            const props = e.features[0].properties; 
            const coords = e.features[0].geometry.coordinates; 
            setSelectedStation({ ...props, latitude: coords[1], longitude: coords[0] }); 
            map.flyTo({ center: coords, zoom: 16, pitch: 60, speed: 1.5 });
            setIs3DMode(true);
        });

        map.on('mouseenter', 'clusters', () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', 'clusters', () => map.getCanvas().style.cursor = '');
        map.on('mouseenter', 'unclustered-point', () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', 'unclustered-point', () => map.getCanvas().style.cursor = '');

        setIsMapReady(true);
    });
  }, []);

  // --- 5. TẢI DỮ LIỆU ---
  useEffect(() => {
      const loadAllData = async () => {
          setIsLoading(true);
          try {
              const [aqi, weather, parks, charging, bikes, tourist] = await Promise.all([
                  fetchLiveAQI(), fetchWeatherStations(),
                  fetchLocations('PUBLIC_PARK'), fetchLocations('CHARGING_STATION'),
                  fetchLocations('BICYCLE_RENTAL'), fetchLocations('TOURIST_ATTRACTION')
              ]);
              setAqiData(Array.isArray(aqi?.data) ? aqi.data : []);
              setRainData(weather || []);
              setLocations({ PUBLIC_PARK: parks || [], CHARGING_STATION: charging || [], BICYCLE_RENTAL: bikes || [], TOURIST_ATTRACTION: tourist || [] });
          } catch (e) { console.error(e); } finally { setIsLoading(false); }
      };
      loadAllData();
      if(navigator.geolocation) navigator.geolocation.getCurrentPosition(p => setUserLocation([p.coords.longitude, p.coords.latitude]), () => {});
  }, []);

  // --- 6. RENDER LOGIC (Bao gồm Radius Circle) ---
  useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map || !isMapReady || !map.getSource('locations-source')) return;

      // Cập nhật Radius Circle
      if (map.getSource('radius-overlay')) {
        if (userLocation && filterRadius > 0) {
            map.getSource('radius-overlay').setData(createGeoJSONCircle(userLocation, filterRadius));
        } else {
            map.getSource('radius-overlay').setData({ type: 'FeatureCollection', features: [] });
        }
      }

      const isTraffic = viewMode === 'TRAFFIC';
      if (map.getLayer('traffic-lines')) map.setLayoutProperty('traffic-lines', 'visibility', isTraffic ? 'visible' : 'none');

      // Clear Markers cũ
      markersRef.current.forEach(m => m.remove()); markersRef.current = [];

      if (['AQI', 'RAIN'].includes(viewMode)) {
          map.setLayoutProperty('clusters', 'visibility', 'none'); 
          map.setLayoutProperty('cluster-count', 'visibility', 'none'); 
          map.setLayoutProperty('unclustered-point', 'visibility', 'none');

          currentDataList.forEach(item => {
            const coords = viewMode === 'AQI' ? [item.coordinates?.longitude, item.coordinates?.latitude] : item.location.coordinates;
            if(!coords || !coords[0]) return;
            const val = viewMode === 'AQI' ? item.value : item.temperature;
            const color = viewMode === 'AQI' ? (val<=50?'#10b981':val<=100?'#eab308':'#ef4444') : (item.isRaining ? '#3b82f6' : '#f59e0b');
            const icon = viewMode === 'AQI' ? <Wind size={16}/> : (item.isRaining ? <CloudRain size={16}/> : <Sun size={16}/>);

            const el = document.createElement('div');
            el.className = 'custom-marker-container'; el.style.cursor = 'pointer';
            el.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; background: ${color}; border: 2px solid white; border-radius: 20px; padding: 4px 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: white; min-width: 60px;">
                    <div style="margin-right: 4px; display: flex;">${ReactDOMServer.renderToString(icon)}</div>
                    <span style="font-weight: 800; font-size: 13px;">${val}</span>
                </div>
                <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${color}; margin: -1px auto 0;"></div>
            `;
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                setSelectedStation({ ...item, type: viewMode, displayColor: color, latitude: coords[1], longitude: coords[0] });
                map.flyTo({ center: coords, zoom: 16, pitch: 60 });
                setIs3DMode(true);
            });
            markersRef.current.push(new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(coords).addTo(map));
          });
      } else if (!isTraffic) {
          // Mode Địa điểm (Clustering)
          map.setLayoutProperty('clusters', 'visibility', 'visible'); 
          map.setLayoutProperty('cluster-count', 'visibility', 'visible'); 
          map.setLayoutProperty('unclustered-point', 'visibility', 'visible');
          
          const config = MODE_CONFIG[viewMode];
          const geoJsonFeatures = currentDataList.map(item => ({ 
              type: 'Feature', geometry: { type: 'Point', coordinates: [item.longitude, item.latitude] }, 
              properties: { ...item, type: viewMode } 
          }));
          map.getSource('locations-source').setData({ type: 'FeatureCollection', features: geoJsonFeatures });
          map.setPaintProperty('clusters', 'circle-color', config.color);
      } else {
          // Traffic Mode: Ẩn hết marker
          map.setLayoutProperty('clusters', 'visibility', 'none'); 
          map.setLayoutProperty('cluster-count', 'visibility', 'none'); 
          map.setLayoutProperty('unclustered-point', 'visibility', 'none');
      }

  }, [viewMode, currentDataList, trafficStatus, isMapReady, userLocation, filterRadius]);

  // Traffic Polling
  useEffect(() => {
      if (viewMode !== 'TRAFFIC') return;
      const loadTraffic = () => fetchTrafficLive().then(res => { if(res?.status) setTrafficStatus(res.status); });
      loadTraffic();
      const interval = setInterval(loadTraffic, 5000);
      return () => clearInterval(interval);
  }, [viewMode]);

  useEffect(() => {
      const map = mapInstanceRef.current;
      if (viewMode === 'TRAFFIC' && map && map.getLayer('traffic-lines') && trafficStatus) {
          Object.keys(trafficStatus).forEach((rawId) => {
              const state = { isRed: trafficStatus[rawId] === 'red', isOrange: trafficStatus[rawId] === 'orange' };
              map.setFeatureState({ source: 'traffic-source', id: String(rawId) }, state);
          });
      }
  }, [trafficStatus, viewMode]);

  // --- ACTIONS ---
  const handleLocateMe = (zoomTo = true) => {
      const map = mapInstanceRef.current;
      if(!map || !navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          setUserLocation(coords);
          if(zoomTo) {
              map.flyTo({ center: coords, zoom: 15, pitch: 60 });
              setIs3DMode(true);
          }
          if(userMarkerRef.current) userMarkerRef.current.remove();
          const el = document.createElement('div');
          el.innerHTML = `<div class="relative flex items-center justify-center"><div class="animate-ping absolute inline-flex h-24 w-24 rounded-full bg-blue-500 opacity-20" style="animation-duration: 2s;"></div><div class="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-blue-500 opacity-40" style="animation-duration: 1.5s;"></div><div class="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-lg z-10"></div></div>`;
          userMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map);
      });
  };

  const handleSearchResultClick = (item) => {
      setSearchTerm(''); setSearchResults([]); setIsSearchFocused(false);
      let lat, lon;
      if (item.coordinates) { lat = item.coordinates.latitude; lon = item.coordinates.longitude; }
      else if (item.location?.coordinates) { lat = item.location.coordinates[1]; lon = item.location.coordinates[0]; }
      else { lat = item.latitude; lon = item.longitude; }
      
      let displayColor = MODE_CONFIG[viewMode].color;
      if (viewMode === 'AQI') displayColor = item.value <= 50 ? '#10b981' : item.value <= 100 ? '#eab308' : '#ef4444';
      else if (viewMode === 'RAIN') displayColor = item.isRaining ? '#3b82f6' : '#f59e0b';

      setSelectedStation({ ...item, type: viewMode, displayColor, latitude: lat, longitude: lon });
      if (mapInstanceRef.current && lat && lon) {
          mapInstanceRef.current.flyTo({ center: [lon, lat], zoom: 17, pitch: 60, speed: 1.5 });
          setIs3DMode(true);
      }
  };

  const toggle3D = () => {
      const map = mapInstanceRef.current;
      if (!map) return;
      map.easeTo({ pitch: is3DMode ? 0 : 60, duration: 1000 });
      setIs3DMode(!is3DMode);
  };

    return (
        <div className="h-full w-full flex flex-col relative bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800/50 shadow-sm dark:shadow-2xl overflow-hidden group transition-colors duration-300 pb-16 sm:pb-0">
      
      {/* TOOLBAR */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20 flex flex-col gap-3 pointer-events-none">
          <div className="bg-white/95 dark:bg-black/85 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-2 sm:p-3 rounded-2xl shadow-xl flex flex-wrap gap-2 sm:gap-3 pointer-events-auto items-center max-w-5xl mx-auto">
             {/* 1. Mode Selector */}
             <div className="flex gap-1 overflow-x-auto custom-scrollbar max-w-full sm:max-w-[55vw] md:max-w-none pb-1 md:pb-0">
                 {Object.keys(MODE_CONFIG).map((key) => {
                    const conf = MODE_CONFIG[key]; const isActive = viewMode === key;
                    return (<button key={key} onClick={() => { setViewMode(key); setSelectedStation(null); setSearchTerm(''); }} title={conf.label} className={`min-w-[42px] h-10 px-2 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${isActive ? 'text-gray-900 dark:text-black bg-emerald-500/20 shadow-inner ring-1 ring-emerald-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}>{React.createElement(conf.icon, { size: 18, color: isActive ? conf.color : 'currentColor' })}</button>)
                })}
             </div>

             {viewMode !== 'TRAFFIC' && (
                 <>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 hidden md:block"></div>
                    
                    {/* 2. Radius Filter */}
                    <div className="relative">
                        <button onClick={() => setShowFilterMenu(!showFilterMenu)} className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><Filter size={14}/> <span className="hidden sm:inline">{RADIUS_OPTIONS.find(r => r.value === filterRadius)?.label}</span><span className="sm:hidden">Bán kính</span></button>
                        {showFilterMenu && (<div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-[#1a1d24] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">{RADIUS_OPTIONS.map(opt => (<button key={opt.value} onClick={() => { if(opt.value > 0 && !userLocation) handleLocateMe(false); setFilterRadius(opt.value); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-xs font-medium ${filterRadius === opt.value ? 'text-emerald-500 bg-emerald-500/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{opt.label}</button>))}</div>)}
                    </div>
                    
                    {/* 3. Search Bar */}
                    <div className="relative group flex-1 min-w-[180px] sm:min-w-[220px] md:min-w-[260px]">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400"/>
                        <input type="text" className="w-full pl-8 pr-3 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-xs sm:text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-black transition-all" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}/>
                        {searchTerm && <button onClick={() => { setSearchTerm(''); setSearchResults([]); }} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={14} /></button>}
                        
                        {/* Search Dropdown */}
                        {isSearchFocused && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1d24] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                                <ul className="max-h-80 overflow-y-auto custom-scrollbar py-2">
                                    {searchResults.map((item, index) => (
                                        <li key={index} onClick={() => handleSearchResultClick(item)} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer flex items-center justify-between border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors">
                                            <div className="flex items-center min-w-0 flex-1">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center mr-3 shadow-sm" style={{backgroundColor: `${MODE_CONFIG[viewMode].color}15`}}>{React.createElement(MODE_CONFIG[viewMode].icon, { size: 20, color: MODE_CONFIG[viewMode].color })}</div>
                                                <div className="truncate"><p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{item.name || item.station_name}</p>{item.distance && <p className="text-xs text-emerald-500 font-medium">Cách {item.distance.toFixed(1)} km</p>}</div>
                                            </div>
                                            <ArrowRight size={18} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 flex-shrink-0 ml-2"/>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                 </>
             )}
          </div>
      </div>

      {/* LEGEND TRAFFIC */}
      {viewMode === 'TRAFFIC' && (
          <div className="absolute top-20 right-4 z-10 bg-white/90 dark:bg-black/80 backdrop-blur border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-lg text-xs font-medium space-y-2 text-gray-700 dark:text-gray-300 pointer-events-none">
              <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div> Tắc nghẽn</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div> Đông xe</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> Thông thoáng</div>
          </div>
      )}

      {/* BOTTOM CONTROLS */}
    <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-10 flex flex-col gap-3 pointer-events-auto sm:left-auto sm:transform-none left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-0">
          {/* Nút 3D */}
          <button onClick={toggle3D} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur transition-all active:scale-95 border border-gray-200 dark:border-gray-700 ${is3DMode ? 'bg-emerald-500 text-white border-transparent shadow-emerald-500/30' : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'}`} title="Bật/Tắt 3D"><Building2 size={18} className={is3DMode ? 'animate-pulse' : ''} /></button>
          {/* Nút Vị trí */}
          <button onClick={() => handleLocateMe(true)} className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 transition-transform active:scale-95 border border-white/20"><LocateFixed size={24} /></button>
      </div>

      {/* SIDEBAR CHI TIẾT */}
        {selectedStation && viewMode !== 'TRAFFIC' && (
            <div className="absolute z-30 bottom-2 sm:bottom-4 left-2 right-2 sm:left-auto sm:right-4 sm:w-96 bg-white/95 dark:bg-[#111318]/90 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden flex flex-col max-h-[75vh] sm:max-h-[70vh]">
             <div className="h-20 w-full relative overflow-hidden flex-shrink-0">
                 <div className="absolute inset-0 opacity-40" style={{backgroundColor: MODE_CONFIG[selectedStation.type]?.color || selectedStation.displayColor || '#333'}}></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#111318] to-transparent"></div>
                 <button onClick={() => setSelectedStation(null)} className="absolute top-3 right-3 p-1.5 bg-gray-100/50 dark:bg-black/50 hover:bg-gray-200 dark:hover:bg-black/80 rounded-full text-gray-800 dark:text-white transition-colors backdrop-blur"><X size={16}/></button>
             </div>
             
             <div className="px-6 pb-6 -mt-10 relative overflow-y-auto custom-scrollbar">
                 <div className="flex items-end mb-3">
                     <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-[#111318]" style={{backgroundColor: MODE_CONFIG[selectedStation.type]?.color || selectedStation.displayColor || '#333'}}>
                        {React.createElement(MODE_CONFIG[selectedStation.type]?.icon || Info, { size: 32, color: 'white' })}
                     </div>
                 </div>
                 
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1">{selectedStation.station_name || selectedStation.name || 'Không tên'}</h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-800 pb-3">{MODE_CONFIG[selectedStation.type]?.label}</p>
                 
                 <div className="space-y-4">
                     {['AQI', 'RAIN'].includes(selectedStation.type) && (
                         <div className="grid grid-cols-3 gap-2">
                             <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-xl border border-gray-100 dark:border-white/5 text-center">
                                 <div className="flex justify-center mb-1 text-gray-400"><Thermometer size={14}/></div>
                                 <div className="font-bold text-gray-800 dark:text-white">{selectedStation.temperature}°</div>
                                 <div className="text-[10px] text-gray-500">Nhiệt độ</div>
                             </div>
                             <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-xl border border-gray-100 dark:border-white/5 text-center">
                                 <div className="flex justify-center mb-1 text-blue-400"><Droplets size={14}/></div>
                                 <div className="font-bold text-gray-800 dark:text-white">{selectedStation.humidity}%</div>
                                 <div className="text-[10px] text-gray-500">Độ ẩm</div>
                             </div>
                             <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-xl border border-gray-100 dark:border-white/5 text-center">
                                 <div className="flex justify-center mb-1 text-green-400"><Wind size={14}/></div>
                                 <div className="font-bold text-gray-800 dark:text-white">{selectedStation.wind_speed}</div>
                                 <div className="text-[10px] text-gray-500">Gió (m/s)</div>
                             </div>
                             {selectedStation.type === 'AQI' && (
                                <div className="col-span-3 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5 flex justify-between items-center mt-1">
                                    <span className="text-xs font-bold text-gray-500">Chỉ số AQI</span>
                                    <span className={`text-2xl font-black ${selectedStation.value > 100 ? 'text-red-500' : selectedStation.value > 50 ? 'text-yellow-500' : 'text-green-500'}`}>{selectedStation.value}</span>
                                </div>
                             )}
                         </div>
                     )}

                     {!['AQI', 'RAIN'].includes(selectedStation.type) && (
                         <div className="space-y-2">
                            {selectedStation.description && (
                                <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/5 mb-3">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">"{selectedStation.description}"</p>
                                </div>
                            )}
                            {Object.entries(selectedStation).map(([key, value]) => {
                                if (['id', 'name', 'station_name', 'description', 'type', 'color', 'value', 'temperature', 'humidity', 'wind_speed', 'coords', 'latitude', 'longitude', 'distance'].includes(key)) return null;
                                if (value === null || value === undefined || value === '') return null;

                                let label = FIELD_TRANSLATION[key] || key.replace(/_/g, ' ');
                                let content = value;
                                if (key === 'location_type') content = TYPE_TRANSLATION[value] || value;
                                else if (key === 'is_active') content = value ? <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end"><CheckCircle size={12} className="mr-1"/> Hoạt động</span> : <span className="text-red-500 font-bold flex items-center justify-end"><XCircle size={12} className="mr-1"/> Tạm ngừng</span>;
                                else if (key === 'data_source' && TYPE_TRANSLATION[value]) content = TYPE_TRANSLATION[value];

                                return (
                                    <div key={key} className="flex justify-between items-start text-sm border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium capitalize text-xs">{label}</span>
                                        <span className="text-gray-900 dark:text-gray-200 font-semibold text-right max-w-[65%] text-xs break-words">{content}</span>
                                    </div>
                                );
                            })}
                         </div>
                     )}
                     
                     <div className="flex justify-center pt-2">
                        <span className="text-[10px] text-gray-400 dark:text-gray-600 font-mono bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
                            {selectedStation.latitude?.toFixed(5)}, {selectedStation.longitude?.toFixed(5)}
                            {selectedStation.distance && <span className="ml-2 text-emerald-500 font-bold">• {selectedStation.distance.toFixed(1)} km</span>}
                        </span>
                     </div>
                 </div>
             </div>
         </div>
      )}

      {/* 5. MAP AREA */}
      <div className="flex-1 relative z-0">
                <div ref={mapContainerRef} className="absolute inset-0 w-full h-full min-h-[60vh] sm:min-h-0" />
        {isLoading && <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50"><Loader2 className="animate-spin text-emerald-500 mb-3" size={48}/><span className="text-emerald-500 font-bold text-sm tracking-widest animate-pulse">ĐANG ĐỒNG BỘ...</span></div>}
      </div>
    </div>
  );
};

export default AirQualityMap;
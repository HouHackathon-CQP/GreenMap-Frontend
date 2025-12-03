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
import { 
  Loader2, Wind, CloudRain, LocateFixed, Car, Sun, 
  TreePine, Zap, Bike, Camera, Info, X, 
  Thermometer, Droplets, CheckCircle, XCircle
} from 'lucide-react';
import ReactDOMServer from 'react-dom/server';
import { fetchLiveAQI, fetchTrafficMap, fetchTrafficLive, fetchLocations } from '../services'; 
import { fetchWeatherStations, fetchWeatherForecast } from '../services/weatherService';
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

const TYPE_TRANSLATION = {
    'PUBLIC_PARK': 'Công viên công cộng',
    'CHARGING_STATION': 'Trạm sạc xe điện',
    'BICYCLE_RENTAL': 'Điểm thuê xe đạp',
    'TOURIST_ATTRACTION': 'Điểm tham quan du lịch',
    'PostgreSQL': 'Cơ sở dữ liệu nội bộ',
    'OSM': 'OpenStreetMap'
};

const FIELD_TRANSLATION = {
    'location_type': 'Loại hình',
    'data_source': 'Nguồn dữ liệu',
    'is_active': 'Trạng thái',
    'provider': 'Nhà cung cấp',
    'address': 'Địa chỉ',
    'capacity': 'Sức chứa',
    'opening_hours': 'Giờ mở cửa'
};

const AirQualityMap = () => {
  const { theme } = useTheme(); 
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]); 
  const userMarkerRef = useRef(null); 

  const [viewMode, setViewMode] = useState('AQI'); 
  const [aqiData, setAqiData] = useState([]);
  const [rainData, setRainData] = useState([]);
  const [locations, setLocations] = useState({});
  const [trafficStatus, setTrafficStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  // --- 1. TẠO ICON CHUẨN (SVG) ---
  const loadIconsToMap = (map) => {
      ['PUBLIC_PARK', 'CHARGING_STATION', 'BICYCLE_RENTAL', 'TOURIST_ATTRACTION'].forEach(key => {
          const config = MODE_CONFIG[key];
          const iconString = ReactDOMServer.renderToStaticMarkup(
              React.createElement(config.icon, { size: 20, color: "white", strokeWidth: 2.5 })
          );
          
          // SVG: ViewBox 40x50, mũi nhọn ở (20, 50)
          const svg = `
            <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
                </filter>
                <path d="M20 0C8.95 0 0 8.95 0 20C0 31 20 50 20 50C20 50 40 31 40 20C40 8.95 31.05 0 20 0Z" fill="${config.color}" stroke="white" stroke-width="2" filter="url(#shadow)"/>
                <circle cx="20" cy="20" r="14" fill="rgba(255,255,255,0.2)"/>
                <g transform="translate(10, 10)">
                    ${iconString.replace('width="20"', 'width="20"').replace('height="20"', 'height="20"')}
                </g>
            </svg>`;

          const img = new Image(40, 50);
          img.onload = () => { if (!map.hasImage(`icon-${key}`)) map.addImage(`icon-${key}`, img, { pixelRatio: 1 }); };
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      });
  };

  // --- 2. KHỞI TẠO MAP ---
  useEffect(() => {
    if (mapInstanceRef.current) return;
    
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright', 
      center: [105.83, 21.02], zoom: 12.5, pitch: 40, antialias: true,
    });
    mapInstanceRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', async () => {
        loadIconsToMap(map);

        // A. LAYER GIAO THÔNG
        try {
            const trafficData = await fetchTrafficMap();
            // Chuẩn hóa ID để map feature-state
            if(trafficData.features) {
                trafficData.features = trafficData.features.map(f => ({...f, id: String(f.id)}));
            }
            map.addSource('traffic-source', { type: 'geojson', data: trafficData || { type: 'FeatureCollection', features: [] }, promoteId: 'id' });
            map.addLayer({
                id: 'traffic-lines', type: 'line', source: 'traffic-source',
                layout: { 'line-join': 'round', 'line-cap': 'round', 'visibility': 'none' },
                paint: { 
                    'line-width': 4, 
                    'line-color': ['case', ['boolean', ['feature-state', 'isRed'], false], '#ef4444', ['boolean', ['feature-state', 'isOrange'], false], '#f97316', '#22c55e'], 
                    'line-opacity': 0.8 
                }
            });
        } catch (e) {}

        // B. LAYER ĐỊA ĐIỂM (CLUSTERING) - Chỉ cho Locations
        map.addSource('locations-source', {
            type: 'geojson', data: { type: 'FeatureCollection', features: [] },
            cluster: true, clusterMaxZoom: 14, clusterRadius: 50
        });

        // 1. Cluster Circle
        map.addLayer({
            id: 'clusters', type: 'circle', source: 'locations-source', filter: ['has', 'point_count'],
            paint: { 
                'circle-color': '#51bbd6', 
                'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40], 
                'circle-stroke-width': 2, 'circle-stroke-color': '#fff' 
            }
        });

        // 2. Cluster Count Text (FIX LỖI FONT Ở ĐÂY)
        map.addLayer({
            id: 'cluster-count', type: 'symbol', source: 'locations-source', filter: ['has', 'point_count'],
            layout: { 
                'text-field': '{point_count_abbreviated}', 
                // --- FIX: Đổi font sang Noto Sans Regular ---
                'text-font': ['Noto Sans Regular'], 
                'text-size': 12 
            },
            paint: { 'text-color': '#ffffff' }
        });

        // 3. Icon Unclustered (FIX LỖI LỆCH)
        map.addLayer({
            id: 'unclustered-point', type: 'symbol', source: 'locations-source', filter: ['!has', 'point_count'],
            layout: { 
                'icon-image': ['concat', 'icon-', ['get', 'type']], // Tự động lấy icon theo type
                'icon-size': 1, 
                'icon-anchor': 'bottom', // Đuôi icon chạm mốc tọa độ
                'icon-allow-overlap': true 
            }
        });

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
            map.flyTo({ center: coords, zoom: 15, speed: 1.5 });
        });

        map.on('mouseenter', 'clusters', () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', 'clusters', () => map.getCanvas().style.cursor = '');
        map.on('mouseenter', 'unclustered-point', () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', 'unclustered-point', () => map.getCanvas().style.cursor = '');

        loadData();
    });
  }, []);

  // 3. LOAD DATA
  const loadData = async () => {
      setIsLoading(true);
      try {
          const [aqi, weather, parks, charging, bikes, tourist] = await Promise.all([
              fetchLiveAQI(), fetchWeatherStations(),
              fetchLocations('PUBLIC_PARK'), fetchLocations('CHARGING_STATION'),
              fetchLocations('BICYCLE_RENTAL'), fetchLocations('TOURIST_ATTRACTION')
          ]);
          setAqiData(Array.isArray(aqi?.data) ? aqi.data : []);
          setRainData(weather || []);
          setLocations({ PUBLIC_PARK: parks, CHARGING_STATION: charging, BICYCLE_RENTAL: bikes, TOURIST_ATTRACTION: tourist });
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  // 4. RENDER LOGIC
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.getSource('locations-source')) return;

    // A. TRAFFIC
    const isTraffic = viewMode === 'TRAFFIC';
    if (map.getLayer('traffic-lines')) {
        map.setLayoutProperty('traffic-lines', 'visibility', isTraffic ? 'visible' : 'none');
    }

    // B. AQI & RAIN (HTML MARKER)
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (['AQI', 'RAIN'].includes(viewMode)) {
        // Ẩn Clustering Layer
        map.setLayoutProperty('clusters', 'visibility', 'none');
        map.setLayoutProperty('cluster-count', 'visibility', 'none');
        map.setLayoutProperty('unclustered-point', 'visibility', 'none');

        const dataList = viewMode === 'AQI' ? aqiData : rainData;
        dataList.forEach(item => {
            const coords = viewMode === 'AQI' ? [item.coordinates?.longitude, item.coordinates?.latitude] : item.location.coordinates;
            if(!coords || !coords[0]) return;

            const val = viewMode === 'AQI' ? item.value : item.temperature;
            const color = viewMode === 'AQI' ? (val<=50?'#10b981':val<=100?'#eab308':'#ef4444') : (item.isRaining ? '#3b82f6' : '#f59e0b');
            const icon = viewMode === 'AQI' ? <Wind size={16}/> : (item.isRaining ? <CloudRain size={16}/> : <Sun size={16}/>);

            const el = document.createElement('div');
            el.className = 'custom-marker-container';
            el.style.cursor = 'pointer';
            
            // HTML Marker (Giọt nước)
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
                map.flyTo({ center: coords, zoom: 15 });
            });

            // anchor: 'bottom' để đuôi chạm đất
            markersRef.current.push(new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(coords).addTo(map));
        });

    } else if (!isTraffic) {
        // C. LOCATIONS (CLUSTERING LAYER)
        map.setLayoutProperty('clusters', 'visibility', 'visible');
        map.setLayoutProperty('cluster-count', 'visibility', 'visible');
        map.setLayoutProperty('unclustered-point', 'visibility', 'visible');

        const locationList = locations[viewMode] || [];
        const config = MODE_CONFIG[viewMode];

        const geoJsonFeatures = locationList.map(item => ({
            type: 'Feature', geometry: { type: 'Point', coordinates: [item.longitude, item.latitude] },
            properties: { ...item, type: viewMode }
        }));

        map.getSource('locations-source').setData({ type: 'FeatureCollection', features: geoJsonFeatures });
        map.setPaintProperty('clusters', 'circle-color', config.color);
    } else {
        // Tắt hết nếu là Traffic
        map.setLayoutProperty('clusters', 'visibility', 'none');
        map.setLayoutProperty('cluster-count', 'visibility', 'none');
        map.setLayoutProperty('unclustered-point', 'visibility', 'none');
    }

  }, [viewMode, aqiData, rainData, locations, trafficStatus]);

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

  // Handle Locate
  const handleLocateMe = () => {
      const map = mapInstanceRef.current;
      if(!map || !navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          map.flyTo({ center: coords, zoom: 14 });
          if(userMarkerRef.current) userMarkerRef.current.remove();
          const el = document.createElement('div');
          el.innerHTML = `<span class="relative flex h-4 w-4"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span></span>`;
          userMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map);
      });
  };

  return (
    <div className="h-full w-full flex flex-col relative bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800/50 shadow-sm dark:shadow-2xl overflow-hidden group transition-colors duration-300">
      
      {/* TOOLBAR */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-3 pointer-events-none">
          <div className="bg-white/90 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-1.5 rounded-2xl shadow-lg flex gap-2 pointer-events-auto overflow-x-auto custom-scrollbar w-max max-w-full mx-auto">
            {Object.keys(MODE_CONFIG).map((key) => {
                const conf = MODE_CONFIG[key];
                const isActive = viewMode === key;
                return (
                    <button key={key} onClick={() => { setViewMode(key); setSelectedStation(null); }} title={conf.label} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${isActive ? 'text-gray-900 dark:text-black shadow-md scale-110 ring-2 ring-white/50' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`} style={{ backgroundColor: isActive ? conf.color : 'transparent' }}>
                        {React.createElement(conf.icon, { size: 20 })}
                    </button>
                )
            })}
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

      {/* LOCATE BUTTON */}
      <div className="absolute bottom-6 right-6 z-10">
          <button onClick={handleLocateMe} className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-transform active:scale-95"><LocateFixed size={24} /></button>
      </div>

      {/* SIDEBAR */}
      {selectedStation && viewMode !== 'TRAFFIC' && (
         <div className="absolute z-30 bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 bg-white/95 dark:bg-[#111318]/90 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden flex flex-col max-h-[70vh]">
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
                     {/* AQI/RAIN */}
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

                     {/* LOCATIONS */}
                     {!['AQI', 'RAIN'].includes(selectedStation.type) && (
                         <div className="space-y-2">
                            {selectedStation.description && (
                                <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/5 mb-3">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">"{selectedStation.description}"</p>
                                </div>
                            )}
                            {Object.entries(selectedStation).map(([key, value]) => {
                                if (['id', 'name', 'station_name', 'description', 'type', 'color', 'value', 'temperature', 'humidity', 'wind_speed', 'coords', 'latitude', 'longitude'].includes(key)) return null;
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
                        </span>
                     </div>
                 </div>
             </div>
         </div>
      )}

      {/* 5. MAP AREA */}
      <div className="flex-1 relative z-0">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        {isLoading && <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50"><Loader2 className="animate-spin text-emerald-500 mb-3" size={48}/><span className="text-emerald-500 font-bold text-sm tracking-widest animate-pulse">ĐANG ĐỒNG BỘ...</span></div>}
      </div>
    </div>
  );
};

export default AirQualityMap;
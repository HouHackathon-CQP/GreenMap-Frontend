import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Loader2, Wind, CloudRain, Droplets, Map as MapIcon, 
  Thermometer, Navigation, X, LocateFixed, Car,
  Sun, Cloud, CloudLightning 
} from 'lucide-react';
import ReactDOMServer from 'react-dom/server';
import { fetchLiveAQI, fetchTrafficMap, fetchTrafficLive } from '../services'; 
import { fetchWeatherStations, fetchWeatherForecast } from '../services/weatherService';

const AirQualityMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]); 
  const userMarkerRef = useRef(null); 

  const [viewMode, setViewMode] = useState('AQI'); // 'AQI' | 'RAIN' | 'TRAFFIC'
  const [aqiData, setAqiData] = useState([]);
  const [rainData, setRainData] = useState([]);
  const [forecast, setForecast] = useState(null); 
  const [trafficStatus, setTrafficStatus] = useState({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  // --- HÀM CHỌN ICON THỜI TIẾT ---
  const getWeatherMarkerIcon = (weatherType) => {
      const type = String(weatherType).toLowerCase();
      if (type.includes('mưa') || type.includes('rain')) return <CloudRain size={16} color="white"/>;
      if (type.includes('dông') || type.includes('storm')) return <CloudLightning size={16} color="white"/>;
      if (type.includes('mây') || type.includes('cloud') || type.includes('âm u')) return <Cloud size={16} color="white"/>;
      return <Sun size={16} color="white"/>;
  };

  // 1. LOAD DATA
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
          const [aqiRes, weatherRes, forecastRes] = await Promise.all([
              fetchLiveAQI(), 
              fetchWeatherStations(), 
              fetchWeatherForecast()
          ]);
          setAqiData(Array.isArray(aqiRes?.data) ? aqiRes.data : []);
          setRainData(weatherRes || []);
          setForecast(forecastRes);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    loadAllData();
  }, []);

  // 1b. LOAD TRAFFIC (Polling)
  useEffect(() => {
      if (viewMode !== 'TRAFFIC') return;
      fetchTrafficLive().then(res => { if(res?.status) setTrafficStatus(res.status); });
      const interval = setInterval(() => {
          fetchTrafficLive().then(res => { if(res?.status) setTrafficStatus(res.status); });
      }, 5000);
      return () => clearInterval(interval);
  }, [viewMode]);

  // HÀM ĐỊNH VỊ (GPS)
  const handleLocateMe = () => {
      const map = mapInstanceRef.current;
      if(!map || !navigator.geolocation) return;
      
      const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

      navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude: userLat, longitude: userLng } = pos.coords;
          const coords = [userLng, userLat];
          
          map.flyTo({ center: coords, zoom: 14, speed: 2 });

          const el = document.createElement('div');
          el.innerHTML = `<div class="relative flex h-5 w-5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span><span class="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-md"></span></div>`;
          
          if(userMarkerRef.current) userMarkerRef.current.remove();
          userMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map);
      }, (err) => console.log(err), options);
  };

  // 2. INIT MAP
  useEffect(() => {
    if (mapInstanceRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright', 
      center: [105.83, 21.02], zoom: 12, pitch: 40, antialias: true,
    });
    mapInstanceRef.current = map;

    map.on('load', async () => {
        handleLocateMe();
        try {
            const trafficData = await fetchTrafficMap();
            map.addSource('traffic-source', { type: 'geojson', data: trafficData || { type: 'FeatureCollection', features: [] }, promoteId: 'id' });
            map.addLayer({
              id: 'traffic-lines', type: 'line', source: 'traffic-source',
              layout: { 'line-join': 'round', 'line-cap': 'round', 'visibility': 'none' },
              paint: { 'line-width': 4, 'line-color': ['case', ['boolean', ['feature-state', 'isRed'], false], '#ef4444', ['boolean', ['feature-state', 'isOrange'], false], '#f97316', '#22c55e'], 'line-opacity': 0.8 }
            });
        } catch (error) { console.error(error); }
    });

    map.on('click', (e) => {
        if (e.originalEvent.target.closest('.custom-marker-container')) return;
        setSelectedStation(null);
        map.flyTo({ zoom: 12, pitch: 40 });
    });
  }, []);

  // 3. RENDER LAYERS & MARKERS
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Toggle Traffic Layer
    if (map.getLayer('traffic-lines')) {
        map.setLayoutProperty('traffic-lines', 'visibility', viewMode === 'TRAFFIC' ? 'visible' : 'none');
    }

    // Reset Markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (viewMode === 'TRAFFIC') {
        if (trafficStatus) {
            Object.keys(trafficStatus).forEach((rawId) => {
                const color = trafficStatus[rawId];
                if (color === 'red') map.setFeatureState({ source: 'traffic-source', id: String(rawId) }, { isRed: true });
                else if (color === 'orange') map.setFeatureState({ source: 'traffic-source', id: String(rawId) }, { isOrange: true });
            });
        }
        return; 
    }

    // Prepare Marker Data
    const displayData = viewMode === 'AQI' 
        ? aqiData.map(item => ({ 
            raw: item, 
            id: item.sensor_id||item.id, 
            coords: item.coordinates?[item.coordinates.longitude, item.coordinates.latitude]:[0,0], 
            value: item.value, 
            unit: 'AQI', 
            color: item.value<=50?'#10b981':item.value<=100?'#eab308':'#ef4444', 
            icon: <Wind size={16} color="white" /> 
          }))
        : rainData.map(item => ({ 
            raw: item, 
            id: item.id, 
            coords: item.location.coordinates, 
            value: item.temperature, 
            unit: '°C', 
            color: item.isRaining ? '#3b82f6' : '#f59e0b', 
            icon: getWeatherMarkerIcon(item.weatherType) 
          }));

    const validData = displayData.filter(d => d.coords && d.coords[0] !== 0);
    const currentSelectedId = selectedStation?.id;

    validData.forEach(item => {
        const el = document.createElement('div');
        el.className = 'custom-marker-container'; el.style.cursor = 'pointer'; el.style.zIndex = currentSelectedId===item.id?'100':'1';
        el.innerHTML = `
            <div style="display: flex; align-items: center; background: #1f2937; color: white; padding: 4px 8px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid ${item.color}; transform: scale(${currentSelectedId === item.id ? 1.25 : 1}); transition: all 0.2s;">
                <div style="background: ${item.color}; border-radius: 50%; width: 24px; height: 24px; margin-right: 6px; display: flex; align-items: center; justify-content: center;">${ReactDOMServer.renderToString(item.icon)}</div>
                <div style="display: flex; flex-direction: column; line-height: 1;"><span style="font-weight: 800; font-size: 13px;">${item.value}</span><span style="font-size: 9px; color: #9ca3af; font-weight: 600;">${item.unit}</span></div>
            </div>`;
        el.addEventListener('click', (e) => {
            e.stopPropagation(); setSelectedStation({ ...item.raw, displayColor: item.color, type: viewMode });
            map.flyTo({ center: item.coords, zoom: 15, pitch: 50, speed: 1.5, essential: true });
        });
        markersRef.current.push(new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(item.coords).addTo(map));
    });
  }, [viewMode, aqiData, rainData, selectedStation, trafficStatus]); 

  return (
    <div className="h-full w-full flex flex-col relative bg-[#111318] rounded-3xl border border-gray-800 shadow-xl overflow-hidden">
      
      {/* HEADER CONTROLS */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 pointer-events-none">
         <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 p-4 rounded-2xl shadow-2xl w-72 pointer-events-auto">
             <h2 className="text-lg font-bold text-white flex items-center mb-1">
                 <MapIcon className="mr-2 text-blue-500" size={20}/> Quan trắc Môi trường
             </h2>
             {viewMode === 'RAIN' && forecast?.current && (
                <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between text-xs"><span className="text-gray-400">Dự báo chung:</span><span className="text-emerald-400 font-bold">{forecast.current.desc} ({forecast.current.temp}°C)</span></div>
            )}
            {viewMode === 'TRAFFIC' && (
                <div className="mt-2 pt-2 border-t border-gray-700 text-xs">
                    <div className="flex gap-2">
                        <span className="flex items-center text-green-400"><div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>Thoáng</span>
                        <span className="flex items-center text-orange-400"><div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>Đông</span>
                        <span className="flex items-center text-red-400"><div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>Tắc</span>
                    </div>
                </div>
            )}
         </div>

         <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 p-1.5 rounded-2xl shadow-2xl flex gap-1 pointer-events-auto w-auto">
            <button onClick={() => { setViewMode('AQI'); setSelectedStation(null); }} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center ${viewMode==='AQI'?'bg-emerald-600 text-white shadow-lg':'text-gray-400 hover:bg-gray-800'}`}><Wind size={14} className="mr-1"/> AQI</button>
            <button onClick={() => { setViewMode('RAIN'); setSelectedStation(null); }} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center ${viewMode==='RAIN'?'bg-blue-600 text-white shadow-lg':'text-gray-400 hover:bg-gray-800'}`}><CloudRain size={14} className="mr-1"/> Thời tiết</button>
            <button onClick={() => { setViewMode('TRAFFIC'); setSelectedStation(null); }} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center ${viewMode==='TRAFFIC'?'bg-orange-600 text-white shadow-lg':'text-gray-400 hover:bg-gray-800'}`}><Car size={14} className="mr-1"/> Giao thông</button>
         </div>
      </div>

      {/* NÚT ĐỊNH VỊ */}
      <div className="absolute bottom-6 right-6 z-10">
          <button onClick={handleLocateMe} className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-900/50 transition-transform active:scale-95"><LocateFixed size={24} /></button>
      </div>

      {/* SIDEBAR CHI TIẾT (RESPONSIVE: Mobile BottomSheet / Desktop Sidebar) */}
      {selectedStation && viewMode !== 'TRAFFIC' && (
         <div className="
            absolute z-50 
            /* MOBILE STYLE: Dính đáy, trượt lên */
            bottom-0 left-0 w-full 
            rounded-t-3xl border-t border-gray-700
            animate-in slide-in-from-bottom-10 fade-in duration-300
            max-h-[60vh] overflow-y-auto

            /* DESKTOP STYLE: Dính góc phải, trượt ngang */
            md:top-4 md:right-4 md:w-80 md:bottom-auto md:left-auto 
            md:rounded-3xl md:border md:max-h-none
            md:animate-in md:slide-in-from-right-10 md:slide-in-from-bottom-0

            bg-gray-900/95 backdrop-blur-xl shadow-2xl 
         ">
             <div className="p-5 relative">
                 <button onClick={() => setSelectedStation(null)} className="absolute top-4 right-4 p-1 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"><X size={16}/></button>
                 
                 <div className="flex items-center space-x-3 mb-2">
                     <div className="p-2 rounded-xl shadow-inner" style={{backgroundColor: `${selectedStation.displayColor}20`, color: selectedStation.displayColor}}>
                        {selectedStation.type === 'AQI' ? <Wind size={20}/> : getWeatherMarkerIcon(selectedStation.weatherType)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-base leading-tight truncate">{selectedStation.station_name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Vừa cập nhật</p>
                     </div>
                 </div>

                 <div className="mt-4 flex items-center justify-between p-4 rounded-2xl bg-gray-800/80 border border-gray-700/50">
                     <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Chỉ số chính</p>
                        <div className="text-3xl font-black text-white mt-1 leading-none">
                            {selectedStation.type === 'AQI' ? selectedStation.value : selectedStation.temperature}
                            <span className="text-sm text-gray-500 font-medium ml-1">{selectedStation.type === 'AQI' ? 'AQI' : '°C'}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Trạng thái</p>
                        <div className="mt-1 font-bold text-sm" style={{color: selectedStation.displayColor}}>
                            {selectedStation.type === 'AQI' ? (selectedStation.value > 100 ? 'Ô nhiễm' : 'Tốt') : (selectedStation.weatherType)}
                        </div>
                     </div>
                 </div>
             </div>

             {selectedStation.type === 'RAIN' ? (
                 <div className="px-5 pb-5 grid grid-cols-2 gap-3">
                     <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50"><div className="flex items-center text-gray-400 text-xs mb-1 font-medium"><Droplets size={12} className="mr-1.5 text-blue-400"/> Độ ẩm</div><div className="text-lg font-bold text-white">{Math.round(selectedStation.humidity)}%</div></div>
                     <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50"><div className="flex items-center text-gray-400 text-xs mb-1 font-medium"><Navigation size={12} className="mr-1.5 text-green-400"/> Gió</div><div className="text-lg font-bold text-white">{selectedStation.windSpeed} <span className="text-xs text-gray-500">m/s</span></div></div>
                 </div>
             ) : (
                 <div className="px-5 pb-5 grid grid-cols-2 gap-3">
                      <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50"><div className="flex items-center text-gray-400 text-xs mb-1"><Thermometer size={12} className="mr-1.5 text-orange-400"/> Nhiệt độ</div><div className="text-lg font-bold text-white">{selectedStation.temperature} <span className="text-xs">°C</span></div></div>
                     <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50"><div className="flex items-center text-gray-400 text-xs mb-1"><Droplets size={12} className="mr-1.5 text-blue-400"/> Độ ẩm</div><div className="text-lg font-bold text-white">{selectedStation.humidity}%</div></div>
                 </div>
             )}
         </div>
      )}

      {/* MAP AREA */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20"><Loader2 className="animate-spin text-blue-500" size={40}/></div>}
      </div>
    </div>
  );
};

export default AirQualityMap;
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Loader2, Wind, CloudRain, Droplets, Map as MapIcon } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

// --- SERVICE THỰC TẾ ---
// GIỮ NGUYÊN DÒNG IMPORT NÀY: Hàm fetchLiveAQI sẽ được lấy từ backend của bạn
import { fetchLiveAQI } from '../services'; 

// --- 1. MOCK DATA cho Mưa (RAIN) ---
// Giữ nguyên phần giả lập dữ liệu Mưa
const fetchWeatherData = async () => {
  return new Promise((resolve) => {
    const data = Array.from({ length: 30 }).map((_, i) => {
        const rainValue = Math.random() > 0.3 ? Math.floor(Math.random() * 80) : 0;
        return {
            id: `rain-${i}`,
            station_name: `Điểm đo mưa ${i}`,
            precipitation: rainValue,
            weatherType: rainValue > 0 ? "Mưa" : "Tạnh",
            location: { coordinates: [105.8 + (Math.random() - 0.5) * 0.2, 21.02 + (Math.random() - 0.5) * 0.2] }
        };
    });
    setTimeout(() => resolve(data), 600);
  });
};

// --- 2. COMPONENT CHÍNH ---
const AirQualityMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]); 
  
  const [viewMode, setViewMode] = useState('AQI'); 
  const [aqiData, setAqiData] = useState([]);
  const [rainData, setRainData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedId, setSelectedId] = useState(null);

  // Load Data: Gọi cả service thật (AQI) và mock (Rain)
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
          // GỌI API AQI THẬT: Giả định fetchLiveAQI trả về format { data: [...] }
          const [aqiRes, weatherRes] = await Promise.all([fetchLiveAQI(), fetchWeatherData()]);
          
          if (aqiRes?.data) setAqiData(aqiRes.data);
          setRainData(weatherRes || []); // Rain vẫn dùng mock
      } catch (e) { 
          console.error("Lỗi khi tải dữ liệu AQI hoặc Mưa:", e); 
          // Thiết lập dữ liệu rỗng nếu lỗi để tránh crash
          setAqiData([]);
          setRainData([]);
      } 
      finally { setIsLoading(false); }
    };
    loadAllData();
  }, []);

  // Khởi tạo Map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright', 
      center: [105.83, 21.02],
      zoom: 11.5,
      pitch: 40,
      antialias: true,
    });
    mapInstanceRef.current = map;

    // Sự kiện: Click vào nền bản đồ để reset (hiện lại tất cả)
    map.on('click', (e) => {
        if (e.originalEvent.target.closest('.custom-marker-container')) return;
        setSelectedId(null);
        map.flyTo({ zoom: 11.5, pitch: 40 });
    });

  }, []);

  // --- 3. RENDER MARKERS (Logic hiển thị Icon) ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    let displayData = [];
    if (viewMode === 'AQI') {
        // Xử lý data từ backend AQI thật
        displayData = aqiData.map(item => ({
            // LƯU Ý: Đảm bảo item.id và item.coordinates tồn tại
            id: item.id || `aqi-${item.station_name}`, 
            coords: [item.coordinates.longitude, item.coordinates.latitude],
            value: item.value,
            unit: 'AQI',
            color: item.value <= 50 ? '#10b981' : item.value <= 100 ? '#eab308' : '#ef4444',
            icon: <Wind size={16} color="white" />,
            label: 'AQI'
        }));
    } else {
        // Xử lý data từ mock Mưa
        displayData = rainData.map(item => ({
            id: item.id,
            coords: item.location.coordinates,
            value: item.precipitation,
            unit: 'mm',
            color: item.precipitation > 0 ? '#3b82f6' : '#9ca3af',
            icon: <Droplets size={16} color="white" />,
            label: 'Mưa'
        }));
    }

    const finalData = selectedId ? displayData.filter(d => d.id === selectedId) : displayData;

    finalData.forEach(item => {
        const el = document.createElement('div');
        el.className = 'custom-marker-container'; 
        el.style.cursor = 'pointer';

        const htmlContent = `
            <div style="
                display: flex; 
                align-items: center; 
                background: white; 
                padding: 4px 8px; 
                border-radius: 20px; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                border: 2px solid ${item.color};
                transform: scale(${selectedId === item.id ? 1.2 : 1}); 
                transition: all 0.2s;
            ">
                <div style="
                    background: ${item.color}; 
                    border-radius: 50%; 
                    width: 24px; 
                    height: 24px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    margin-right: 6px;
                ">
                    ${ReactDOMServer.renderToString(item.icon)}
                </div>
                <div style="display: flex; flex-direction: column; line-height: 1;">
                    <span style="font-weight: bold; font-size: 14px; color: #1f2937;">${item.value}</span>
                    <span style="font-size: 10px; color: #6b7280;">${item.unit}</span>
                </div>
            </div>
            ${selectedId === item.id ? `
                <div style="
                    margin-top: 5px; 
                    background: rgba(31, 41, 55, 0.9); 
                    color: white; 
                    padding: 8px; 
                    border-radius: 8px; 
                    font-size: 12px;
                    text-align: center;
                    backdrop-filter: blur(4px);
                    max-width: 150px;
                ">
                    <div style="font-weight:bold; margin-bottom:2px;">Chi tiết trạm</div>
                    <div>Tình trạng: ${viewMode === 'AQI' ? (item.value > 100 ? 'Ô nhiễm' : 'Tốt') : (item.value > 0 ? 'Đang mưa' : 'Không mưa')}</div>
                </div>
            ` : ''}
        `;
        
        el.innerHTML = htmlContent;

        el.addEventListener('click', (e) => {
            e.stopPropagation(); 
            
            if (selectedId === item.id) {
                setSelectedId(null);
                map.flyTo({ zoom: 11.5, pitch: 40, speed: 1 });
            } else {
                setSelectedId(item.id);
                map.flyTo({ center: item.coords, zoom: 14, pitch: 40, speed: 1.2 });
            }
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat(item.coords)
            .addTo(map);

        markersRef.current.push(marker);
    });

  }, [viewMode, aqiData, rainData, selectedId]); 

  return (
    <div className="h-full w-full flex flex-col relative bg-gray-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      
      {/* HEADER CONTROLS */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 p-4 rounded-2xl shadow-lg w-72">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <MapIcon className="mr-2 text-blue-600" size={20}/> 
                Theo dõi Môi trường
            </h2>
            <p className="text-xs text-gray-500 mt-1">Dữ liệu thời gian thực</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md border border-gray-200 p-1.5 rounded-2xl shadow-lg flex gap-1">
            <button 
                onClick={() => { setViewMode('AQI'); setSelectedId(null); }}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode==='AQI' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <Wind size={16} className="mr-2"/> AQI
            </button>
            <button 
                onClick={() => { setViewMode('RAIN'); setSelectedId(null); }}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode==='RAIN' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <CloudRain size={16} className="mr-2"/> Mưa
            </button>
        </div>
      </div>
    
      {/* INFO BOX: Hướng dẫn người dùng */}
      {selectedId && (
        <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
            Đang xem chi tiết 1 trạm. <br/> Click vào khoảng trống để thoát.
        </div>
      )}

      {/* MAP CONTAINER */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        {isLoading && <div className="absolute inset-0 flex justify-center items-center bg-white/80 z-20"><Loader2 className="animate-spin text-blue-500" size={48}/></div>}
      </div>
    </div>
  );
};

export default AirQualityMap;
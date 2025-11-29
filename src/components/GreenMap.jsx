import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchLiveAQI, fetchTrafficMap, fetchTrafficLive } from '../services'; // Đảm bảo đường dẫn đúng
import { Loader2 } from 'lucide-react';

const GreenMap = ({ onStationSelect }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  const [sensors, setSensors] = useState([]);
  const [trafficStatus, setTrafficStatus] = useState({}); // { "edge_1": "red", ... }
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  // --- 1. LẤY DỮ LIỆU TỪ API ---
  useEffect(() => {
    // A. Lấy AQI (1 lần lúc đầu)
    fetchLiveAQI()
      .then(data => {
        if (data && data.data) setSensors(data.data);
      })
      .finally(() => setIsLoading(false));

    // B. Lấy Traffic Status (Loop mỗi 2 giây)
    const interval = setInterval(() => {
      fetchTrafficLive().then(res => {
        if (res && res.status) {
          // console.log("🚦 Traffic update:", Object.keys(res.status).length, "segments");
          setTrafficStatus(res.status);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // --- 2. KHỞI TẠO BẢN ĐỒ ---
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [105.80, 21.00], // Tọa độ trung tâm khu vực mô phỏng
      zoom: 13,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });
    mapInstanceRef.current = map;

    // Thêm điều khiển zoom/xoay
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', async () => {
      map.resize();

      // [FIX] Xử lý lỗi thiếu icon: Tạo icon trong suốt
      map.on('styleimagemissing', (e) => {
        const id = e.id;
        if (!map.hasImage(id)) {
          const pixel = new Uint8Array(4); // [0,0,0,0] -> Trong suốt
          const imageData = { width: 1, height: 1, data: pixel };
          map.addImage(id, imageData);
        }
      });

      // --- A. LAYER GIAO THÔNG (Traffic) ---
      try {
        const trafficData = await fetchTrafficMap(); // Gọi API /traffic/segments
        
        // Thêm nguồn dữ liệu đường
        map.addSource('traffic-source', {
          type: 'geojson',
          data: trafficData || { type: 'FeatureCollection', features: [] },
          promoteId: 'id' // <--- QUAN TRỌNG: Ép kiểu ID thành chuỗi để khớp với API Live
        });

        // Vẽ các đoạn đường
        map.addLayer({
          id: 'traffic-lines',
          type: 'line',
          source: 'traffic-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-width': 4,
            // Logic tô màu dựa trên Feature State
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'isRed'], false], '#ef4444',   // Đỏ (Tắc)
              ['boolean', ['feature-state', 'isOrange'], false], '#f97316', // Cam (Đông)
              '#22c55e' // Xanh (Thông thoáng - Mặc định)
            ],
            'line-opacity': 0.8
          }
        });
      } catch (error) {
        console.error("Lỗi tải bản đồ giao thông:", error);
      }

      // --- B. LAYER AQI (Points) ---
      if (!map.getSource('aqi-sensors')) {
        map.addSource('aqi-sensors', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      }

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
              '#9ca3af', 0,      // Xám (No Data)
              '#10b981', 50,     // Xanh (Tốt)
              '#eab308', 100,    // Vàng (TB)
              '#f97316', 150,    // Cam (Kém)
              '#ef4444', 300,    // Đỏ (Xấu)
              '#7e0023'          // Tím (Nguy hại)
            ]
          }
        });
      }

      // Sự kiện Click vào điểm AQI
      map.on('click', 'aqi-points', (e) => {
        if (onStationSelect && e.features.length > 0) {
          const props = e.features[0].properties;
          const coords = e.features[0].geometry.coordinates;
          onStationSelect({
            ...props,
            coordinates: { longitude: coords[0], latitude: coords[1] }
          });
        }
      });

      // Hiệu ứng con trỏ chuột
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
            id: s.sensor_id,
            name: s.station_name,
            value: Math.round(Number(s.value) || 0),
            unit: s.unit,
            provider: s.provider_name,
            status: 'Online'
          }
        }))
      };
      
      map.getSource('aqi-sensors').setData(geojsonData);
    }
  }, [sensors, isMapReady]);

  // --- 4. CẬP NHẬT TRẠNG THÁI GIAO THÔNG (Logic Retry) ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isMapReady || !map) return;

    // Hàm đệ quy thử lại nếu map chưa load xong source
    const applyColors = (retryCount = 0) => {
        // Kiểm tra Source tồn tại
        if (!map.getSource('traffic-source')) {
            if (retryCount < 20) setTimeout(() => applyColors(retryCount + 1), 500);
            return;
        }

        // Kiểm tra Source đã load xong data chưa (Quan trọng với file lớn)
        if (!map.isSourceLoaded('traffic-source')) {
            if (retryCount < 40) { // Thử lại trong 20s
                // console.log(`⏳ Đợi map index... (${retryCount})`);
                setTimeout(() => applyColors(retryCount + 1), 500);
            }
            return;
        }

        // Bắt đầu tô màu
        if (!trafficStatus || typeof trafficStatus !== 'object') return;
        const segmentIds = Object.keys(trafficStatus);
        if (segmentIds.length === 0) return;

        // Dùng requestAnimationFrame để mượt UI
        requestAnimationFrame(() => {
            segmentIds.forEach((rawId) => {
                const segmentId = String(rawId); // Ép kiểu String
                const color = trafficStatus[rawId];
                if (!color) return;

                try {
                    // Xóa trạng thái cũ
                    map.removeFeatureState({ source: 'traffic-source', id: segmentId });

                    // Set trạng thái mới
                    if (color === 'red') {
                        map.setFeatureState({ source: 'traffic-source', id: segmentId }, { isRed: true });
                    } else if (color === 'orange') {
                        map.setFeatureState({ source: 'traffic-source', id: segmentId }, { isOrange: true });
                    }
                } catch (e) {
                    // Bỏ qua lỗi nếu ID không tìm thấy
                }
            });
            // Ép vẽ lại
            map.triggerRepaint();
        });
    };

    applyColors();

  }, [trafficStatus, isMapReady]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-900">
      <div ref={mapContainerRef} className="absolute top-0 left-0 w-full h-full" />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur text-emerald-400 px-3 py-1.5 rounded-lg shadow-lg flex items-center text-xs font-bold">
          <Loader2 className="animate-spin mr-2" size={14}/> ĐANG TẢI DỮ LIỆU...
        </div>
      )}

      {/* Legend (Chú giải) */}
      <div className="absolute bottom-5 left-5 z-10 bg-white/90 p-3 rounded shadow text-xs text-gray-800">
        <div className="font-bold mb-2">Trạng thái giao thông</div>
        <div className="flex items-center mb-1"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span> Thông thoáng</div>
        <div className="flex items-center mb-1"><span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span> Đông chậm</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span> Tắc đường</div>
      </div>
    </div>
  );
};

export default GreenMap;
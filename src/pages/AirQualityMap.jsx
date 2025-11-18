import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchLiveAQI } from '../apiService'; 
import { Loader2, AlertTriangle } from 'lucide-react';

// --- Helper: Hàm tạo hình tròn (ĐÃ BỊ XÓA) ---
// (Chúng ta sẽ không dùng Polygon nữa mà quay lại Heatmap)

const AirQualityMap = () => {
  const mapContainerRef = useRef(null);
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gọi API khi component mount
  useEffect(() => {
    const loadAqiData = async () => {
      setIsLoading(true);
      setError(null);
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

  // Render bản đồ (chạy sau khi data đã được fetch)
  useEffect(() => {
    if (!mapContainerRef.current || isLoading) return; 

    const bounds = new maplibregl.LngLatBounds();
    let hasValidSensors = false;
    if (sensors.length > 0) {
        sensors.forEach((sensor) => {
          if (sensor.coordinates && sensor.coordinates.longitude && sensor.coordinates.latitude) {
            bounds.extend([sensor.coordinates.longitude, sensor.coordinates.latitude]);
            hasValidSensors = true;
          }
        });
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright', // Giữ nguyên style 3D
      center: hasValidSensors ? bounds.getCenter() : [105.82, 21.03],
      zoom: 12,
      pitch: 45,
      bearing: -10,
      antialias: true,
    });

    map.on('load', () => {
      // (Code 3D Extrusion giữ nguyên)
      const layers = map.getStyle().layers || [];
      const labelLayer = layers.find((l) => l.type === 'symbol' && l.layout && l.layout['text-field']);
      const labelLayerId = labelLayer?.id;
      if (!map.getSource('openfreemap')) map.addSource('openfreemap', { url: 'https://tiles.openfreemap.org/planet', type: 'vector' });
      if (!map.getLayer('3d-buildings')) {
        const extrusionHeight = ['coalesce', ['get', 'render_height'], ['get', 'height'], ['*', ['coalesce', ['get', 'building:levels'], ['get', 'levels'], 0], 3]];
        const extrusionMinHeight = ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], ['*', ['coalesce', ['get', 'min_level'], 0], 3], 0];
        map.addLayer({
            id: '3d-buildings', source: 'openfreemap', 'source-layer': 'building', type: 'fill-extrusion', minzoom: 13, filter: ['!=', ['get', 'hide_3d'], true],
            paint: { 'fill-extrusion-color': ['interpolate', ['linear'], extrusionHeight, 0, 'lightgray', 200, '#94a3b8', 400, '#64748b'], 'fill-extrusion-height': ['case', ['>=', ['zoom'], 13], extrusionHeight, 0], 'fill-extrusion-base': ['case', ['>=', ['zoom'], 13], extrusionMinHeight, 0], 'fill-extrusion-opacity': 0.7 }
        }, labelLayerId);
      }

      // --- 5. LOGIC MỚI: Dữ liệu GeoJSON dạng ĐIỂM (Point) ---
      const aqiPoints = sensors.map(sensor => {
        if (!sensor.coordinates || sensor.value === null || sensor.value === undefined) return null;
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [sensor.coordinates.longitude, sensor.coordinates.latitude]
          },
          properties: {
            value: sensor.value, // Giá trị PM2.5
            name: sensor.station_name
          }
        }
      }).filter(Boolean); // Lọc bỏ các trạm null

      map.addSource('aqi-heatmap-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: aqiPoints },
      });

      // --- 6. LOGIC MỚI: Thêm lớp HEATMAP (Đã fix lỗi zoom) ---
      map.addLayer({
        id: 'aqi-heatmap',
        type: 'heatmap',
        source: 'aqi-heatmap-source',
        minzoom: 9,
        paint: {
          // Gán 'sức nặng' (weight) cho mỗi điểm dựa trên giá trị PM2.5
          'heatmap-weight': [
            'interpolate', ['linear'], ['get', 'value'],
            0, 0.1,    // PM2.5 = 0, weight = 0.1
            35.4, 0.5,  // PM2.5 = 35.4, weight = 0.5 (Ngưỡng)
            150, 1    // PM2.5 = 150, weight = 1 (Rất nặng)
          ],
          
          // Cường độ của heatmap
          'heatmap-intensity': [
            'interpolate', ['linear'], ['zoom'],
            9, 1,
            15, 3
          ],

          // --- FIX LỖI ZOOM: Bán kính (radius) tăng theo zoom ---
          // Bán kính giờ sẽ tăng theo cấp số nhân 1.75
          // Giúp vùng heatmap (km) trông ổn định hơn khi zoom
          'heatmap-radius': [
            'interpolate', 
            ['exponential', 1.75], // Dùng cấp số nhân
            ['zoom'],
            9, 20,  // Ở zoom 9, bán kính là 20px
            15, 200 // Ở zoom 15, bán kính là 200px
          ],

          // Độ trong suốt
          'heatmap-opacity': 0.7,

          // --- PHẦN QUAN TRỌNG: TÔ MÀU 2 VÙNG ---
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'], // Dùng "mật độ" nhiệt
            0, 'rgba(0,0,0,0)',       // Không có nhiệt -> Trong suốt
            0.2, 'rgba(34, 197, 94, 0.5)', // Mật độ thấp -> XANH
            0.7, 'rgba(239, 68, 68, 0.7)'  // Mật độ cao -> ĐỎ
          ]
        }
      }, labelLayerId); // Đặt heatmap bên dưới tên đường và tòa nhà

      // --- 7. LOGIC MỚI: Thêm lớp ĐIỂM (POINT) ---
      // (Để người dùng biết chính xác trạm đo ở đâu khi zoom gần)
      map.addLayer({
        id: 'aqi-points',
        type: 'circle',
        source: 'aqi-heatmap-source',
        minzoom: 12, // Chỉ hiện khi zoom gần
        paint: {
          'circle-radius': 5,
          'circle-color': [ // Tô màu điểm theo 2 màu Xanh/Đỏ
            'step',
            ['get', 'value'],
            '#15803d', // Tốt (Xanh đậm)
            35.4,
            '#b91c1c'  // Có hại (Đỏ đậm)
          ],
          'circle-stroke-color': 'white',
          'circle-stroke-width': 2,
        }
      });
      
      map.resize();
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
    };
  }, [isLoading, sensors]);

  return (
    <div className="h-full w-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-green-300">Bản đồ Phân vùng Chất lượng Không khí</h2>
         <div className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-600">
            Cập nhật: {isLoading ? "Đang tải..." : "Vừa xong (Cache 5p)"}
         </div>
      </div>
      
      <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-700 shadow-lg">
        {/* Container bản đồ */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        
        {/* Trạng thái Loading */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-900/50 backdrop-blur-sm z-20">
              <Loader2 size={40} className="animate-spin text-green-400" />
              <span className="mt-3 text-white font-semibold">Đang tải dữ liệu Vùng...</span>
          </div>
        )}

        {/* Trạng thái Lỗi */}
        {error && !isLoading && (
          <div className="absolute top-4 left-4 z-10 bg-red-800/90 text-white p-3 rounded-lg shadow-lg flex items-center border border-red-500">
            <AlertTriangle className="mr-3" />
            Lỗi tải dữ liệu: {error}
          </div>
        )}

        {/* --- CẬP NHẬT CHÚ GIẢI (LEGEND) --- */}
        <div className="absolute top-4 left-4 bg-white/95 p-4 rounded-lg shadow-xl text-gray-800 z-10 border border-gray-200">
          <h4 className="font-bold mb-3 text-sm uppercase tracking-wider border-b pb-2">Chú giải Heatmap</h4>
          <div className="flex items-center mb-2">
            <div className="w-5 h-5 rounded-full bg-green-500/30 border-2 border-green-700 mr-3"></div>
            <span className="text-sm font-medium">Vùng Xanh (Không khí tốt)</span>
          </div>
          <div className="flex items-center mb-3">
            <div className="w-5 h-5 rounded-full bg-red-500/30 border-2 border-red-700 mr-3"></div>
            <span className="text-sm font-medium">Vùng Đỏ (Không khí có hại)</span>
          </div>
           <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-500 mr-3.5"></div>
            <span className="text-sm font-medium">(Zoom gần để thấy trạm đo)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQualityMap;
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mapSensorData } from '../data/mockData';

const GreenMap = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 2. Tính toán giới hạn (Bounds) để bản đồ bao trọn tất cả marker
    const bounds = new maplibregl.LngLatBounds();
    
    // Kiểm tra dữ liệu trước khi chạy vòng lặp
    if (mapSensorData && mapSensorData.length > 0) {
        mapSensorData.forEach((sensor) => {
            bounds.extend([sensor.lng, sensor.lat]);
        });
    }

    // 3. Khởi tạo bản đồ
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      // Dùng style vector bright của OpenFreeMap để có map đẹp hơn
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [105.83, 21.02], // Tâm mặc định tại Hà Nội
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      antialias: true, // làm mịn cạnh khi dựng khối 3D
    });

    // 4. Khi bản đồ load xong, tự động zoom và resize
    map.on('load', () => {
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 16,
        });

        // Giữ mức zoom tối thiểu để thấy rõ extrusions
        map.once('idle', () => {
          if (map.getZoom() < 15) {
            map.easeTo({ zoom: 15, duration: 800 });
          }
        });
      }
      
      // Lệnh này giúp bản đồ nhận diện đúng kích thước khung chứa
      map.resize();

      // Thêm dữ liệu tòa nhà và dựng extrusions
      const layers = map.getStyle().layers || [];
      const labelLayer = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
      );
      const labelLayerId = labelLayer?.id;

      if (!map.getSource('openfreemap')) {
        map.addSource('openfreemap', {
          url: 'https://tiles.openfreemap.org/planet',
          type: 'vector',
        });
      }

      if (!map.getLayer('3d-buildings')) {
        const extrusionHeight = [
          'coalesce',
          ['get', 'render_height'],
          ['get', 'height'],
          ['*', ['coalesce', ['get', 'building:levels'], ['get', 'levels'], 0], 3],
        ];
        const extrusionMinHeight = [
          'coalesce',
          ['get', 'render_min_height'],
          ['get', 'min_height'],
          ['*', ['coalesce', ['get', 'min_level'], 0], 3],
          0,
        ];

        map.addLayer(
          {
            id: '3d-buildings',
            source: 'openfreemap',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 15,
            filter: ['!=', ['get', 'hide_3d'], true],
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                extrusionHeight,
                0,
                'lightgray',
                200,
                'royalblue',
                400,
                'lightblue',
              ],
              'fill-extrusion-height': [
                'case',
                ['>=', ['zoom'], 15],
                extrusionHeight,
                0,
              ],
              'fill-extrusion-base': [
                'case',
                ['>=', ['zoom'], 15],
                extrusionMinHeight,
                0,
              ],
            },
          },
          labelLayerId
        );
      }
    });

    // 5. Loop qua dữ liệu để vẽ các Marker
    if (mapSensorData) {
        mapSensorData.forEach((sensor) => {
            // Tạo phần tử DOM tùy chỉnh cho marker
            const el = document.createElement('div');
            el.className = 'marker';
            // Logic màu sắc: Có chữ AQI thì màu đỏ, còn lại màu xanh
            el.style.backgroundColor = sensor.type.includes('AQI') ? '#ef4444' : '#3b82f6'; 
            el.style.width = '16px';
            el.style.height = '16px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            el.style.cursor = 'pointer';

            // Tạo Popup thông tin khi click vào marker
            const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
                `<div style="color: #333; font-family: sans-serif;">
                <strong style="font-size: 14px;">${sensor.name}</strong>
                <div style="font-size: 12px; margin-top: 4px;">ID: <b>${sensor.id}</b></div>
                <div style="font-size: 12px; color: #666;">${sensor.type}</div>
                </div>`
            );

            // Gắn marker vào bản đồ
            new maplibregl.Marker({ element: el })
                .setLngLat([sensor.lng, sensor.lat])
                .setPopup(popup)
                .addTo(map);
        });
    }

    // Thêm nút điều hướng Zoom (+/-)
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // 6. Xử lý sự kiện resize cửa sổ để bản đồ không bị méo
    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);

    // Cleanup khi component bị hủy (unmount)
    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-200">
      {/* Container chứa bản đồ */}
      <div ref={mapContainerRef} className="absolute top-0 left-0 w-full h-full" />
      
      {/* Chú thích (Legend) nằm góc dưới trái */}
      <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-md text-xs text-gray-800 z-10 border border-gray-200 backdrop-blur-sm">
        <div className="font-bold mb-2 text-gray-600 uppercase tracking-wider" style={{fontSize: '10px'}}>Ghi chú</div>
        <div className="flex items-center mb-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 mr-2 border border-white shadow-sm"></span>
          <span>Cảm biến AQI</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-blue-500 mr-2 border border-white shadow-sm"></span>
          <span>Cảm biến Tiếng ồn</span>
        </div>
      </div>
    </div>
  );
};

export default GreenMap;

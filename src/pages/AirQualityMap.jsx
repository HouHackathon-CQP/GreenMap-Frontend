import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { airQualityZones, mapSensorData } from '../data/mockData';

// --- Helper: Hàm tạo hình tròn từ tâm và bán kính ---
const createGeoJSONCircle = (center, radiusInKm, points = 64) => {
  const coords = {
    latitude: center[1],
    longitude: center[0]
  };

  const km = radiusInKm;
  const ret = [];
  const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  let theta, x, y;
  for (let i = 0; i < points; i++) {
    theta = (i / points) * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);

    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [ret]
    }
  };
};

const AirQualityMap = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [105.82, 21.03],
      zoom: 13.5,
      pitch: 45,
      bearing: -10,
      antialias: true,
    });

    map.on('load', () => {
      // --- Từ GreenMap ---
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
            minzoom: 13, 
            filter: ['!=', ['get', 'hide_3d'], true],
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                extrusionHeight,
                0, 'lightgray',
                200, '#94a3b8', // Slate-400
                400, '#64748b', // Slate-500
              ],
              'fill-extrusion-height': [
                'case',
                ['>=', ['zoom'], 13],
                extrusionHeight,
                0,
              ],
              'fill-extrusion-base': [
                'case',
                ['>=', ['zoom'], 13],
                extrusionMinHeight,
                0,
              ],
              'fill-extrusion-opacity': 0.7,
            },
          },
          labelLayerId
        );
      }

      // --- ZONES ---
      const circularFeatures = airQualityZones.features.map(feature => {
        if (feature.properties.radiusKm) {
          const circle = createGeoJSONCircle(
            feature.geometry.coordinates, 
            feature.properties.radiusKm
          );
          circle.properties = feature.properties;
          return circle;
        }
        return feature;
      });

      map.addSource('zones', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: circularFeatures },
      });

      // Lớp màu nền vùng
      map.addLayer({
        id: 'zones-fill',
        type: 'fill',
        source: 'zones',
        before: '3d-buildings', // Đặt dưới lớp tòa nhà
        layout: {},
        paint: {
          'fill-color': [
            'match', ['get', 'status'],
            'good', '#22c55e',
            'bad', '#ef4444',
            '#cccccc'
          ],
          'fill-opacity': 0.3,
        },
      });

      // Lớp đường viền vùng
      map.addLayer({
        id: 'zones-outline',
        type: 'line',
        source: 'zones',
        layout: {},
        paint: {
          'line-color': [
            'match', ['get', 'status'],
            'good', '#15803d',
            'bad', '#b91c1c',
            '#666'
          ],
          'line-width': 2,
          'line-dasharray': [2, 2]
        },
      });

      // Lớp nhãn tên vùng
      map.addLayer({
        id: 'zones-labels',
        type: 'symbol',
        source: 'zones',
        layout: {
          'text-field': ['get', 'name'],
          'text-variable-anchor': ['center'],
          'text-justify': 'auto',
          'text-size': 12,
          'text-font': ['Noto Sans Bold'],
          'text-offset': [0, -2],
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': '#fff',
          'text-halo-width': 2,
        },
      });
      
      // --- HIỂN THỊ CÁC TRẠM CẢM BIẾN ---
      if (mapSensorData) {
        mapSensorData.forEach((sensor) => {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundColor = sensor.type.includes('AQI') ? '#ef4444' : '#3b82f6'; 
            el.style.width = '12px';
            el.style.height = '12px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            el.style.cursor = 'pointer';

            const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
                `<div style="color: #333; font-family: sans-serif;">
                <strong style="font-size: 12px;">${sensor.name}</strong>
                <div style="font-size: 10px;">${sensor.type}</div>
                </div>`
            );

            new maplibregl.Marker({ element: el })
                .setLngLat([sensor.lng, sensor.lat])
                .setPopup(popup)
                .addTo(map);
        });
      }

      map.resize();
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-green-300">Bản đồ Phân vùng Chất lượng Không khí</h2>
         <div className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-600">
            Cập nhật: Vừa xong
         </div>
      </div>
      
      <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-700 shadow-lg">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        
        {/* Chú thích nổi */}
        <div className="absolute top-4 left-4 bg-white/95 p-4 rounded-lg shadow-xl text-gray-800 z-10 border border-gray-200">
          <h4 className="font-bold mb-3 text-sm uppercase tracking-wider border-b pb-2">Chú giải</h4>
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-700 mr-3"></div>
            <span className="text-sm font-medium">Vùng Xanh (Sạch)</span>
          </div>
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 rounded-full bg-red-500/20 border-2 border-red-700 mr-3"></div>
            <span className="text-sm font-medium">Vùng Đỏ (Ô nhiễm)</span>
          </div>
          <div className="text-xs text-gray-500 italic border-t pt-2">
             * Các chấm nhỏ là vị trí trạm đo thực tế
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQualityMap;
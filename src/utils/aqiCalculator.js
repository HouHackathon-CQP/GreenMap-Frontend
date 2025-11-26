// src/utils/aqiCalculator.js

export const pm25ToAQI = (pm25) => {
    if (pm25 === null || pm25 === undefined) return null;
    const c = parseFloat(pm25);
    const breakpoints = [
        { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
        { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
        { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
        { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
        { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
        { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
        { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 }
    ];
    const bp = breakpoints.find(b => c >= b.cLow && c <= b.cHigh);
    if (!bp) return 500;
    const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.iLow;
    return Math.round(aqi);
};

// Hàm lấy màu cho giao diện cũ
export const getAQIInfo = (aqi) => {
    if (!aqi) return { color: '#9ca3af', level: 'N/A', text: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30' };
    if (aqi <= 50) return { color: '#10b981', level: 'Tốt', text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' };
    if (aqi <= 100) return { color: '#eab308', level: 'Trung bình', text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
    if (aqi <= 150) return { color: '#f97316', level: 'Kém', text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' };
    if (aqi <= 200) return { color: '#ef4444', level: 'Xấu', text: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30' };
    if (aqi <= 300) return { color: '#a855f7', level: 'Rất xấu', text: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' };
    return { color: '#7f1d1d', level: 'Nguy hại', text: 'text-rose-500', bg: 'bg-rose-900/20', border: 'border-rose-900/30' };
};
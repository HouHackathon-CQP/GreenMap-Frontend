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

export const pm25ToAQI_VN = (pm25) => {
    if (pm25 === null || pm25 === undefined) return null;
    const c = parseFloat(pm25);

    const breakpoints = [
        { cLow: 0,   cHigh: 25,   iLow: 0,   iHigh: 50 },
        { cLow: 25,  cHigh: 50,   iLow: 51,  iHigh: 100 },
        { cLow: 50,  cHigh: 80,   iLow: 101, iHigh: 150 },
        { cLow: 80,  cHigh: 150,  iLow: 151, iHigh: 200 },
        { cLow: 150, cHigh: 250,  iLow: 201, iHigh: 300 },
        { cLow: 250, cHigh: 350,  iLow: 301, iHigh: 400 },
        { cLow: 350, cHigh: 500,  iLow: 401, iHigh: 500 }
    ];

    const bp = breakpoints.find(b => c >= b.cLow && c <= b.cHigh);
    if (!bp) return 500;

    const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.iLow;

    return Math.round(aqi);
};


// Alias giữ tương thích với các chỗ đang dùng tên cũF
export const pm25ToAQI = pm25ToAQI_VN;


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

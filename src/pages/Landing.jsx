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

import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Map, Megaphone, Database, Rocket, ArrowRight, Cloud, Users, Cog } from 'lucide-react';

const features = [
  {
    title: 'Dashboard Tổng quan',
    icon: Activity,
    desc: 'Theo dõi KPI thời gian thực, trạng thái trạm và dự báo thời tiết 24h giúp nắm nhịp đập của thành phố chỉ trong một màn hình.',
    points: ['KPIs live: trạm Online/Offline, AQI trung bình', 'Bản đồ 3D tương tác + định vị GPS', 'Widget thời tiết & biểu đồ dự báo 24h'],
  },
  {
    title: 'Bản đồ Giám sát Đa lớp',
    icon: Map,
    desc: 'Phân tích không gian mạnh mẽ với lớp AQI, thời tiết, giao thông và sidebar chi tiết từng trạm.',
    points: ['Chuyển đổi lớp AQI / Thời tiết / Giao thông', 'Định vị tự động với độ chính xác cao', 'Bảng thông tin chi tiết khi chọn marker'],
  },
  {
    title: 'Báo cáo Cộng đồng',
    icon: Megaphone,
    desc: 'Kênh kết nối người dân và quản trị, quy trình duyệt - từ chối rõ ràng, hỗ trợ ảnh hiện trường.',
    points: ['Thẻ trạng thái: Chờ xử lý, Đã duyệt, Từ chối', 'Duyệt nhanh trong một cú click', 'Đính kèm hình ảnh minh chứng'],
  },
  {
    title: 'Quản lý Dữ liệu Hạ tầng',
    icon: Database,
    desc: 'Kho dữ liệu tập trung cho công viên, trạm sạc, xe đạp, điểm du lịch; đồng bộ sang bản đồ người dùng.',
    points: ['CRUD đầy đủ cho từng loại địa điểm', 'Đồng bộ dữ liệu xuyên hệ thống', 'Tối ưu tìm kiếm và quản trị'],
  },
];

const techStack = [
  { label: 'React 18 + Vite', desc: 'Tốc độ khởi động & HMR siêu nhanh.' },
  { label: 'Tailwind CSS', desc: 'UI thống nhất, build giao diện nhanh.' },
  { label: 'MapLibre GL JS', desc: 'Render bản đồ vector mượt mà, hỗ trợ 3D.' },
  { label: 'Recharts', desc: 'Biểu đồ đẹp, responsive, dễ tùy biến.' },
  { label: 'Lucide Icons', desc: 'Bộ icon hiện đại, nhẹ và đồng bộ.' },
  { label: 'Custom API Client', desc: 'Fetch + Token handling, cache thông minh.' },
];

const setupSteps = [
  { title: 'Clone dự án', code: 'git clone https://github.com/HouHackathon-CQP/GreenMap-Frontend.git' },
  { title: 'Cài đặt phụ thuộc', code: 'cd GreenMap-Frontend && npm install' },
  { title: 'Cấu hình .env', code: 'VITE_API_BASE_URL=https://your-backend-api' },
  { title: 'Chạy dev server', code: 'npm run dev' },
];

const team = [
  { name: 'Trần Anh Quân', role: 'Team Lead', avatar: 'https://avatars.githubusercontent.com/u/125746822?v=4' },
  { name: 'Trần Trọng Chiến', role: 'Fullstack Engineer', avatar: 'https://avatars.githubusercontent.com/u/168514215?v=4' },
  { name: 'Nguyễn Hà Phương', role: 'Product & Data', avatar: 'https://avatars.githubusercontent.com/u/100331812?v=4' },
];

const GithubMark = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-4 h-4"
    aria-hidden="true"
    focusable="false"
    fill="currentColor"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.744.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.775.418-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.469-2.382 1.236-3.222-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.018.005 2.044.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.912 1.235 3.222 0 4.61-2.807 5.625-5.48 5.922.43.37.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-10 -top-10 h-72 w-72 bg-emerald-500/20 blur-3xl rounded-full" />
        <div className="absolute right-0 top-40 h-80 w-80 bg-teal-500/10 blur-3xl rounded-full" />
        <div className="absolute left-1/3 bottom-0 h-64 w-64 bg-emerald-600/10 blur-3xl rounded-full" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur bg-black/40 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.25)]">
              <img src="/images/logo.png" alt="GreenMap Logo" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">GreenMap</p>
              <p className="font-semibold text-gray-100">Admin Portal</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <a href="#intro" className="hover:text-emerald-300 transition-colors">Giới thiệu</a>
            <a href="#features" className="hover:text-emerald-300 transition-colors">Tính năng</a>
            <a href="#tech" className="hover:text-emerald-300 transition-colors">Công nghệ</a>
            <a href="#app" className="hover:text-emerald-300 transition-colors">Ứng dụng di động</a>
            <a href="#setup" className="hover:text-emerald-300 transition-colors">Cài đặt</a>
            <a href="#team" className="hover:text-emerald-300 transition-colors">Đội ngũ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/HouHackathon-CQP"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-100 hover:border-emerald-400/50 hover:text-emerald-200 transition-colors font-semibold text-sm"
              aria-label="GreenMap GitHub"
            >
              <GithubMark />
              GitHub
            </a>
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 border border-white/10 hover:border-emerald-400/50 hover:text-emerald-200 transition-all"
            >
              Đăng nhập
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-900 shadow-lg shadow-emerald-900/30"
            >
              Vào hệ thống <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section id="intro" className="max-w-6xl mx-auto px-4 pt-16 pb-12 lg:pt-20 lg:pb-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-[0.2em] text-emerald-200">
              <Rocket size={14} />
              Hệ thống Quản trị & Giám sát Môi trường Đô thị
            </div>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight text-white">
              Green Map Admin Portal
              <span className="block text-emerald-300 text-2xl sm:text-3xl mt-2">Nơi công nghệ gặp gỡ thiên nhiên vì một Hà Nội xanh hơn.</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl">
              Bộ não trung tâm của dự án Bản Đồ Xanh. Kết nối dữ liệu từ cảm biến IoT, báo cáo cộng đồng và API thời tiết để đưa ra cảnh báo sớm và hỗ trợ ra quyết định quy hoạch đô thị.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-900 font-semibold shadow-lg shadow-emerald-900/30 hover:from-emerald-400 hover:to-teal-400 transition-all"
              >
                Đăng nhập quản trị
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-5 py-3 rounded-2xl border border-white/10 bg-white/5 text-white font-semibold hover:border-emerald-400/60 hover:text-emerald-200 transition-all"
              >
                Xem tính năng
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl">
              {[
                { title: 'Realtime KPIs', desc: 'Theo dõi trạm & AQI tức thì' },
                { title: 'Bản đồ 3D', desc: 'MapLibre GL với định vị GPS' },
                { title: 'Cộng đồng', desc: 'Quy trình duyệt báo cáo minh bạch' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-gray-900/60 border border-white/5 p-3">
                  <p className="text-xs text-emerald-300 uppercase tracking-widest">{item.title}</p>
                  <p className="text-sm text-gray-300 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-500/20 via-teal-400/10 to-transparent blur-2xl rounded-3xl" />
            <div className="relative bg-gray-900/70 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 shadow-[0_0_35px_rgba(16,185,129,0.35)] flex items-center justify-center">
                  <img src="/images/logo.png" alt="GreenMap Logo" className="w-16 h-16 object-contain drop-shadow-[0_10px_35px_rgba(16,185,129,0.55)]" />
                </div>
                <div>
                  <p className="text-sm text-emerald-200 uppercase tracking-[0.2em]">Logo Spotlight</p>
                  <h3 className="text-2xl font-bold text-white">Green Map</h3>
                  <p className="text-sm text-gray-300">Bản sắc xanh - trung tâm mọi trải nghiệm.</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl bg-gray-800/60 border border-white/5 p-4">
                  <p className="text-xs text-gray-400 uppercase">Dữ liệu trạm</p>
                  <p className="text-xl font-bold text-white">+120</p>
                  <p className="text-xs text-emerald-300 mt-1">Online realtime</p>
                </div>
                <div className="rounded-2xl bg-gray-800/60 border border-white/5 p-4">
                  <p className="text-xs text-gray-400 uppercase">Báo cáo</p>
                  <p className="text-xl font-bold text-white">Cộng đồng</p>
                  <p className="text-xs text-emerald-300 mt-1">Duyệt nhanh</p>
                </div>
                <div className="rounded-2xl bg-gray-800/60 border border-white/5 p-4">
                  <p className="text-xs text-gray-400 uppercase">Quy hoạch</p>
                  <p className="text-xl font-bold text-white">Đa lớp</p>
                  <p className="text-xs text-emerald-300 mt-1">AQI / Thời tiết / Giao thông</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {['/images/image-1.png', '/images/image-2.png', '/images/image-3.png'].map((src) => (
                  <div key={src} className="overflow-hidden rounded-2xl border border-white/5 bg-gray-800/40">
                    <img src={src} alt="Giao diện GreenMap" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto px-4 py-12 lg:py-16 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Tính năng nổi bật</p>
              <h2 className="text-3xl font-black text-white mt-2">Phân hệ mạnh mẽ cho từng nhu cầu</h2>
              <p className="text-gray-300 mt-2 max-w-3xl">Hệ thống được chia thành các phân hệ chuyên sâu, tối ưu cho quản lý môi trường đô thị thông minh.</p>
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-emerald-200">
              <Cloud size={16} /> Real-time + Dữ liệu đa nguồn
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map(({ title, icon: Icon, desc, points }) => (
              <div key={title} className="group rounded-2xl bg-gray-900/60 border border-white/5 p-6 hover:border-emerald-400/40 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-200">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                </div>
                <p className="text-gray-300 mt-3">{desc}</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-300">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="app" className="max-w-6xl mx-auto px-4 py-12 lg:py-16 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/15 via-teal-400/10 to-transparent blur-2xl rounded-3xl" />
            <div className="relative bg-gray-900/70 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-[0.2em] text-emerald-200">
                Ứng dụng di động
              </div>
              <h2 className="text-3xl font-black text-white leading-tight">Green Map cho cư dân</h2>
              <p className="text-gray-300 text-lg">
                Trải nghiệm đầy đủ trên smartphone: xem bản đồ, lớp thời tiết, AQI, giao thông, AI cảnh báo sớm và tin tức xanh cập nhật liên tục.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Bản đồ lớp AQI / thời tiết / khói bụi / tắc đường',
                  'AI cảnh báo thời tiết & thông báo nguy cơ',
                  'Tin tức xanh, hoạt động cộng đồng theo khu vực',
                  'Định vị, tìm điểm công viên, trạm sạc, xe đạp',
                  'Nhận báo cáo và phản hồi nhanh từ người dân',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-2xl bg-gray-800/60 border border-white/5 p-3 text-sm text-gray-300">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href=""
                  className="inline-flex items-center px-5 py-3 rounded-2xl bg-black text-white font-semibold border border-white/10 hover:border-emerald-300/50 transition-colors"
                >
                  Tải trên App Store (Coming soon)
                </a>
                <a
                  href="https://github.com/HouHackathon-CQP/GreenMap-Mobile-App/releases/download/1.2.0/GreenMap.apk"
                  className="inline-flex items-center px-5 py-3 rounded-2xl bg-white text-black font-semibold border border-black hover:bg-emerald-50 transition-colors"
                >
                  Tải APK cho Android
                </a>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-48 w-48 bg-emerald-500/10 blur-3xl rounded-full" />
            <div className="relative rounded-3xl bg-gray-900/70 border border-white/10 p-6 shadow-2xl">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Trải nghiệm người dùng</p>
              <h3 className="text-2xl font-bold text-white mt-2">Thiết kế mobile-first</h3>
              <p className="text-gray-300 mt-2">Tối ưu cho thao tác một tay, giao diện tối đỡ chói mắt, widget thời tiết & chỉ số AQI nổi bật.</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {['/images/image-1.png', '/images/image-2.png'].map((src) => (
                  <div key={src} className="rounded-2xl overflow-hidden border border-white/5 bg-gray-800/50">
                    <img src={src} alt="Ứng dụng GreenMap" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Widget thời tiết, nhiệt độ, mưa; biểu đồ nhỏ gọn.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Thông báo đẩy: cảnh báo ô nhiễm, thời tiết cực đoan.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Tin tức xanh, sự kiện môi trường tại địa phương.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tech" className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
          <div className="rounded-3xl bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-900/80 border border-white/10 p-8 lg:p-10 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Công nghệ sử dụng</p>
                <h2 className="text-3xl font-black text-white mt-2">Stack hiện đại tối ưu hiệu năng</h2>
                <p className="text-gray-300 mt-2">Kết hợp React + Vite, MapLibre GL, Tailwind và hệ sinh thái biểu đồ để đem lại DX tốt và trải nghiệm mượt.</p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-emerald-200">
                <Cog size={16} /> DX nhanh - Build mượt
              </div>
            </div>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {techStack.map((item) => (
                <div key={item.label} className="rounded-2xl bg-gray-800/60 border border-white/5 p-4 hover:border-emerald-300/40 transition-colors">
                  <p className="text-emerald-200 font-semibold">{item.label}</p>
                  <p className="text-sm text-gray-300 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="setup" className="max-w-6xl mx-auto px-4 py-12 lg:py-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Cài đặt & chạy</p>
            <h2 className="text-3xl font-black text-white mt-2">4 bước khởi động dự án</h2>
            <p className="text-gray-300 mt-2 max-w-2xl">Yêu cầu Node.js v18+. Sao chép mã nguồn, cài đặt phụ thuộc, cấu hình API backend và khởi chạy Vite.</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {setupSteps.map((step, index) => (
                <div key={step.title} className="rounded-2xl bg-gray-900/60 border border-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-emerald-200">Bước {index + 1}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">CLI</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-1">{step.title}</h3>
                  <code className="block mt-2 text-sm text-emerald-200 bg-black/40 border border-emerald-500/20 rounded-xl px-3 py-2 break-words">{step.code}</code>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-gray-900/70 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-200">
                <Users size={22} />
              </div>
              <div>
                <p className="text-sm text-emerald-200 uppercase tracking-[0.2em]">Ứng dụng Admin</p>
                <h3 className="text-xl font-bold text-white">Bảng điều khiển quản trị</h3>
                <p className="text-sm text-gray-300">Đăng nhập để truy cập Dashboard, bản đồ đa lớp, quản lý dữ liệu và báo cáo.</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                'Bảo mật token & logout an toàn',
                'Widget thời tiết kết nối API backend',
                'Biểu đồ AQI, danh sách trạm, báo cáo cộng đồng',
                'CRUD địa điểm: công viên, trạm sạc, xe đạp, điểm du lịch',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-900 font-semibold shadow-lg shadow-emerald-900/30"
              >
                Đăng nhập ngay
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 rounded-xl border border-white/10 text-white hover:border-emerald-300/60 hover:text-emerald-200 transition-colors"
              >
                Xem Dashboard <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          </div>
        </section>

        <section id="team" className="max-w-6xl mx-auto px-4 py-12 lg:py-16 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Đội ngũ</p>
              <h2 className="text-3xl font-black text-white mt-2">Những người đứng sau Green Map</h2>
              <p className="text-gray-300 mt-2 max-w-2xl">Kết hợp chuyên môn Frontend, Fullstack và Product/Data để tạo nên trải nghiệm quản trị liền mạch.</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-emerald-200">
              <Users size={16} /> Hợp tác mở rộng cộng đồng
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((member) => (
              <div key={member.name} className="rounded-2xl bg-gray-900/60 border border-white/5 p-5 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-emerald-200">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 text-gray-900 p-8 lg:p-10 shadow-2xl overflow-hidden relative">
            <div className="absolute right-10 top-0 h-32 w-32 bg-white/30 blur-3xl rounded-full" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-900/70">Sẵn sàng hành động</p>
                <h3 className="text-3xl font-black">Kích hoạt Green Map cho thành phố của bạn</h3>
                <p className="text-gray-900/80 mt-2 max-w-2xl">Truy cập Dashboard để giám sát môi trường, điều phối nguồn lực và cộng tác với cộng đồng vì một đô thị xanh.</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link
                  to="/login"
                  className="inline-flex items-center px-5 py-3 rounded-2xl bg-black text-white font-semibold shadow-lg"
                >
                  Đăng nhập Admin
                </Link>
                <a
                  href="#intro"
                  className="inline-flex items-center px-5 py-3 rounded-2xl border-2 border-black text-black font-semibold hover:bg-black/10 transition-colors"
                >
                  Xem giới thiệu
                </a>
              </div>
            </div>
          </div>
        </section>
        <section id="license" className="max-w-6xl mx-auto px-4 pb-16">
          <div className="rounded-3xl bg-gray-900/70 border border-white/10 p-8 lg:p-10 shadow-2xl">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Bản quyền & Giấy phép</p>
              <h2 className="text-3xl font-black text-white mt-2">⚖️ License & Attribution</h2>
              <p className="text-gray-300 mt-2">Thông tin về giấy phép mã nguồn và dữ liệu sử dụng trong dự án.</p>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-gray-800/60 border border-white/5 p-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span className="text-emerald-400">1.</span> Mã Nguồn (Source Code)
                </h3>
                <p className="text-gray-300 mt-3">
                  Mã nguồn của dự án này được phát hành dưới giấy phép <strong className="text-emerald-200">Apache License 2.0</strong>.
                  Bạn được phép sử dụng, sửa đổi và phân phối lại mã nguồn này cho mục đích cá nhân hoặc thương mại.
                </p>
                <a 
                  href="https://www.apache.org/licenses/LICENSE-2.0" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm text-emerald-200 hover:text-emerald-300 transition-colors"
                >
                  Xem chi tiết giấy phép <ArrowRight size={14} />
                </a>
              </div>

              <div className="rounded-2xl bg-gray-800/60 border border-white/5 p-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span className="text-emerald-400">2.</span> Dữ Liệu Bản Đồ (Map Data)
                </h3>
                <p className="text-gray-300 mt-3">
                  Dữ liệu địa lý được trích xuất từ <strong className="text-emerald-200">OpenStreetMap (OSM)</strong>.
                </p>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-900/60 border border-white/5 p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Giấy phép</p>
                    <a 
                      href="https://opendatacommons.org/licenses/odbl/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-200 font-semibold hover:text-emerald-300 transition-colors"
                    >
                      ODbL (Open Database License)
                    </a>
                  </div>
                  <div className="rounded-xl bg-gray-900/60 border border-white/5 p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Attribution</p>
                    <p className="text-white font-semibold">© OpenStreetMap contributors</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-800/60 border border-white/5 p-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span className="text-emerald-400">3.</span> Dữ Liệu Môi Trường (Environmental Data)
                </h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-3 text-gray-400 font-semibold">Loại Dữ Liệu</th>
                        <th className="text-left p-3 text-gray-400 font-semibold">Nguồn Cung Cấp</th>
                        <th className="text-left p-3 text-gray-400 font-semibold">Giấy Phép</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="p-3 text-white">Chất lượng không khí (AQI)</td>
                        <td className="p-3">
                          <a 
                            href="https://openaq.org/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-200 hover:text-emerald-300 transition-colors"
                          >
                            OpenAQ API
                          </a>
                        </td>
                        <td className="p-3 text-gray-300">Open Data / CC BY 4.0</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="p-3 text-white">Thời tiết (Weather)</td>
                        <td className="p-3">
                          <a 
                            href="https://open-meteo.com/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-200 hover:text-emerald-300 transition-colors"
                          >
                            Open-Meteo API
                          </a>
                        </td>
                        <td className="p-3 text-gray-300">CC BY 4.0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-800/60 border border-white/5 p-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span className="text-emerald-400">4.</span> Dữ Liệu Giao Thông (Traffic Data)
                </h3>
                <p className="text-gray-300 mt-3">
                  Dữ liệu giao thông (Ngã Tư Sở) được lấy từ{' '}
                  <a 
                    href="https://www.kaggle.com/datasets/egglover05/nga-tu-so-intersection-traffic-dataset" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-200 hover:text-emerald-300 transition-colors font-semibold"
                  >
                    Kaggle Dataset
                  </a>
                </p>
                <p className="text-sm text-gray-400 mt-2">License: Vui lòng xem mô tả trong dataset.</p>
              </div>

              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6">
                <p className="text-gray-300 italic flex items-start gap-3">
                  <span className="text-emerald-400 text-xl">ℹ️</span>
                  <span>
                    <strong className="text-white">Lưu ý:</strong> Dữ liệu mô phỏng giao thông được tạo bởi phần mềm SUMO 
                    và không phản ánh tình trạng giao thông thực tế. Chỉ sử dụng cho mục đích minh họa và nghiên cứu.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

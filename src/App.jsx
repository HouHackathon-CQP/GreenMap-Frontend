// src/App.jsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ContentManagement from './pages/ContentManagement';
import ReportApproval from './pages/ReportApproval';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AirQualityMap from './pages/AirQualityMap';
// Chỉ import mock data cho các trang chưa có API
import { userReportsData } from './data/mockData';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />; // Dashboard giờ dùng GreenMap (đã gọi API) và Chart (vẫn mock)
      case 'airMap':
        return <AirQualityMap />; 
      
      // --- CÁC TRANG QUẢN LÝ GIỜ GỌI API ---
      case 'publicParks':
        return <ContentManagement title="Công viên/Điểm xanh" locationType="PUBLIC_PARK" />;
      case 'chargingStations':
        return <ContentManagement title="Quản lý Trạm Sạc" locationType="CHARGING_STATION" />;
      case 'bicycleRentals':
        return <ContentManagement title="Trạm Thuê xe đạp" locationType="BICYCLE_RENTAL" />;
      case 'touristAttractions':
        return <ContentManagement title="Địa điểm Du lịch" locationType="TOURIST_ATTRACTION" />;

      // --- CÁC TRANG NÀY VẪN DÙNG MOCK DATA ---
      case 'reports':
        // Cần tạo component riêng cho 'reports'
        // Tạm thời dùng ReportApproval (vẫn đang dùng mockData)
        return <ReportApproval />; 
      case 'analytics':
        return <Analytics />; // (Vẫn dùng mockData)
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-200 font-inter">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header 
          setIsSidebarOpen={setIsSidebarOpen} 
          setCurrentPage={setCurrentPage} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-950/50">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
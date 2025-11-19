import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ContentManagement from './pages/ContentManagement';
import ReportApproval from './pages/ReportApproval';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AirQualityMap from './pages/AirQualityMap';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
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

      // --- CÁC TRANG NÀY SẼ TỰ QUẢN LÝ DỮ LIỆU GIẢ ---
      case 'reports':
        // Không cần truyền prop 'initialReports' nữa
        return <ReportApproval />; 
      case 'analytics':
        return <Analytics />; // (Analytics vẫn dùng mock bên trong nó)
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
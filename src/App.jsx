import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ContentManagement from './pages/ContentManagement';
import ReportApproval from './pages/ReportApproval';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AirQualityMap from './pages/AirQualityMap'; // <-- QUAN TRỌNG: Import trang bản đồ mới
import { sensorData, greenPointsData, chargingStationsData } from './data/mockData';

export default function App() {
  // State quản lý trang hiện tại
  const [currentPage, setCurrentPage] = useState('dashboard');
  // State quản lý đóng/mở sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hàm render nội dung chính dựa trên currentPage
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'airMap':
        return <AirQualityMap />; // <-- QUAN TRỌNG: Case hiển thị bản đồ phân vùng
      case 'sensors':
        return <ContentManagement title="Quản lý Cảm biến" data={sensorData} columns={['ID', 'Vị trí', 'Loại', 'Trạng thái', 'Cập nhật']} />;
      case 'greenPoints':
        return <ContentManagement title="Quản lý Điểm Xanh" data={greenPointsData} columns={['ID', 'Tên', 'Phân loại']} />;
      case 'chargingStations':
        return <ContentManagement title="Quản lý Trạm Sạc" data={chargingStationsData} columns={['ID', 'Tên', 'Nhà cung cấp', 'Trạng thái']} />;
      case 'reports':
        return <ReportApproval />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-200 font-inter">
      {/* Sidebar điều hướng bên trái */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Khu vực nội dung chính bên phải */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header chứa thông báo và avatar user */}
        <Header 
          setIsSidebarOpen={setIsSidebarOpen} 
          setCurrentPage={setCurrentPage} 
        />
        
        {/* Nội dung thay đổi tùy theo trang */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-950/50">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
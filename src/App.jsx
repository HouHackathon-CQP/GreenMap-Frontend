import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ContentManagement from './pages/ContentManagement';
import ReportApproval from './pages/ReportApproval';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings'; // <-- QUAN TRỌNG 1: Phải import file Settings
import { sensorData, greenPointsData, chargingStationsData } from './data/mockData';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
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
        // --- QUAN TRỌNG 2: Sửa dòng này để hiển thị Component Settings ---
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
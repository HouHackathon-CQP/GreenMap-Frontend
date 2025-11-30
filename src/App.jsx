import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';

// Pages
import Dashboard from './pages/Dashboard';
import ContentManagement from './pages/ContentManagement';
import ReportApproval from './pages/ReportApproval';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AirQualityMap from './pages/AirQualityMap';
import NewsFeed from './pages/NewsFeed';
import UserManagement from './pages/UserManagement';

// Import thêm hàm logoutUser
import { logoutUser } from './services'; 

const ProtectedRoute = () => {
  const token = localStorage.getItem('access_token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const MainLayout = ({ isSidebarOpen, setIsSidebarOpen, handleLogout }) => {
  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-200 font-inter">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header setIsSidebarOpen={setIsSidebarOpen} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-950/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Tự động logout nếu có sự kiện từ nơi khác (optional)
  useEffect(() => {
    const handleAutoLogout = () => {
      localStorage.removeItem('access_token');
      navigate('/login');
    };
    window.addEventListener('auth:logout', handleAutoLogout);
    return () => window.removeEventListener('auth:logout', handleAutoLogout);
  }, [navigate]);

  // --- HÀM XỬ LÝ LOGOUT (ĐÃ CẬP NHẬT) ---
  const handleLogout = async () => {
    try {
        // 1. Gọi API để báo Backend hủy token/session
        await logoutUser();
    } catch (e) {
        console.error("Lỗi khi gọi API logout:", e);
    } finally {
        // 2. Bất kể API thành công hay thất bại, luôn xóa token ở trình duyệt
        localStorage.removeItem('access_token');
        
        // 3. Chuyển hướng về trang đăng nhập
        navigate('/login');
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} handleLogout={handleLogout} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<AirQualityMap />} />
          <Route path="/news" element={<NewsFeed />} />
          
          <Route path="/parks" element={<ContentManagement key="parks" title="Quản lý Công viên" locationType="PUBLIC_PARK" />} />
          <Route path="/charging" element={<ContentManagement key="charging" title="Quản lý Trạm Sạc" locationType="CHARGING_STATION" />} />
          <Route path="/bikes" element={<ContentManagement key="bikes" title="Quản lý Xe đạp" locationType="BICYCLE_RENTAL" />} />
          <Route path="/tourist" element={<ContentManagement key="tourist" title="Điểm Du lịch" locationType="TOURIST_ATTRACTION" />} />

          <Route path="/reports" element={<ReportApproval />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
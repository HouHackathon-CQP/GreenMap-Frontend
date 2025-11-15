import React, { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  MapPin,
  BatteryCharging,
  Flag,
  BarChart3,
  Settings,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Download,
  Database,
  BrainCircuit,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

// --- Mock Data ---

// Dữ liệu giả cho biểu đồ xu hướng AQI
const aqiTrendData = [
  { name: '00:00', aqi: 45 },
  { name: '03:00', aqi: 50 },
  { name: '06:00', aqi: 55 },
  { name: '09:00', aqi: 70 },
  { name: '12:00', aqi: 65 },
  { name: '15:00', aqi: 75 },
  { name: '18:00', aqi: 85 },
  { name: '21:00', aqi: 80 },
];

// Dữ liệu giả cho thống kê theo khu vực
const areaStatsData = [
  { name: 'Hoàn Kiếm', aqi: 85, noise: 70 },
  { name: 'Đống Đa', aqi: 72, noise: 65 },
  { name: 'Tây Hồ', aqi: 65, noise: 60 },
  { name: 'Cầu Giấy', aqi: 78, noise: 72 },
  { name: 'Hà Đông', aqi: 90, noise: 68 },
];

// Dữ liệu giả cho quản lý cảm biến
const sensorData = [
  {
    id: 'SS-001',
    location: '21.0285, 105.8542',
    type: 'AQI',
    status: 'Active',
    lastUpdate: '2 phút trước',
  },
  {
    id: 'SS-002',
    location: '21.0228, 105.8019',
    type: 'Noise',
    status: 'Active',
    lastUpdate: '3 phút trước',
  },
  {
    id: 'SS-003',
    location: '20.9850, 105.7938',
    type: 'AQI',
    status: 'Inactive',
    lastUpdate: '2 giờ trước',
  },
  {
    id: 'SS-004',
    location: '21.0374, 105.7839',
    type: 'AQI & Noise',
    status: 'Maintenance',
    lastUpdate: '1 ngày trước',
  },
];

// Dữ liệu giả cho báo cáo từ người dân
const userReportsData = [
  {
    id: 'RP-101',
    type: 'Điểm nóng ô nhiễm',
    location: 'Ngã tư Sở',
    description: 'Khói bụi nghiêm trọng vào giờ cao điểm.',
    status: 'Pending',
  },
  {
    id: 'RP-102',
    type: 'Thiếu cây xanh',
    location: 'Khu đô thị Mỗ Lao',
    description: 'Khu vực này rất ít cây xanh, mùa hè rất nóng.',
    status: 'Pending',
  },
  {
    id: 'RP-103',
    type: 'Rác thải nhiều',
    location: 'Bờ hồ Văn Quán',
    description: 'Nhiều rác thải sinh hoạt quanh hồ.',
    status: 'Approved',
  },
];

// Dữ liệu giả cho điểm xanh và trạm sạc
const greenPointsData = [
  { id: 'GP-01', name: 'Công viên Thống Nhất', type: 'Công viên' },
  { id: 'GP-02', name: 'Vườn hoa Lý Thái Tổ', type: 'Vườn hoa' },
];

const chargingStationsData = [
  { id: 'CS-01', name: 'Vinfast Times City', provider: 'Vinfast', status: 'Available' },
  { id: 'CS-02', name: 'EVCap Cầu Giấy', provider: 'EVCap', status: 'In Use' },
];


// --- Main App Component ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hàm render trang dựa trên state
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardView />;
      case 'sensors':
        return <ContentManagementPage title="Quản lý Cảm biến" data={sensorData} columns={['ID', 'Vị trí', 'Loại', 'Trạng thái', 'Cập nhật']} />;
      case 'greenPoints':
        return <ContentManagementPage title="Quản lý Điểm Xanh" data={greenPointsData} columns={['ID', 'Tên', 'Phân loại']} />;
      case 'chargingStations':
        return <ContentManagementPage title="Quản lý Trạm Sạc" data={chargingStationsData} columns={['ID', 'Tên', 'Nhà cung cấp', 'Trạng thái']} />;
      case 'reports':
        return <ReportApprovalPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-200 font-inter">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <Header setIsSidebarOpen={setIsSidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-950/50">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

// --- Components ---

function Sidebar({ currentPage, setCurrentPage, isOpen, setIsOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sensors', label: 'Quản lý Cảm biến', icon: MapPin },
    { id: 'greenPoints', label: 'Quản lý Điểm Xanh', icon: Map },
    { id: 'chargingStations', label: 'Quản lý Trạm Sạc', icon: BatteryCharging },
    { id: 'reports', label: 'Duyệt Báo cáo', icon: Flag },
    { id: 'analytics', label: 'Phân tích & Dự báo', icon: BarChart3 },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar Content */}
      <nav
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:flex lg:flex-col border-r border-gray-700/50`}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700/50">
          <h1 className="text-xl font-bold text-green-400">Bản Đồ Xanh</h1>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <ul className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(item.id);
                  setIsOpen(false); // Close sidebar on mobile nav click
                }}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'bg-green-600/20 text-green-300 font-medium'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <item.icon size={20} className="mr-3" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t border-gray-700/50">
          <p className="text-xs text-gray-500">© 2025 Green Hanoi Project</p>
        </div>
      </nav>
    </>
  );
}

function Header({ setIsSidebarOpen }) {
  return (
    <header className="flex-shrink-0 flex items-center justify-between h-16 p-4 md:px-6 bg-gray-900 border-b border-gray-700/50">
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden text-gray-400 hover:text-white"
      >
        <Menu size={24} />
      </button>
      <div className="hidden lg:block">
        <h2 className="text-xl font-semibold">Chào mừng Admin,</h2>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-white relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>
        <div className="flex items-center space-x-2">
          <User size={24} className="bg-gray-700 rounded-full p-0.5" />
          <span className="hidden md:inline">admin@greenmap.vn</span>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}

// --- Page Components ---

/**
 * 1. Dashboard quản trị dữ liệu
 */
function DashboardView() {
  const kpiData = [
    { title: 'Tổng Cảm biến', value: 120, icon: Database, color: 'text-blue-400' },
    { title: 'Hoạt động', value: 115, icon: CheckCircle, color: 'text-green-400' },
    { title: 'Báo cáo chờ duyệt', value: 12, icon: Clock, color: 'text-yellow-400' },
    { title: 'AQI Trung bình', value: 78, icon: AlertCircle, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} color={kpi.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2 bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-green-300">Bản đồ Trạm đo (Goong Map)</h3>
          <div className="h-[400px] bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">[Tích hợp Goong Map tại đây]</span>
          </div>
        </div>

        {/* Sensor Status */}
        <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-green-300">Tình trạng Cảm biến</h3>
          <ul className="space-y-3 h-[400px] overflow-y-auto">
            {sensorData.map((sensor) => (
              <li key={sensor.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-semibold">{sensor.id} <span className="text-xs font-light">({sensor.type})</span></p>
                  <p className="text-xs text-gray-400">{sensor.location}</p>
                </div>
                <SensorStatusChip status={sensor.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AQI Trend */}
        <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-green-300">Xu hướng AQI (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={aqiTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#E5E7EB' }}
              />
              <Legend />
              <Line type="monotone" dataKey="aqi" name="AQI" stroke="#F97316" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats by Area */}
        <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-green-300">Thống kê theo Khu vực</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={areaStatsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#E5E7EB' }}
              />
              <Legend />
              <Bar dataKey="aqi" name="AQI" fill="#F97316" />
              <Bar dataKey="noise" name="Tiếng ồn (dB)" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-700/50 flex items-center space-x-4">
      <div className={`p-3 rounded-full bg-gray-700 ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function SensorStatusChip({ status }) {
  let color = '';
  switch (status) {
    case 'Active':
      color = 'bg-green-500/30 text-green-300';
      break;
    case 'Inactive':
      color = 'bg-gray-500/30 text-gray-300';
      break;
    case 'Maintenance':
      color = 'bg-yellow-500/30 text-yellow-300';
      break;
    default:
      color = 'bg-gray-500/30 text-gray-300';
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}>
      {status}
    </span>
  );
}

/**
 * 2. Quản lý nội dung
 */
function ContentManagementPage({ title, data, columns }) {
  return (
    <div className="bg-gray-800/60 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-300">{title}</h2>
        <button className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Thêm mới
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr className="border-b border-gray-600">
              {columns.map((col) => (
                <th key={col} className="p-4 text-gray-400 font-semibold uppercase text-sm">
                  {col}
                </th>
              ))}
              <th className="p-4 text-gray-400 font-semibold uppercase text-sm">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                {Object.values(row).map((value, index) => (
                  <td key={index} className="p-4 text-gray-200">{value}</td>
                ))}
                <td className="p-4">
                  <button className="text-blue-400 hover:text-blue-300 mr-2">Sửa</button>
                  <button className="text-red-400 hover:text-red-300">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 2. Duyệt báo cáo từ người dân
 */
function ReportApprovalPage() {
  return (
    <div className="bg-gray-800/60 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700/50">
      <h2 className="text-2xl font-bold text-green-300 mb-6">Duyệt Báo cáo từ Người dân</h2>
      <div className="space-y-4">
        {userReportsData.map((report) => (
          <div key={report.id} className="bg-gray-700/50 p-4 rounded-lg flex flex-col md:flex-row justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-bold text-lg">{report.type}</span>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${report.status === 'Pending' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-green-500/30 text-green-300'}`}>
                  {report.status}
                </span>
              </div>
              <p className="text-gray-300 mb-1"><span className="font-semibold">Vị trí:</span> {report.location}</p>
              <p className="text-gray-400 text-sm"><span className="font-semibold">Mô tả:</span> {report.description}</p>
            </div>
            {report.status === 'Pending' && (
              <div className="flex space-x-3">
                <button className="flex-1 md:flex-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Duyệt
                </button>
                <button className="flex-1 md:flex-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Từ chối
                </button>
                <button className="flex-1 md:flex-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  <ExternalLink size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 3. Phân tích & Dự báo
 */
function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-300">Phân tích & Dự báo Nâng cao</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI/ML Training */}
        <div className="bg-gray-800/60 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center">
            <BrainCircuit size={20} className="mr-2" />
            Mô hình Dự báo Ô nhiễm
          </h3>
          <p className="text-gray-400 mb-4">
            Sử dụng AI/ML (TensorFlow, Scikit-learn) để dự đoán xu hướng ô nhiễm không khí và tiếng ồn trong 24/48h.
          </p>
          <div className="space-y-3">
            <p className="text-sm">Trạng thái mô hình: <span className="text-green-400 font-semibold">Đang hoạt động</span></p>
            <p className="text-sm">Độ chính xác (AQI): <span className="text-white">92.5%</span></p>
            <p className="text-sm">Lần training cuối: <span className="text-white">04:00, Hôm nay</span></p>
          </div>
          <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Chạy lại Mô hình (Retrain)
          </button>
        </div>

        {/* PDF Reports */}
        <div className="bg-gray-800/60 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center">
            <FileText size={20} className="mr-2" />
            Báo cáo PDF Tự động
          </h3>
          <p className="text-gray-400 mb-4">
            Tự động tạo và gửi báo cáo định kỳ (hàng tuần, hàng tháng) cho các cơ quan quản lý.
          </p>
          <div className="space-y-3">
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Báo cáo Tuần 45/2025</span>
                <button className="text-green-400 hover:text-green-300 flex items-center">
                    <Download size={16} className="mr-1" /> Tải về
                </button>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Báo cáo Tháng 10/2025</span>
                <button className="text-green-400 hover:text-green-300 flex items-center">
                    <Download size={16} className="mr-1" /> Tải về
                </button>
             </div>
          </div>
          <button className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Tạo Báo cáo mới
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Settings Page (Placeholder)
 */
function SettingsPage() {
  return (
    <div className="bg-gray-800/60 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700/50">
      <h2 className="text-2xl font-bold text-green-300 mb-6">Cài đặt</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Email Quản trị</label>
          <input
            type="email"
            defaultValue="admin@greenmap.vn"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Ngưỡng cảnh báo AQI</label>
          <input
            type="number"
            defaultValue="100"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
          />
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
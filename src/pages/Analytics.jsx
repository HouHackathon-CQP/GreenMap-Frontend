import React from 'react';
import { 
  BrainCircuit, FileText, Download, TrendingUp, 
  AlertOctagon, CheckCircle, Calendar 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';

// Mock Data cho biểu đồ dự báo
const forecastData = [
  { time: '00:00', thuc_te: 45, du_bao: 48 },
  { time: '04:00', thuc_te: 55, du_bao: 53 },
  { time: '08:00', thuc_te: 110, du_bao: 105 }, // Cao điểm sáng
  { time: '12:00', thuc_te: 85, du_bao: 90 },
  { time: '16:00', thuc_te: 95, du_bao: 92 },
  { time: '20:00', thuc_te: 130, du_bao: 135 }, // Cao điểm tối
  { time: '23:59', thuc_te: 70, du_bao: 75 },
];

const reportHistory = [
  { id: 1, name: "Báo cáo Chất lượng không khí Tháng 10", date: "01/11/2023", status: "Sẵn sàng", size: "2.4 MB" },
  { id: 2, name: "Cảnh báo Ô nhiễm diện rộng (Tuần 42)", date: "25/10/2023", status: "Đã gửi", size: "1.1 MB" },
  { id: 3, name: "Đánh giá hiệu quả trồng cây xanh Q.Cầu Giấy", date: "15/10/2023", status: "Sẵn sàng", size: "5.8 MB" },
];

export default function Analytics() {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-black text-white flex items-center">
             <BrainCircuit className="mr-3 text-purple-500" size={32} /> Phân tích & Dự báo AI
           </h2>
           <p className="text-gray-400 text-sm mt-1">Mô hình học máy dự đoán xu hướng ô nhiễm trong 24h tới.</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-purple-900/20 flex items-center">
            <BrainCircuit size={16} className="mr-2 animate-pulse"/> Train Model lại
        </button>
      </div>

      {/* 1. MODEL PERFORMANCE CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: So sánh Thực tế vs Dự báo */}
        <div className="lg:col-span-2 bg-[#111318] border border-gray-800 p-6 rounded-3xl shadow-lg">
           <h3 className="text-white font-bold text-lg mb-6 flex items-center">
             <TrendingUp className="text-emerald-500 mr-2" size={20}/> Độ chính xác của Mô hình (Hôm nay)
           </h3>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={forecastData}>
                 <defs>
                   <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>
                 <XAxis dataKey="time" stroke="#9ca3af" axisLine={false} tickLine={false} dy={10} fontSize={12}/>
                 <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} fontSize={12}/>
                 <Tooltip contentStyle={{backgroundColor:'#111827', border:'1px solid #374151', borderRadius:'12px'}} itemStyle={{fontWeight:'bold'}}/>
                 <Legend verticalAlign="top" height={36} iconType="circle"/>
                 <Area type="monotone" name="Thực tế" dataKey="thuc_te" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReal)" />
                 <Area type="monotone" name="AI Dự báo" dataKey="du_bao" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorAI)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Stats Card */}
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-900/40 to-gray-900 border border-purple-500/30 p-6 rounded-3xl">
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Độ chính xác (Accuracy)</h4>
                <div className="text-4xl font-black text-white mb-1">94.2%</div>
                <div className="text-emerald-400 text-sm font-medium flex items-center"><CheckCircle size={14} className="mr-1"/> Cao hơn tuần trước 1.5%</div>
            </div>
            
            <div className="bg-[#111318] border border-gray-800 p-6 rounded-3xl">
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Cảnh báo Bất thường</h4>
                <div className="space-y-3">
                    <div className="flex items-start p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <AlertOctagon className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={18}/>
                        <div>
                            <p className="text-white text-sm font-bold">Điểm nóng Cầu Giấy</p>
                            <p className="text-gray-400 text-xs mt-0.5">AQI dự kiến vượt 200 lúc 17:00 hôm nay.</p>
                        </div>
                    </div>
                    <div className="flex items-start p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <AlertOctagon className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" size={18}/>
                        <div>
                            <p className="text-white text-sm font-bold">Thiếu dữ liệu Tây Hồ</p>
                            <p className="text-gray-400 text-xs mt-0.5">3 cảm biến mất kết nối {'>'} 2h.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 2. AUTOMATED REPORTS */}
      <div className="bg-[#111318] border border-gray-800 p-6 rounded-3xl shadow-lg">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-lg flex items-center">
                <FileText className="text-blue-500 mr-2" size={20}/> Báo cáo Tự động
            </h3>
            <button className="text-sm text-gray-400 hover:text-white underline">Xem tất cả</button>
         </div>
         <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-gray-400">
                 <thead className="text-xs uppercase bg-gray-900/50 text-gray-500 font-bold">
                     <tr>
                         <th className="px-4 py-3 rounded-l-lg">Tên Báo cáo</th>
                         <th className="px-4 py-3">Ngày tạo</th>
                         <th className="px-4 py-3">Dung lượng</th>
                         <th className="px-4 py-3">Trạng thái</th>
                         <th className="px-4 py-3 rounded-r-lg text-right">Tác vụ</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800">
                     {reportHistory.map(item => (
                         <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                             <td className="px-4 py-4 font-medium text-white flex items-center">
                                 <div className="p-2 bg-blue-500/10 rounded-lg mr-3 text-blue-400"><FileText size={16}/></div>
                                 {item.name}
                             </td>
                             <td className="px-4 py-4"><span className="flex items-center"><Calendar size={14} className="mr-1.5 opacity-70"/> {item.date}</span></td>
                             <td className="px-4 py-4 font-mono text-xs">{item.size}</td>
                             <td className="px-4 py-4">
                                 <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.status === 'Đã gửi' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                     {item.status}
                                 </span>
                             </td>
                             <td className="px-4 py-4 text-right">
                                 <button className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"><Download size={16}/></button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      </div>
    </div>
  );
}
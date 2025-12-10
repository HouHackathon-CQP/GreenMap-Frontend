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

import React, { useState, useEffect } from 'react';
import { 
  Bell, Send, Sparkles, Loader2, AlertCircle, CheckCircle, 
  History, Trash2, Smartphone, Eye, Radio
} from 'lucide-react';
import { 
  sendNotification, 
  sendTopicNotification,
  getAIWeatherInsights, 
  getNotificationHistory,
  getNotificationById,
  cleanupNotificationHistory,
  getDeviceTokens
} from '../services';

export default function Notification() {
  const [activeTab, setActiveTab] = useState('send'); // 'send', 'history', 'tokens'
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    data: {
      additionalProp1: '',
      additionalProp2: '',
      additionalProp3: ''
    },
    dry_run: false
  });
  
  const [sendType, setSendType] = useState('token'); // 'token' or 'topic'
  const [topicName, setTopicName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [aiParams, setAiParams] = useState({
    location: 'hanoi', // 'hanoi' or 'hcm'
    provider: 'auto',
    model: ''
  });

  const locations = {
    hanoi: { lat: 21.0285, lon: 105.8542, label: 'Hà Nội' },
    hcm: { lat: 10.8231, lon: 106.6297, label: 'Hồ Chí Minh (Coming Soon)' }
  };

  // History states
  const [history, setHistory] = useState({ items: [], total: 0 });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState({
    skip: 0,
    limit: 20,
    notification_type: '',
    user_id: ''
  });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Tokens state
  const [tokens, setTokens] = useState([]);
  const [tokensLoading, setTokensLoading] = useState(false);

  // Load history on tab change
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    } else if (activeTab === 'tokens') {
      loadTokens();
    }
  }, [activeTab, historyFilter]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await getNotificationHistory(historyFilter);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadTokens = async () => {
    setTokensLoading(true);
    try {
      const data = await getDeviceTokens();
      setTokens(data);
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setTokensLoading(false);
    }
  };

  const viewNotificationDetail = async (id) => {
    try {
      const data = await getNotificationById(id);
      setSelectedNotification(data);
      setShowDetailModal(true);
    } catch (error) {
      setMessage({ type: 'error', text: `Lỗi khi tải chi tiết: ${error.message}` });
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Bạn có chắc muốn xóa thông báo cũ hơn 90 ngày?')) return;
    
    try {
      await cleanupNotificationHistory(90);
      setMessage({ type: 'success', text: 'Đã dọn dẹp lịch sử thông báo cũ' });
      loadHistory();
    } catch (error) {
      setMessage({ type: 'error', text: `Lỗi khi dọn dẹp: ${error.message}` });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('data.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        data: { ...prev.data, [key]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAIParamsChange = (e) => {
    const { name, value } = e.target;
    setAiParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateAI = async () => {
    setAiLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const selectedLocation = locations[aiParams.location];
      const params = {
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        provider: aiParams.provider,
        ...(aiParams.model && { model: aiParams.model })
      };
      
      const response = await getAIWeatherInsights(params);
      
      if (response && response.analysis) {
        setFormData(prev => ({
          ...prev,
          title: 'Cảnh báo thời tiết & Chất lượng không khí',
          body: response.analysis
        }));
        setMessage({ 
          type: 'success', 
          text: `Đã tạo nội dung từ AI (${response.provider}, model: ${response.model})` 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Lỗi khi tạo nội dung AI: ${error.message}` 
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Clean up empty additional properties
      const cleanData = Object.entries(formData.data)
        .filter(([_, value]) => value.trim() !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      const payload = {
        title: formData.title,
        body: formData.body,
        data: Object.keys(cleanData).length > 0 ? cleanData : undefined,
        dry_run: formData.dry_run
      };
      
      let response;
      if (sendType === 'topic') {
        // Send to topic
        payload.topic = topicName || undefined;
        response = await sendTopicNotification(payload);
      } else {
        // Send to all tokens
        response = await sendNotification(payload);
      }
      
      if (response) {
        setMessage({ 
          type: 'success', 
          text: formData.dry_run 
            ? 'Dry run thành công! Không có thông báo thực sự được gửi.' 
            : `Gửi thông báo thành công qua ${sendType === 'topic' ? 'topic' : 'device tokens'}!` 
        });
        
        // Reset form if not dry run
        if (!formData.dry_run) {
          setFormData({
            title: '',
            body: '',
            data: {
              additionalProp1: '',
              additionalProp2: '',
              additionalProp3: ''
            },
            dry_run: false
          });
          setTopicName('');
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Lỗi khi gửi thông báo: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSendTab = () => (
    <div className="space-y-6">
      {/* AI Generation Section */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tạo nội dung từ AI</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vị trí
            </label>
            <select
              name="location"
              value={aiParams.location}
              onChange={handleAIParamsChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="hanoi">{locations.hanoi.label}</option>
              <option value="hcm" disabled>{locations.hcm.label}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Provider AI
            </label>
            <select
              name="provider"
              value={aiParams.provider}
              onChange={handleAIParamsChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="auto">Auto</option>
              <option value="gemini">Gemini</option>
              <option value="groq">Groq</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model (Optional)
            </label>
            <input
              type="text"
              name="model"
              value={aiParams.model}
              onChange={handleAIParamsChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="gemini-1.5-pro"
            />
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={aiLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
        >
          {aiLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Tạo từ AI
            </>
          )}
        </button>
      </div>

      {/* Send Type Selection */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="sendType"
            value="token"
            checked={sendType === 'token'}
            onChange={(e) => setSendType(e.target.value)}
            className="w-4 h-4 text-green-600"
          />
          <Smartphone className="w-4 h-4" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Gửi tới tất cả devices</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="sendType"
            value="topic"
            checked={sendType === 'topic'}
            onChange={(e) => setSendType(e.target.value)}
            className="w-4 h-4 text-green-600"
          />
          <Radio className="w-4 h-4" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Gửi theo Topic</span>
        </label>
      </div>

      {/* Topic Input (only show when topic mode) */}
      {sendType === 'topic' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Topic Name (để trống để dùng mặc định)
          </label>
          <input
            type="text"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Nhập topic name"
          />
        </div>
      )}

      {/* Notification Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Nhập tiêu đề thông báo"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Nhập nội dung thông báo"
          />
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Dữ liệu bổ sung (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Additional Prop 1
              </label>
              <input
                type="text"
                name="data.additionalProp1"
                value={formData.data.additionalProp1}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="Value 1"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Additional Prop 2
              </label>
              <input
                type="text"
                name="data.additionalProp2"
                value={formData.data.additionalProp2}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="Value 2"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Additional Prop 3
              </label>
              <input
                type="text"
                name="data.additionalProp3"
                value={formData.data.additionalProp3}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="Value 3"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="dry_run"
            id="dry_run"
            checked={formData.dry_run}
            onChange={handleInputChange}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="dry_run" className="text-sm text-gray-700 dark:text-gray-300">
            Dry run (không gửi thông báo thực sự, chỉ kiểm tra)
          </label>
        </div>
        
        {/* Message Display */}
        {message.text && (
          <div className={`flex items-start gap-2 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}
        
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi thông báo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Loại thông báo
          </label>
          <select
            value={historyFilter.notification_type}
            onChange={(e) => setHistoryFilter(prev => ({ ...prev, notification_type: e.target.value, skip: 0 }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tất cả</option>
            <option value="token">Token</option>
            <option value="topic">Topic</option>
          </select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            User ID
          </label>
          <input
            type="number"
            value={historyFilter.user_id}
            onChange={(e) => setHistoryFilter(prev => ({ ...prev, user_id: e.target.value, skip: 0 }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            placeholder="Filter by user ID"
          />
        </div>
        
        <button
          onClick={handleCleanup}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Dọn dẹp cũ (90 ngày)
        </button>
      </div>

      {/* History List */}
      {historyLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : history.items.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Chưa có lịch sử thông báo
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tiêu đề</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Topic</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Đã gửi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Thất bại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Thời gian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {history.items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{item.id}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white max-w-xs truncate">{item.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.notification_type === 'topic' 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      }`}>
                        {item.notification_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.topic || '-'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{item.sent_count}</td>
                    <td className="px-4 py-3 text-red-600 dark:text-red-400">{item.failed_count}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.status === 'success' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                      {new Date(item.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => viewNotificationDetail(item.id)}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị {historyFilter.skip + 1} - {Math.min(historyFilter.skip + historyFilter.limit, history.total)} / {history.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryFilter(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
                disabled={historyFilter.skip === 0}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Trước
              </button>
              <button
                onClick={() => setHistoryFilter(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
                disabled={historyFilter.skip + historyFilter.limit >= history.total}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Sau
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderTokensTab = () => (
    <div className="space-y-4">
      {tokensLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Chưa có device token nào được đăng ký
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Tổng số: {tokens.length} device tokens
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Token</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Platform</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Gửi lần cuối</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Đăng ký</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tokens.map(token => (
                  <tr key={token.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{token.id}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate font-mono text-xs">
                      {token.token}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{token.platform || '-'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{token.user_id || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        token.is_active 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {token.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                      {token.last_sent_at ? new Date(token.last_sent_at).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                      {new Date(token.created_at).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Thông báo</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gửi thông báo đến ứng dụng mobile</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('send')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'send'
                  ? 'border-green-600 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Gửi thông báo
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-green-600 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              Lịch sử
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tokens'
                  ? 'border-green-600 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Smartphone className="w-4 h-4 inline mr-2" />
              Device Tokens
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'send' && renderSendTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'tokens' && renderTokensTab()}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chi tiết thông báo</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Tiêu đề:</span>
                <p className="text-gray-900 dark:text-white font-medium">{selectedNotification.title}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Nội dung:</span>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedNotification.body}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Loại:</span>
                  <p className="text-gray-900 dark:text-white">{selectedNotification.notification_type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Topic:</span>
                  <p className="text-gray-900 dark:text-white">{selectedNotification.topic || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Đã gửi:</span>
                  <p className="text-gray-900 dark:text-white">{selectedNotification.sent_count}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Thất bại:</span>
                  <p className="text-gray-900 dark:text-white">{selectedNotification.failed_count}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Trạng thái:</span>
                  <p className="text-gray-900 dark:text-white">{selectedNotification.status}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Thời gian:</span>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedNotification.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              {selectedNotification.data && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Data:</span>
                  <pre className="mt-1 p-3 bg-gray-100 dark:bg-gray-900 rounded text-sm overflow-x-auto">
                    {selectedNotification.data}
                  </pre>
                </div>
              )}
              {selectedNotification.error_message && (
                <div>
                  <span className="text-sm text-red-500">Lỗi:</span>
                  <p className="text-red-600 dark:text-red-400">{selectedNotification.error_message}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


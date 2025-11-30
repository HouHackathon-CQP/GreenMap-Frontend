// src/pages/NewsFeed.jsx
import React, { useEffect, useState } from 'react';
import { fetchNews } from '../services/newsService';
import { Loader2, Calendar, ExternalLink, Newspaper, Search, Filter, Flame, ChevronRight, Globe } from 'lucide-react';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1497436072909-60f360e1d4b0?q=80&w=2560&auto=format&fit=crop";

const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return 'Vừa cập nhật'; }
};

// --- 1. FEATURED NEWS (SỬA: Dùng thẻ 'a' bao bọc toàn bộ) ---
const FeaturedNews = ({ news }) => {
    if (!news) return null;
    
    // Kiểm tra các biến thể của URL
    const articleLink = news.url || news.link || news.article_url || '#'; 

    return (
        <a 
            href={articleLink}
            target="_blank" 
            rel="noopener noreferrer"
            className="relative block w-full h-[400px] rounded-3xl overflow-hidden border border-gray-800 group cursor-pointer shadow-2xl transition-transform hover:scale-[1.01] duration-500"
        >
            {/* Background Image */}
            <img 
                src={news.image_url || FALLBACK_IMAGE} 
                alt="Featured" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => e.target.src = FALLBACK_IMAGE}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-[#111318]/60 to-transparent opacity-90"></div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-8 w-full md:w-3/4 lg:w-2/3 z-10">
                <div className="flex items-center space-x-3 mb-3">
                    <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 flex items-center uppercase tracking-wider">
                        <Flame size={12} className="mr-1.5"/> Tin Nổi Bật
                    </span>
                    <span className="text-gray-400 text-xs flex items-center font-medium">
                        <Calendar size={12} className="mr-1.5"/> {formatDate(news.published_at)}
                    </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3 group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {news.title}
                </h1>
                
                <p className="text-gray-300 text-sm md:text-base line-clamp-2 mb-5 opacity-80 font-medium">
                    {news.summary || "Bấm để xem chi tiết bài viết..."}
                </p>

                <span className="inline-flex items-center px-5 py-2.5 bg-emerald-600 group-hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all group-hover:translate-x-2">
                    Đọc tiếp <ChevronRight size={16} className="ml-2"/>
                </span>
            </div>
        </a>
    );
};

// --- 2. NEWS CARD (SỬA: Dùng thẻ 'a' bao bọc toàn bộ card) ---
const NewsCard = ({ item }) => {
    // Kiểm tra các biến thể của URL
    const articleLink = item.url || item.link || item.article_url || '#';

    return (
        <a 
            href={articleLink}
            target="_blank" 
            rel="noopener noreferrer"
            className="block bg-[#111318] border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] group h-full cursor-pointer"
        >
            {/* Image Area */}
            <div className="relative h-48 overflow-hidden">
                <img 
                    src={item.image_url || FALLBACK_IMAGE} 
                    alt="Thumb" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => e.target.src = FALLBACK_IMAGE}
                />
                <div className="absolute top-3 left-3 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-white text-[10px] font-bold border border-white/10 flex items-center">
                        <Globe size={10} className="mr-1.5 text-blue-400"/> {item.source || 'Tin tức'}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center text-xs text-gray-500 mb-3 font-medium">
                    <Calendar size={12} className="mr-1.5 text-gray-600"/>
                    {formatDate(item.published_at)}
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                    {item.title}
                </h3>

                <p className="text-gray-400 text-xs line-clamp-3 mb-4 flex-1 leading-relaxed">
                    {item.summary || "Không có mô tả chi tiết."}
                </p>

                <span className="mt-auto w-full py-2.5 rounded-xl border border-gray-700 text-gray-300 text-xs font-bold text-center hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-center group-hover:border-gray-600">
                    Xem chi tiết <ExternalLink size={12} className="ml-2 opacity-60 group-hover:opacity-100"/>
                </span>
            </div>
        </a>
    );
};

// --- 3. MAIN PAGE ---
export default function NewsFeed() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const getNews = async () => {
            setLoading(true);
            try {
                const data = await fetchNews();
                // --- DEBUG: Kiểm tra xem API trả về cái gì ---
                console.log("Dữ liệu tin tức:", data); 
                
                setNews(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Lỗi tải tin:", error);
                setNews([]); 
            } finally {
                setLoading(false);
            }
        };
        getNews();
    }, []);

    const filteredNews = news.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const featuredArticle = filteredNews.length > 0 ? filteredNews[0] : null;
    const listArticles = filteredNews.length > 0 ? filteredNews.slice(1) : [];

    return (
        <div className="min-h-full flex flex-col space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center">
                        <Newspaper className="mr-3 text-emerald-500" size={32}/> Điểm tin Môi trường
                    </h2>
                    <p className="text-sm text-gray-400 mt-1 font-medium ml-11">Cập nhật tin tức mới nhất từ các nguồn chính thống</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3.5 top-3 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm bài viết..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#111318] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-emerald-500 mb-4" size={48}/>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest animate-pulse">Đang tổng hợp tin tức...</p>
                </div>
            ) : filteredNews.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center bg-[#111318] border border-gray-800 rounded-3xl">
                    <Filter size={48} className="text-gray-600 mb-4 opacity-50"/>
                    <p className="text-gray-400 font-medium">Không tìm thấy bài viết nào.</p>
                </div>
            ) : (
                <>
                    {!searchTerm && <FeaturedNews news={featuredArticle} />}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {(searchTerm ? filteredNews : listArticles).map((item, index) => (
                            <NewsCard key={index} item={item} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
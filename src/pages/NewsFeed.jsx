// GreenMap-Frontend/src/pages/NewsFeed.jsx
import React, { useEffect, useState } from 'react';
import { fetchNews } from '../apiService';
import { Loader2, ExternalLink, Newspaper, Calendar } from 'lucide-react';

export default function NewsFeed() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews().then(data => setNews(data)).finally(() => setLoading(false));
  }, []);

  const cleanText = (html) => {
    const doc = new DOMParser().parseFromString(html || "", 'text/html');
    return doc.body.textContent || "";
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-green-500" size={30}/></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-300 flex items-center"><Newspaper className="mr-3"/> Tin tức Môi trường</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.length === 0 ? <p className="text-gray-500 col-span-full">Không có tin tức.</p> : 
           news.map((item, idx) => (
             <div key={idx} className="bg-gray-800/60 rounded-xl border border-gray-700 hover:border-green-500/50 p-5 flex flex-col shadow-lg">
               <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 hover:text-green-400">
                 <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
               </h3>
               <div className="text-xs text-gray-500 mb-3 flex items-center"><Calendar size={12} className="mr-1"/> {item.published_at ? new Date(item.published_at).toLocaleDateString('vi-VN') : 'Mới nhất'}</div>
               <p className="text-sm text-gray-300 line-clamp-3 mb-4 flex-1">{cleanText(item.description)}</p>
               <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-green-400 hover:text-green-300 mt-auto">
                 Xem chi tiết <ExternalLink size={14} className="ml-1" />
               </a>
             </div>
           ))
        }
      </div>
    </div>
  );
}
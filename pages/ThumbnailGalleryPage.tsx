import React, { useState, useEffect } from 'react';
import { Copy, Check, Image as ImageIcon } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface ThumbnailItem {
  id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  order: number | null;
  createdAt: string;
}

export const ThumbnailGalleryPage: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<ThumbnailItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'materials'),
      where('category', '==', 'thumbnail')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ThumbnailItem[];
      
      // Client-side sort by order then createdAt
      items.sort((a, b) => {
        if (a.order !== null && b.order !== null) return a.order - b.order;
        if (a.order !== null && b.order === null) return -1;
        if (a.order === null && b.order !== null) return 1;
        
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      
      setThumbnails(items);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching thumbnails:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl mb-4">
          <ImageIcon className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
          썸네일 갤러리
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          이미지와 프롬프트를 확인하고, 바로 복사하여 내 작업에 활용해보세요.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : thumbnails.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-gray-800/50 rounded-3xl border border-gray-200 dark:border-gray-700">
          <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-bold">등록된 썸네일 갤러리 자료가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {thumbnails.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Image Section */}
              <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img 
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {item.title}
                </h3>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6 flex-1 border border-gray-100 dark:border-gray-800">
                  <pre className="text-sm text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap word-break h-full">
                    {item.prompt}
                  </pre>
                </div>

                <button
                  onClick={() => handleCopy(item.id, item.prompt || '')}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                    copiedId === item.id
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
                  }`}
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-5 h-5" />
                      프롬프트 복사됨!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      프롬프트 복사하기
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

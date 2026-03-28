import React, { useState } from 'react';
import { ExternalLink, Lock, ShieldCheck, Crown } from 'lucide-react';
import { ContentItem } from '../types';
import { getScreenshotUrl } from '../utils/image';

interface Props {
  item: ContentItem;
  onClick: (item: ContentItem) => void;
  isProAuthenticated: boolean;
}

export const ContentCard: React.FC<Props> = ({ item, onClick, isProAuthenticated }) => {
  const [imgSrc, setImgSrc] = useState(item.posterUrl || getScreenshotUrl(item.url));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
      if (!hasError) {
          setHasError(true);
          setImgSrc('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop');
      }
  };

  return (
    <div 
      className={`group flex flex-col bg-white dark:bg-[#0a0c10] rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer h-full ${
        item.isPro 
          ? 'border-amber-200/50 dark:border-amber-900/30 shadow-amber-500/5 hover:border-amber-400 dark:hover:border-amber-700 shadow-xl hover:shadow-2xl' 
          : 'border-gray-200 dark:border-gray-800/50 shadow-xl hover:shadow-2xl hover:border-gray-300 dark:hover:border-gray-700'
      }`}
      onClick={() => onClick(item)}
    >
      {/* Top Image Section */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={imgSrc}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={handleError}
        />
        
        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {item.isPro && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-2.5 py-1 rounded-md text-[11px] font-black shadow-xl border border-white/20 animate-pulse">
              <Crown className="w-3 h-3" />
              회원전용
            </div>
          )}
        </div>
        
        <div className="absolute top-3 right-3">
          <div className="bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border border-white/10">
            {item.category}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className={`font-bold text-xl mb-4 line-clamp-2 transition-colors ${
          item.isPro 
            ? 'text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400' 
            : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
        }`}>
          {item.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-[13px] leading-relaxed mb-6 line-clamp-6 flex-1 transition-colors">
          {item.description}
        </p>

        {/* Action Button */}
        <div className="mt-auto">
          {item.isPro && !isProAuthenticated ? (
            <button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
              <Lock className="w-4 h-4" strokeWidth={3} />
              잠금 해제 및 이동
            </button>
          ) : (
            <button className={`w-full font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
              item.isPro 
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20' 
                : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-blue-500/20'
            }`}>
              <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
              바로가기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

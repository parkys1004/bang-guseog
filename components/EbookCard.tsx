import React from 'react';
import { EbookItem } from '../types';

interface Props {
  item: EbookItem;
  onClick: (item: EbookItem) => void;
}

export const EbookCard: React.FC<Props> = ({ item, onClick }) => {
  return (
    <div 
      onClick={() => onClick(item)}
      className="group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Book Cover Container */}
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2">
        <img 
          src={item.coverUrl} 
          alt={item.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        {/* Badge */}
        <div className="absolute top-3 right-3">
          {item.isFree ? (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
              무료
            </span>
          ) : item.isPro ? (
            <span className="bg-[#a3937b] text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg">
              회원전용
            </span>
          ) : null}
        </div>

        {/* Overlay for hover effect */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
        
        {/* Book spine effect */}
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-black/40 to-transparent" />
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h3 className="text-gray-900 dark:text-white font-bold text-base line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {item.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-500 text-sm line-clamp-2 leading-relaxed transition-colors">
          {item.description}
        </p>
      </div>
    </div>
  );
};

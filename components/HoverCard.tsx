import React, { useEffect, useState } from 'react';
import { Play, Plus, ThumbsUp, ChevronDown, Check } from 'lucide-react';
import { ContentItem } from '../types';
import { getScreenshotUrl } from '../utils/image';

interface Props {
  item: ContentItem;
  position: { top: number; left: number; width: number; height: number };
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

export const HoverCard: React.FC<Props> = ({ item, position, onHover, onLeave, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // 자동 이미지 생성
  const backdropImage = item.backdropUrl || getScreenshotUrl(item.url);

  // Calculate position to center the expanded card over the original trigger
  const scale = 1.5;
  const width = position.width * scale;
  
  // Center alignment logic
  let left = position.left - (width - position.width) / 2;
  let top = position.top - (position.height * 0.1); 

  // Boundary checks
  if (left < 10) left = 10;
  if (left + width > window.innerWidth - 10) left = window.innerWidth - width - 10;

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  return (
    <div
      className={`fixed z-50 flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#141414] shadow-[0_0_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_0_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 ease-out`}
      style={{
        top: top,
        left: left,
        width: width,
        height: 'auto',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
        transformOrigin: 'center center',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Top Media Area */}
      <div className="relative aspect-video w-full cursor-pointer group" onClick={onClick}>
        <img
          src={backdropImage}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#141414] via-transparent to-transparent" />
        
        {/* Title overlay in card */}
        <div className="absolute bottom-3 left-4 right-4 z-10">
            <h3 className="text-lg font-black text-gray-900 dark:text-white drop-shadow-md leading-tight">{item.title}</h3>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4 bg-white dark:bg-[#141414] relative transition-colors">
        {/* Subtle gradient separate from image to blend */}
        <div className="absolute top-[-20px] left-0 right-0 h-[20px] bg-gradient-to-b from-transparent to-white dark:to-[#141414] transition-colors"></div>

        {/* Action Buttons */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button 
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-110 transition-all shadow-lg"
            >
              <Play className="h-4 w-4 fill-current ml-0.5" />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsAdded(!isAdded); }}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-400 text-gray-900 dark:text-white hover:border-gray-900 dark:hover:border-white hover:scale-110 transition-all"
            >
              {isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-400 text-gray-900 dark:text-white hover:border-gray-900 dark:hover:border-white hover:scale-110 transition-all">
              <ThumbsUp className="h-4 w-4" />
            </button>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-400 text-gray-900 dark:text-white hover:border-gray-900 dark:hover:border-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all ml-auto"
           >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Metadata */}
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 flex-wrap">
          <span className="rounded bg-gray-200 dark:bg-white/20 px-1 text-[10px] text-gray-800 dark:text-white">HD</span>
        </div>
      </div>
    </div>
  );
};
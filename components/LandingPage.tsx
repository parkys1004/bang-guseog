import React, { useEffect, useState } from 'react';
import { X, Play, Plus, Check, ThumbsUp, Volume2, VolumeX } from 'lucide-react';
import { ContentItem } from '../types';
import { getScreenshotUrl } from '../utils/image';

interface Props {
  item: ContentItem;
  onClose: () => void;
}

export const LandingPage: React.FC<Props> = ({ item, onClose }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Image State
  const initialImage = item.backdropUrl || getScreenshotUrl(item.url);
  const [imgSrc, setImgSrc] = useState(initialImage);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
  };

  const handleImgError = () => {
      // Fallback if backdrop fails
      setImgSrc('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className={`relative h-full w-full overflow-y-auto bg-white dark:bg-[#141414] text-gray-900 dark:text-white shadow-2xl transition-transform duration-300 md:h-[90vh] md:w-[90vw] md:max-w-5xl md:rounded-xl md:overflow-hidden ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-white/20 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Hero Section of Modal */}
        <div className="relative h-[60vh] w-full bg-gray-900">
          <div className="absolute inset-0">
            <img
              src={imgSrc}
              alt={item.title}
              className="h-full w-full object-cover opacity-80"
              onError={handleImgError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#141414] via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            
            <h1 className="mb-4 text-4xl md:text-6xl font-black text-gray-900 dark:text-white drop-shadow-lg leading-tight">
              {item.title}
            </h1>

            <div className="mb-6 flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
              <span className="rounded bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 text-xs text-gray-800 dark:text-white">HD</span>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <button 
                onClick={() => window.open(item.url, '_blank')}
                className="flex items-center justify-center gap-2 rounded bg-black dark:bg-white px-8 py-3 text-lg font-bold text-white dark:text-black transition-colors hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                <Play className="h-6 w-6 fill-current" />
                사이트 방문
              </button>
              <button 
                onClick={() => setIsAdded(!isAdded)}
                className="flex items-center justify-center gap-2 rounded border-2 border-gray-300 dark:border-gray-500 bg-white/30 dark:bg-black/30 px-6 py-3 text-lg font-bold text-gray-900 dark:text-white transition-colors hover:border-gray-900 dark:hover:border-white hover:bg-gray-100 dark:hover:bg-white/10"
              >
                {isAdded ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                {isAdded ? '보관함에 담김' : '내가 찜한 콘텐츠'}
              </button>
              <button className="flex items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-500 bg-white/30 dark:bg-black/30 p-3 text-gray-900 dark:text-white transition-colors hover:border-gray-900 dark:hover:border-white hover:bg-gray-100 dark:hover:bg-white/10">
                <ThumbsUp className="h-6 w-6" />
              </button>
            </div>
          </div>

           {/* Mute Toggle (Absolute to Hero) */}
           <button 
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-10 right-8 hidden md:flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-500 bg-white/30 dark:bg-black/30 p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
            >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-3 md:px-12 md:pb-12 bg-white dark:bg-[#141414] transition-colors">
          <div className="col-span-2">
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">주요 특징</h3>
                 <div className="space-y-4">
                     <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                         <div className="flex-1">
                             <h4 className="text-gray-900 dark:text-white font-bold mb-1">반응형 디자인</h4>
                             <p className="text-sm text-gray-600 dark:text-gray-400">모바일, 태블릿, 데스크탑 등 모든 디바이스에 최적화된 레이아웃을 제공합니다.</p>
                         </div>
                     </div>
                     <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                         <div className="flex-1">
                             <h4 className="text-gray-900 dark:text-white font-bold mb-1">인터랙티브 요소</h4>
                             <p className="text-sm text-gray-600 dark:text-gray-400">사용자의 행동에 반응하는 미세한 애니메이션과 전환 효과가 포함되어 있습니다.</p>
                         </div>
                     </div>
                     <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                         <div className="flex-1">
                             <h4 className="text-gray-900 dark:text-white font-bold mb-1">SEO 최적화</h4>
                             <p className="text-sm text-gray-600 dark:text-gray-400">검색 엔진 최적화가 적용되어 있어 마케팅 성과를 극대화할 수 있습니다.</p>
                         </div>
                     </div>
                 </div>
            </div>
          </div>

          <div className="col-span-1 space-y-6 text-sm text-gray-500 dark:text-gray-400">
            <div>
              <span className="block text-gray-400 dark:text-gray-500">카테고리:</span>
              <span className="text-gray-900 dark:text-white">{item.category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
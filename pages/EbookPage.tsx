import React from 'react';
import { EbookCard } from '../components/EbookCard';
import { EBOOK_CONTENTS } from '../data';
import { EbookItem } from '../types';

export const EbookPage: React.FC = () => {
  const handleCardClick = (item: EbookItem) => {
    window.open(item.url, '_blank');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020408] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in fade-in duration-500">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-blue-600 dark:text-blue-500 font-bold tracking-wide uppercase text-sm mb-3">E-Book Collection</h2>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight transition-colors">
            AI 음악 제작의 모든 것<br />
            전문가의 노하우를 담은 전자책
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors">
            AI Studio와 Suno를 활용한 작곡 기법부터 수익화 전략까지,<br className="hidden md:block"/> 
            방구석 작곡가를 위한 실전 가이드를 만나보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {EBOOK_CONTENTS.map(item => (
            <EbookCard 
              key={item.id} 
              item={item} 
              onClick={handleCardClick} 
            />
          ))}
        </div>

        <div className="mt-20 bg-gray-900 dark:bg-blue-900/10 rounded-3xl p-8 md:p-16 text-center text-white border border-transparent dark:border-blue-500/10 transition-colors">
          <h2 className="text-3xl md:text-4xl font-black mb-6">지금 바로 시작하세요</h2>
          <p className="text-gray-400 dark:text-gray-300 mb-10 max-w-2xl mx-auto transition-colors">
            전자책 구매 시 전용 커뮤니티 초대권과 최신 프롬프트 업데이트를 평생 무료로 제공합니다.
          </p>
          <button className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-xl">
            전자책 보러가기
          </button>
        </div>
      </div>
    </div>
  );
};

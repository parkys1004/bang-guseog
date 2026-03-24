import React, { useState } from 'react';
import { Monitor, Search, ChevronDown, BookOpen } from 'lucide-react';
import { ContentItem, EbookItem } from '../types';
import { AI_CONTENTS, EBOOK_CONTENTS } from '../data';
import { ContentCard } from '../components/ContentCard';
import { EbookCard } from '../components/EbookCard';

interface Props {
  isProAuthenticated: boolean;
  onOpenAuth: () => void;
}

export const ShowcasePage: React.FC<Props> = ({ isProAuthenticated, onOpenAuth }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [activeVisibility, setActiveVisibility] = useState('전체');

  const filteredItems = AI_CONTENTS.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === '전체' || item.category === activeCategory;
    const matchesVisibility = activeVisibility === '전체' || 
                             (activeVisibility === '회원전용' && item.isPro) || 
                             (activeVisibility === '공개' && !item.isPro);
    
    return matchesSearch && matchesCategory && matchesVisibility;
  });

  const filteredEbooks = EBOOK_CONTENTS.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = activeVisibility === '전체' || 
                             (activeVisibility === '회원전용' && item.isPro) || 
                             (activeVisibility === '공개' && !item.isPro);
    
    return matchesSearch && matchesVisibility;
  });

  const handleCardClick = (item: ContentItem | EbookItem) => {
    if (item.isPro && !isProAuthenticated) {
      onOpenAuth();
      return;
    }
    window.open(item.url, '_blank');
  };

  return (
    <div className="animate-in fade-in duration-500 bg-gray-50 dark:bg-[#020408] min-h-screen transition-colors duration-300">
      {/* Hero Section */}
      <header className="pt-16 pb-12 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            AI WEB BUILDER ARCHIVE
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight transition-colors">
             방구석 음악만들기<br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">SUNO V5 PRO</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed transition-colors">
             AI Studio와 Suno로 시작하는 나만의 음악 제작 여정 관련 자료 포함,<br className="hidden md:block"/>
             빌더앱은 계속 업데이트됩니다.
          </p>
      </header>

      {/* Filter Bar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-[#0a0c12] p-4 rounded-xl border border-gray-200 dark:border-gray-800/50 shadow-xl dark:shadow-2xl transition-colors">
          
          {/* Search Input */}
          <div className="relative w-48">
            <input 
              type="text"
              placeholder="도구 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#11141d] border border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white pl-4 pr-10 py-2.5 rounded-lg outline-none focus:border-blue-500/50 transition-all text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>

          {/* Category Group */}
          <div className="flex bg-white dark:bg-[#11141d] p-1 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors">
            {['전체', 'AI STUDIO', 'VERCEL', 'ETC', '전자책'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Visibility Group */}
          <div className="flex bg-white dark:bg-[#11141d] p-1 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors">
            {['전체', '공개', '회원전용'].map((vis) => (
              <button
                key={vis}
                onClick={() => setActiveVisibility(vis)}
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                  activeVisibility === vis 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {vis}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Content Grid */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
         {activeCategory === '전자책' ? (
            filteredEbooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                  {filteredEbooks.map(item => (
                     <EbookCard 
                        key={item.id} 
                        item={item} 
                        onClick={handleCardClick} 
                     />
                  ))}
              </div>
            ) : (
               <div className="text-center py-32 bg-gray-50 dark:bg-[#0a0c12] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
                  <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 dark:text-gray-500 font-medium">해당 조건에 맞는 전자책이 없습니다.</p>
              </div>
            )
         ) : (
            filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredItems.map(item => (
                     <ContentCard 
                        key={item.id} 
                        item={item} 
                        onClick={handleCardClick} 
                        isProAuthenticated={isProAuthenticated}
                     />
                  ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-gray-50 dark:bg-[#0a0c12] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
                  <Monitor className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 dark:text-gray-500 font-medium">해당 조건에 맞는 프로젝트가 없습니다.</p>
              </div>
            )
         )}
      </main>
    </div>
  );
};

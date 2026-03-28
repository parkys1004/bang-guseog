import React, { useState } from 'react';
import { Monitor, Search, ChevronDown, BookOpen, Sparkles, FolderOpen, Globe, RefreshCw, ArrowRight } from 'lucide-react';
import { ContentItem, EbookItem } from '../types';
import { AI_CONTENTS, EBOOK_CONTENTS } from '../data';
import { servicesData } from './ServicePage';
import { recommendedSites } from './RecommendedSitesPage';
import { ContentCard } from '../components/ContentCard';
import { EbookCard } from '../components/EbookCard';

interface Props {
  isProAuthenticated: boolean;
  onOpenAuth: () => void;
  onNavigate: (page: any) => void;
}

export const ShowcasePage: React.FC<Props> = ({ isProAuthenticated, onOpenAuth, onNavigate }) => {
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
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed transition-colors mb-10">
             AI Studio와 Suno로 시작하는 나만의 음악 제작 여정 관련 자료 포함,<br className="hidden md:block"/>
             빌더앱은 계속 업데이트됩니다.
          </p>

          {/* Content Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto mt-8">
            {/* 빌더 앱 */}
            <div className="bg-white dark:bg-[#11141d] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">{AI_CONTENTS.length}</div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">빌더 앱</div>
              <button 
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
              >
                바로가기 <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* 전자책 */}
            <div className="bg-white dark:bg-[#11141d] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">{EBOOK_CONTENTS.length}</div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">전자책</div>
              <button 
                onClick={() => onNavigate('ebook')}
                className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-colors"
              >
                바로가기 <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* 프롬프트 */}
            <div className="bg-white dark:bg-[#11141d] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-3 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">42</div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">프롬프트</div>
              <button 
                onClick={() => onNavigate('prompt')}
                className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 transition-colors"
              >
                바로가기 <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* 그외 자료 */}
            <div className="bg-white dark:bg-[#11141d] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">{servicesData.length}</div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">그외 자료</div>
              <button 
                onClick={() => onNavigate('service')}
                className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors"
              >
                바로가기 <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* 추천사이트 */}
            <div className="bg-white dark:bg-[#11141d] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center mb-3 text-pink-600 dark:text-pink-400">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">{recommendedSites.length}</div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">추천사이트</div>
              <button 
                onClick={() => onNavigate('recommended')}
                className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-pink-900/30 dark:hover:text-pink-400 transition-colors"
              >
                바로가기 <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* 업데이트 */}
            <div className="bg-white dark:bg-[#11141d] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-3 text-orange-600 dark:text-orange-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">∞</div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">업데이트</div>
              <button 
                onClick={() => onNavigate('contact')}
                className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400 transition-colors"
              >
                문의하기 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
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

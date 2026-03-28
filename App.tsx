import React, { useState, useEffect } from 'react';
import { Menu, Layout, Sun, Moon, Lock, ShieldCheck, ArrowUp } from 'lucide-react';
import { ShowcasePage } from './pages/ShowcasePage';
import { EbookPage } from './pages/EbookPage';
import { PromptPage } from './pages/PromptPage';
import { ServicePage } from './pages/ServicePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { RecommendedSitesPage } from './pages/RecommendedSitesPage';
import { PasswordModal } from './components/PasswordModal';

type Page = 'showcase' | 'ebook' | 'prompt' | 'service' | 'about' | 'contact' | 'faq' | 'recommended';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('showcase');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isProAuthenticated, setIsProAuthenticated] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Sync dark mode with document class for Tailwind dark: variants
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#020408';
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#111827';
    }
  }, [isDarkMode]);

  // Handle scroll event for "Scroll to Top" button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activePage) {
      case 'showcase': return (
        <ShowcasePage 
          isProAuthenticated={isProAuthenticated} 
          onOpenAuth={() => setIsPasswordModalOpen(true)} 
          onNavigate={setActivePage}
        />
      );
      case 'ebook': return <EbookPage />;
      case 'prompt': return <PromptPage />;
      case 'service': return <ServicePage />;
      case 'about': return <AboutPage />;
      case 'contact': return <ContactPage />;
      case 'faq': return <FAQPage />;
      case 'recommended': return <RecommendedSitesPage />;
      default: return (
        <ShowcasePage 
          isProAuthenticated={isProAuthenticated} 
          onOpenAuth={() => setIsPasswordModalOpen(true)} 
          onNavigate={setActivePage}
        />
      );
    }
  };

  const navItems: { id: Page; label: string }[] = [
    { id: 'showcase', label: '웹빌더앱' },
    { id: 'ebook', label: '전자책' },
    { id: 'prompt', label: '프롬프트' },
    { id: 'service', label: '그외 자료' },
    { id: 'recommended', label: '추천사이트' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans flex flex-col ${isDarkMode ? 'bg-[#020408] text-white' : 'bg-white text-gray-900'}`}>
      
      {/* Top Navigation Bar */}
      <nav className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${isDarkMode ? 'bg-[#020408]/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => setActivePage('showcase')}
            >
              <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-lg transition-colors">
                <Layout className="w-5 h-5" />
              </div>
              <span className={`text-xl font-black tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>방구석 작곡가</span>
            </div>

            {/* Desktop Nav Links */}
            <div className={`hidden md:flex items-center gap-8 text-sm font-bold transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
               {navItems.map((item) => (
                 <button
                   key={item.id}
                   onClick={() => setActivePage(item.id)}
                   className={`transition-colors ${activePage === item.id ? (isDarkMode ? 'text-white' : 'text-black') : (isDarkMode ? 'hover:text-white' : 'hover:text-black')}`}
                 >
                   {item.label}
                 </button>
               ))}
            </div>

            {/* Icons / Actions */}
            <div className="flex items-center gap-3">
               {/* PRO Auth Button */}
               <button
                 onClick={() => setIsPasswordModalOpen(true)}
                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                   isProAuthenticated 
                     ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                     : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'
                 }`}
               >
                 {isProAuthenticated ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                 {isProAuthenticated ? 'PRO 인증됨' : 'PRO 인증'}
               </button>

               {/* Theme Toggle Button */}
               <button
                 onClick={() => setIsDarkMode(!isDarkMode)}
                 className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                 aria-label="Toggle theme"
               >
                 {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>

               <button 
                 onClick={() => setActivePage('contact')}
                 className={`hidden md:block px-5 py-2 rounded-full text-sm font-bold transition-colors ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
               >
                 프로젝트 시작하기
               </button>
              <button 
                className={`p-2 transition-colors md:hidden ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                 <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t absolute w-full left-0 shadow-lg transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="flex flex-col p-4 space-y-4">
              {/* Mobile PRO Auth */}
              <button
                onClick={() => {
                  setIsPasswordModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-all ${
                  isProAuthenticated 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                {isProAuthenticated ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                {isProAuthenticated ? 'PRO 인증됨' : 'PRO 인증하기'}
              </button>

              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left font-bold transition-colors ${activePage === item.id ? (isDarkMode ? 'text-white' : 'text-black') : (isDarkMode ? 'text-gray-300' : 'text-gray-500')}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1">
        {renderContent()}
      </div>

      <PasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => setIsProAuthenticated(true)}
      />

      {/* Footer */}
      <footer className={`mt-auto border-t py-8 transition-colors ${isDarkMode ? 'bg-[#020408] border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
         <div className="max-w-7xl mx-auto px-4 text-center">
             <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`}>
               © 2026 방구석 작곡가. All rights reserved.
             </p>
         </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
};

export default App;
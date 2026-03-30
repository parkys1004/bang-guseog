import React, { useState, useEffect } from 'react';
import { Menu, Layout, Sun, Moon, Lock, ShieldCheck, ArrowUp, User as UserIcon, LogOut, Settings, Crown } from 'lucide-react';
import { ShowcasePage } from './pages/ShowcasePage';
import { EbookPage } from './pages/EbookPage';
import { PromptPage } from './pages/PromptPage';
import { ServicePage } from './pages/ServicePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { RecommendedSitesPage } from './pages/RecommendedSitesPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdvancedMaterialsPage } from './pages/AdvancedMaterialsPage';
import { collection, query, where, onSnapshot, getDocFromServer, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { motion, AnimatePresence } from 'motion/react';

const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection test successful');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
    // Skip logging for other errors, as this is simply a connection test.
  }
};

testConnection();

type Page = 'showcase' | 'ebook' | 'prompt' | 'service' | 'about' | 'contact' | 'faq' | 'recommended' | 'user-dashboard' | 'admin-dashboard' | 'advanced-materials';

const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('showcase');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();

  // Fetch unread messages count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    console.log('Fetching unread count for user:', user.id);
    console.log('Current Auth UID:', auth.currentUser?.uid);
    console.log('Current Auth Email:', auth.currentUser?.email);

    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', user.id)
    );

    const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
      const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
          userId: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          emailVerified: auth.currentUser?.emailVerified,
          isAnonymous: auth.currentUser?.isAnonymous,
          tenantId: auth.currentUser?.tenantId,
          providerInfo: auth.currentUser?.providerData.map(provider => ({
            providerId: provider.providerId,
            displayName: provider.displayName,
            email: provider.email,
            photoUrl: provider.photoURL
          })) || []
        },
        operationType,
        path
      };
      console.error('Firestore Error: ', JSON.stringify(errInfo));
      throw new Error(JSON.stringify(errInfo));
    };

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unread = snapshot.docs.filter(doc => !doc.data().isRead).length;
      setUnreadCount(unread);
    }, (error) => {
      handleFirestoreError(error, 'get', 'messages');
    });

    return () => unsubscribe();
  }, [user]);

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

  const handleOpenAuth = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'showcase': return (
        <ShowcasePage 
          onOpenAuth={handleOpenAuth} 
          onNavigate={setActivePage}
        />
      );
      case 'ebook': return <EbookPage onOpenAuth={handleOpenAuth} />;
      case 'prompt': return <PromptPage onOpenAuth={handleOpenAuth} />;
      case 'service': return <ServicePage />;
      case 'about': return <AboutPage />;
      case 'contact': return <ContactPage />;
      case 'faq': return <FAQPage />;
      case 'recommended': return <RecommendedSitesPage />;
      case 'user-dashboard': return <UserDashboard />;
      case 'admin-dashboard': return <AdminDashboard />;
      case 'advanced-materials': return <AdvancedMaterialsPage />;
      default: return (
        <ShowcasePage 
          onOpenAuth={handleOpenAuth} 
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
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer shrink-0" 
              onClick={() => setActivePage('showcase')}
            >
              <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-lg transition-colors">
                <Layout className="w-5 h-5" />
              </div>
              <span className={`text-xl font-black tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>방구석 작곡가</span>
            </div>

            {/* Desktop Nav Links */}
            <div className={`hidden lg:flex items-center justify-center flex-1 px-8 gap-6 xl:gap-10 text-sm font-bold transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
               {navItems.map((item) => (
                 <button
                   key={item.id}
                   onClick={() => setActivePage(item.id)}
                   className={`transition-colors whitespace-nowrap ${activePage === item.id ? (isDarkMode ? 'text-white' : 'text-black') : (isDarkMode ? 'hover:text-white' : 'hover:text-black')}`}
                 >
                   {item.label}
                 </button>
               ))}
            </div>

            {/* Icons / Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
               {/* Tier Badge */}
               <button
                 onClick={() => {
                   if (!user) {
                     setIsAuthModalOpen(true);
                   } else {
                     setActivePage('user-dashboard');
                   }
                 }}
                 className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                   user?.tier === 'gold' || user?.role === 'admin'
                     ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' 
                     : user?.tier === 'silver'
                     ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                     : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                 }`}
               >
                 {user?.tier === 'gold' || user?.role === 'admin' ? <Crown className="w-4 h-4" /> : user?.tier === 'silver' ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                 {user?.role === 'admin' ? '관리자' : user?.tier === 'gold' ? '골드 회원' : user?.tier === 'silver' ? '실버 회원' : user ? '무료 회원' : '로그인 필요'}
               </button>

                {/* User Auth Buttons */}
                {user ? (
                  <div className="hidden md:flex items-center gap-2">
                    {user.role === 'admin' && (
                      <button
                        onClick={() => setActivePage('admin-dashboard')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${activePage === 'admin-dashboard' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                      >
                        관리자
                      </button>
                    )}
                    {user.tier === 'gold' && (
                      <button
                        onClick={() => setActivePage('advanced-materials')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${activePage === 'advanced-materials' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                      >
                        고급 자료실
                      </button>
                    )}
                    <button
                      onClick={() => setActivePage('user-dashboard')}
                      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${activePage === 'user-dashboard' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-black overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {user.name}님
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-[#020408]">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setIsSettingsModalOpen(true)}
                      className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}
                      title="계정 설정"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setActivePage('showcase');
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-red-400' : 'text-gray-500 hover:bg-gray-100 hover:text-red-500'}`}
                      title="로그아웃"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                 <button
                   onClick={() => setIsAuthModalOpen(true)}
                   className={`hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                     isDarkMode 
                       ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                       : 'bg-purple-600 hover:bg-purple-700 text-white'
                   }`}
                 >
                   <UserIcon className="w-4 h-4" />
                   로그인
                 </button>
               )}

               {/* Theme Toggle Button */}
               <button
                 onClick={() => setIsDarkMode(!isDarkMode)}
                 className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                 aria-label="Toggle theme"
               >
                 {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>

               <button 
                 onClick={() => window.open('https://kmong.com/self-marketing/730531/ZQh4nXZpK5', '_blank')}
                 className={`hidden md:block px-5 py-2 rounded-full text-sm font-bold transition-colors ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
               >
                 크몽 구매하기
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
              {/* Mobile User Auth */}
              {user ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setActivePage('user-dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`relative flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold ${activePage === 'user-dashboard' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : (isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700')}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-black overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {user.name}님 마이페이지
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-4 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <Settings className="w-5 h-5" />
                    계정 설정
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setActivePage('admin-dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold ${activePage === 'admin-dashboard' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : (isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700')}`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                      관리자 대시보드
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setActivePage('showcase');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500'}`}
                  >
                    <LogOut className="w-5 h-5" />
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-all bg-purple-600 text-white hover:bg-purple-700"
                >
                  <UserIcon className="w-5 h-5" />
                  로그인 / 회원가입
                </button>
              )}

              {/* Mobile Tier Badge */}
              <button
                onClick={() => {
                  if (!user) {
                    setIsAuthModalOpen(true);
                  } else {
                    setActivePage('user-dashboard');
                  }
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-all ${
                  user?.tier === 'gold' || user?.role === 'admin'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' 
                    : user?.tier === 'silver'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}
              >
                {user?.tier === 'gold' || user?.role === 'admin' ? <Crown className="w-5 h-5" /> : user?.tier === 'silver' ? <ShieldCheck className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                {user?.role === 'admin' ? '관리자' : user?.tier === 'gold' ? '골드 회원' : user?.tier === 'silver' ? '실버 회원' : user ? '무료 회원' : '로그인 필요'}
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
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
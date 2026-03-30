import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Settings, Heart, Clock, ShieldCheck, Calendar, Mail, Send, Trash2, ChevronRight, X } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SettingsModal } from '../components/SettingsModal';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.id,
        email: user?.email,
        role: user?.role
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  useEffect(() => {
    if (!user) return;

    console.log('Fetching messages for user:', user.id);
    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoadingMessages(false);
    }, (error) => {
      handleFirestoreError(error, 'get', 'messages');
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleReadMessage = async (msg: any) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        await updateDoc(doc(db, 'messages', msg.id), { isRead: true });
      } catch (err) {
        handleFirestoreError(err, 'update', `messages/${msg.id}`);
      }
    }
  };

  const handleDeleteMessage = async (msgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('이 쪽지를 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'messages', msgId));
      if (selectedMessage?.id === msgId) setSelectedMessage(null);
    } catch (err) {
      handleFirestoreError(err, 'delete', `messages/${msgId}`);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-500 dark:text-gray-400">마이페이지를 보려면 먼저 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
          <UserIcon className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">마이페이지</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                {user.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 mt-2 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    관리자
                  </span>
                )}
              </div>
            </div>

            {/* Subscription Status */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300">회원전용 사용 기간</h3>
              </div>
              <p className={`text-sm font-bold ${
                user.role === 'admin' 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : (user.subscriptionEndDate && new Date(user.subscriptionEndDate) >= new Date() 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-red-500')
              }`}>
                {user.role === 'admin' 
                  ? '무제한 (관리자)' 
                  : (user.subscriptionEndDate 
                      ? `${new Date(user.subscriptionEndDate).toLocaleDateString()} 까지` 
                      : '구독 필요')}
              </p>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-gray-400" />
                  계정 설정
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">찜한 자료</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">관심있는 프롬프트와 전자책을 모아보세요.</p>
                <span className="text-2xl font-black">0<span className="text-sm font-medium text-gray-500 ml-1">개</span></span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">최근 본 콘텐츠</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">최근에 열람한 자료들을 다시 확인하세요.</p>
                <span className="text-2xl font-black">0<span className="text-sm font-medium text-gray-500 ml-1">개</span></span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                쪽지함
                {messages.filter(m => !m.isRead).length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {messages.filter(m => !m.isRead).length}
                  </span>
                )}
              </h3>
            </div>

            <div className="space-y-3">
              {loadingMessages ? (
                <div className="text-center py-8 text-gray-500 text-sm">로딩 중...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                  받은 쪽지가 없습니다.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      onClick={() => handleReadMessage(msg)}
                      className={`group p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl flex items-center justify-between ${!msg.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!msg.isRead ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className={`text-sm truncate ${!msg.isRead ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            {msg.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => handleDeleteMessage(msg.id, e)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">내 활동 내역</h3>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
              아직 활동 내역이 없습니다.
            </div>
          </div>
        </div>
      </div>

      {/* Message View Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                쪽지 확인
              </h2>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">발신일: {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedMessage.title}</h3>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap min-h-[150px]">
                {selectedMessage.content}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

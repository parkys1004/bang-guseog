import React, { useState, useEffect } from 'react';
import { X, User, Lock, Shield, Trash2, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, updateProfileInfo, updatePasswordValue, deleteAccount, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'account'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateProfileInfo(name);
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updatePasswordValue(currentPassword, newPassword);
      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '탈퇴합니다') return;
    setLoading(true);
    setError(null);
    try {
      await deleteAccount();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: '프로필 수정', icon: User },
    { id: 'password', label: '비밀번호 관리', icon: Lock },
    { id: 'account', label: '계정 설정', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0d1117] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
      >
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-[#161b22] border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col">
            <div className="mb-8">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                계정 설정
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-bold">Account Settings</p>
            </div>

            <nav className="space-y-2 flex-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            <button 
              onClick={logout}
              className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl overflow-hidden">
                      {photoURL ? (
                        <img src={photoURL} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">이름</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-blue-500 outline-none transition-all dark:text-white"
                          placeholder="이름을 입력하세요"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                      {loading ? '저장 중...' : '프로필 저장'}
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'password' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
                    비밀번호를 변경하려면 현재 비밀번호 확인이 필요합니다. 
                    소셜 로그인(구글 등) 사용자는 비밀번호를 설정할 수 없습니다.
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">현재 비밀번호</label>
                      <input 
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all dark:text-white"
                        placeholder="현재 비밀번호를 입력하세요"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">새 비밀번호</label>
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all dark:text-white"
                        placeholder="새 비밀번호 (6자리 이상)"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">새 비밀번호 확인</label>
                      <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all dark:text-white"
                        placeholder="새 비밀번호를 다시 입력하세요"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={loading || !currentPassword || !newPassword}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                      {loading ? '변경 중...' : '비밀번호 변경'}
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  {/* Linked Accounts */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">연동된 계정</h4>
                    <div className="p-4 bg-gray-50 dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 flex items-center justify-center shadow-sm">
                          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Google 계정</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.providerId === 'google.com' ? '연결됨' : '연결되지 않음'}
                          </p>
                        </div>
                      </div>
                      {user?.providerId === 'google.com' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <button className="text-xs font-bold text-blue-600 hover:underline">연결하기</button>
                      )}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4">위험 구역</h4>
                    {!showDeleteConfirm ? (
                      <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                            <Trash2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">계정 탈퇴</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                              계정을 탈퇴하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다. 
                              구독 정보, 메시지, 프로필 설정 등이 모두 삭제됩니다.
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowDeleteConfirm(true)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all"
                        >
                          계정 탈퇴하기
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl space-y-4">
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">정말로 탈퇴하시겠습니까?</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          확인을 위해 아래에 <span className="font-black text-red-500">"탈퇴합니다"</span>를 입력해주세요.
                        </p>
                        <input 
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="w-full bg-white dark:bg-[#0d1117] border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none transition-all dark:text-white"
                          placeholder="탈퇴합니다"
                        />
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl transition-all"
                          >
                            취소
                          </button>
                          <button 
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmText !== '탈퇴합니다' || loading}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                          >
                            {loading ? '처리 중...' : '영구 탈퇴'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

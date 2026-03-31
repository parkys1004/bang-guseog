import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResendBtn, setShowResendBtn] = useState(false);
  const { login, signup, loginWithGoogle, resetPassword, resendVerificationEmail } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const trimmedEmail = email.trim();
      
      if (isResetPassword) {
        if (!trimmedEmail) throw new Error('이메일을 입력해주세요.');
        await resetPassword(trimmedEmail);
        setSuccess('비밀번호 재설정 링크가 이메일로 발송되었습니다.');
        setError('');
        setIsResetPassword(false);
        setIsLogin(true);
        setShowResendBtn(false);
      } else if (isLogin) {
        await login(trimmedEmail, password);
        onClose(); // Close modal on success
      } else {
        const trimmedName = name.trim();
        if (!trimmedName) throw new Error('이름을 입력해주세요.');
        await signup(trimmedEmail, password, trimmedName);
        onClose(); // Close modal on success
      }
    } catch (err: any) {
      if (err.message === '가입하신 이메일로 인증 메일이 발송되었습니다. 이메일 인증 후 로그인해주세요.') {
        setSuccess(err.message);
        setIsLogin(true);
        setError('');
        setShowResendBtn(false);
      } else {
        setError(err.message || '오류가 발생했습니다.');
        setSuccess('');
        if (err.message.includes('이메일 인증이 완료되지 않았습니다')) {
          setShowResendBtn(true);
        } else {
          setShowResendBtn(false);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError('');
    try {
      await resendVerificationEmail(email.trim(), password);
      setSuccess('인증 메일이 재전송되었습니다. 메일함을 확인해주세요.');
      setShowResendBtn(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    
    // Check for in-app browser (KakaoTalk, Instagram, Facebook, Naver, Line, etc.)
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isInApp = /FBAN|FBAV|Instagram|KAKAOTALK|Line|NAVER|Daum/i.test(ua);
                    
    if (isInApp) {
      setError('앱 내장 브라우저(카카오톡 등)에서는 구글 로그인을 지원하지 않습니다. 우측 하단/상단의 메뉴를 눌러 "다른 브라우저로 열기"(사파리, 크롬 등)를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || '구글 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#11141d] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            {isResetPassword ? '비밀번호 찾기' : (isLogin ? '로그인' : '회원가입')}
          </h2>
          <button 
            onClick={() => {
              onClose();
              setIsResetPassword(false);
              setIsLogin(true);
              setError('');
              setSuccess('');
              setShowResendBtn(false);
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-900/50 flex flex-col gap-2">
              <span>{error}</span>
              {showResendBtn && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="self-start px-3 py-1.5 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
                >
                  인증 메일 재전송
                </button>
              )}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium border border-green-100 dark:border-green-900/50">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isResetPassword && (
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">이름</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="홍길동"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">이메일</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {!isResetPassword && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">비밀번호</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetPassword(true);
                        setError('');
                        setSuccess('');
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      비밀번호를 잊으셨나요?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors mt-6 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isResetPassword ? '비밀번호 재설정 링크 보내기' : (isLogin ? '로그인' : '회원가입')
              )}
            </button>
          </form>

          {/* Divider */}
          {!isResetPassword && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#11141d] px-2 text-gray-500 dark:text-gray-400 font-bold">또는</span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white font-bold rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 로그인
              </button>
            </>
          )}

          {/* Toggle Login/Signup/Reset */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {isResetPassword ? (
              <button
                onClick={() => {
                  setIsResetPassword(false);
                  setIsLogin(true);
                  setError('');
                  setSuccess('');
                  setShowResendBtn(false);
                }}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                로그인으로 돌아가기
              </button>
            ) : (
              <>
                {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccess('');
                    setShowResendBtn(false);
                  }}
                  className="ml-2 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {isLogin ? '회원가입' : '로그인'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

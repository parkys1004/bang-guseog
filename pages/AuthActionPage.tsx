import React, { useEffect, useState } from 'react';
import { ShieldCheck, Mail, AlertCircle, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'motion/react';

export const AuthActionPage: React.FC = () => {
  const [mode, setMode] = useState<string | null>(null);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    const oobCodeParam = urlParams.get('oobCode');

    setMode(modeParam);
    setOobCode(oobCodeParam);

    if (!modeParam || !oobCodeParam) {
      setStatus('error');
      setMessage('유효하지 않은 요청입니다. 링크를 다시 확인해주세요.');
      return;
    }

    if (modeParam === 'verifyEmail') {
      handleVerifyEmail(oobCodeParam);
    } else if (modeParam === 'resetPassword') {
      handleCheckResetCode(oobCodeParam);
    }
  }, []);

  const handleVerifyEmail = async (code: string) => {
    try {
      await applyActionCode(auth, code);
      setStatus('success');
      setMessage('이메일 인증이 완료되었습니다. 이제 모든 서비스를 이용하실 수 있습니다.');
    } catch (error: any) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage(getKoreanErrorMessage(error.code) || '이메일 인증 중 오류가 발생했습니다. 이미 인증되었거나 만료된 링크일 수 있습니다.');
    }
  };

  const handleCheckResetCode = async (code: string) => {
    try {
      await verifyPasswordResetCode(auth, code);
      setStatus('success');
    } catch (error: any) {
      console.error('Reset code error:', error);
      setStatus('error');
      setMessage('비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode || newPassword.length < 6) {
      setMessage('비밀번호는 최소 6자리 이상이어야 합니다.');
      return;
    }

    setIsResetting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      setMessage('비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해주세요.');
      setMode('verifyEmail'); // Show success view similar to email verification
    } catch (error: any) {
      setMessage(getKoreanErrorMessage(error.code) || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsResetting(false);
    }
  };

  const getKoreanErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/expired-action-code': return '링크가 만료되었습니다.';
      case 'auth/invalid-action-code': return '유효하지 않은 링크입니다.';
      case 'auth/user-disabled': return '비활성화된 계정입니다.';
      case 'auth/user-not-found': return '사용자를 찾을 수 없습니다.';
      case 'auth/weak-password': return '비밀번호가 너무 취약합니다.';
      default: return null;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#11141d] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 max-w-lg w-full text-center"
      >
        {status === 'loading' && (
          <div className="py-12">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">요청을 처리 중입니다...</h2>
          </div>
        )}

        {status === 'success' && mode === 'verifyEmail' && (
          <div className="py-8">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-8 mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">인증 완료!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg leading-relaxed">
              {message}
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-4 bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl"
            >
              메인으로 이동하기
            </button>
          </div>
        )}

        {status === 'success' && mode === 'resetPassword' && (
          <div className="py-8 text-left">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-8 mx-auto">
              <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">새 비밀번호 설정</h2>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">새로운 비밀번호</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="최소 6자리 이상"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isResetting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all disabled:opacity-50 mt-4"
              >
                {isResetting ? '처리 중...' : '비밀번호 변경 완료'}
              </button>
            </form>
            {message && (
              <p className="mt-4 text-sm text-red-500 font-bold text-center">{message}</p>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="py-8">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-8 mx-auto">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">문제가 발생했습니다</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg leading-relaxed">
              {message}
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-black rounded-2xl transition-all"
            >
              메인으로 돌아가기
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

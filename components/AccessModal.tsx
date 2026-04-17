import React from 'react';
import { X, Lock, Clock, ExternalLink, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'expired' | 'tier-low' | 'login-required';
  requiredTier?: string;
}

export const AccessModal: React.FC<AccessModalProps> = ({ isOpen, onClose, type, requiredTier }) => {
  if (!isOpen) return null;

  const getTitle = () => {
    if (type === 'expired') return '이용 기간 만료';
    if (type === 'tier-low') return '접근 권한 부족';
    return '로그인 필요';
  };

  const getMessage = () => {
    if (type === 'expired') return '회원님의 이용 기간이 만료되었습니다. 계속 이용하시려면 기간 연장이 필요합니다.';
    if (type === 'tier-low') return `${requiredTier === 'gold' ? '골드' : '실버'} 등급 이상 회원만 열람 가능한 자료입니다. 등급을 업그레이드 해주세요.`;
    return '이 자료를 열람하려면 로그인이 필요합니다.';
  };

  const getIcon = () => {
    if (type === 'expired') return <Clock className="w-12 h-12 text-red-500" />;
    return <Lock className="w-12 h-12 text-amber-500" />;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#11141d] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
        >
          <div className="relative p-8 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                {getIcon()}
              </div>
            </div>

            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
              {getTitle()}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {getMessage()}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.open('https://kmong.com/self-marketing/730531/ZQh4nXZpK5', '_blank')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                이용권 구매/연장하기
                <ExternalLink className="w-4 h-4" />
              </button>
              
              <a
                href="https://open.kakao.com/o/paYcDloi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <MessageCircle className="w-5 h-5" />
                카카오톡 1:1 문의
              </a>
            </div>

            <button
              onClick={onClose}
              className="mt-6 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

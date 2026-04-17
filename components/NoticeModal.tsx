import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#11141d] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-red-500/30"
        >
          <div className="relative p-8 text-center pt-12">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full animate-pulse">
                <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-500" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
              안내 말씀 드립니다
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed font-medium bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
              현재 <strong className="text-red-500">보안 강화 작업</strong>으로 인해<br/>
              일부 웹빌더 앱의 접속이<br/>
              일시적으로 제한됩니다.
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              보다 안전한 서비스 제공을 위한 조치이오니<br/>이용자 여러분의 너른 양해 부탁드립니다.
            </p>

            <button
              onClick={onClose}
              className="w-full py-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold rounded-2xl transition-all shadow-lg"
            >
              확인했습니다
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

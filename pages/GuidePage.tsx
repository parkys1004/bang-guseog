import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Key, Shield, Clock, CheckCircle, HelpCircle } from 'lucide-react';

export const GuidePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#020408] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            방구석 작곡가 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">이용 가이드</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            서비스를 100% 활용하기 위한 단계별 가이드를 확인해 보세요.
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 dark:bg-[#11141d] rounded-3xl p-8 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xl">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-500" />
                  회원가입 및 등급 안내
                </h3>
                <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  <p>
                    방구석 작곡가에 회원가입(이메일 또는 구글 로그인)을 하시면 자동으로 <strong className="text-gray-900 dark:text-white">실버(Silver) 등급</strong>이 부여됩니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>가입 즉시 <strong className="text-gray-900 dark:text-white">1일(24시간)</strong> 동안 실버 등급 전용 자료를 열람할 수 있습니다.</li>
                    <li>기간이 만료되면 무료(Free) 자료만 열람 가능합니다.</li>
                    <li>추가 이용을 원하실 경우 관리자에게 문의해 주세요.</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-50 dark:bg-[#11141d] rounded-3xl p-8 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-black text-xl">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Key className="w-6 h-6 text-purple-500" />
                  마스터 비밀번호 확인
                </h3>
                <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  <p>
                    자료 열람 시 필요한 <strong>마스터 비밀번호</strong>는 가입 시 자동으로 발송되는 환영 쪽지에서 확인할 수 있습니다.
                  </p>
                  <div className="bg-white dark:bg-[#0d1117] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                    <ol className="list-decimal list-inside space-y-2">
                      <li>우측 상단의 <strong>마이페이지(사람 아이콘)</strong> 클릭</li>
                      <li><strong>받은 쪽지함</strong> 메뉴 선택</li>
                      <li>관리자가 보낸 환영 쪽지 클릭 후 비밀번호 확인</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 dark:bg-[#11141d] rounded-3xl p-8 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  자료 열람 방법
                </h3>
                <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  <p>
                    확인하신 마스터 비밀번호를 사용하여 다양한 자료를 열람해 보세요.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>원하는 자료의 <strong>'자료 보기'</strong> 버튼 클릭</li>
                    <li>비밀번호 입력창에 환영 쪽지에서 확인한 <strong>마스터 비밀번호</strong> 입력</li>
                    <li>비밀번호가 일치하면 자료 내용이 표시됩니다.</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 dark:bg-[#11141d] rounded-3xl p-8 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-xl">
                4
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-amber-500" />
                  문의 사항
                </h3>
                <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  <p>
                    이용 중 궁금한 점이나 문제가 발생하면 언제든 문의해 주세요.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>화면 우측 하단의 <strong>카카오톡 아이콘</strong>을 클릭하여 1:1 오픈채팅으로 문의</li>
                    <li>마이페이지의 <strong>쪽지 보내기</strong> 기능을 통해 관리자에게 문의</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

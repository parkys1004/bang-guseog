import React from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#020408] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            개인정보의 수집 및 이용 목적
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            방구석 작곡가 서비스의 개인정보처리방침을 안내해 드립니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-blue dark:prose-invert max-w-none bg-gray-50 dark:bg-[#11141d] p-8 rounded-3xl border border-gray-100 dark:border-gray-800"
        >
          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. 개인정보의 수집 및 이용 목적</h2>
              <p>방구석 작곡가(이하 "서비스")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 사전 동의를 구하는 등 필요한 조치를 이행할 예정입니다.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인, 연령확인, 불만처리 등 민원처리, 고지사항 전달</li>
                <li>서비스 제공: 콘텐츠 제공, 맞춤형 서비스 제공, 본인인증</li>
                <li>마케팅 및 광고에의 활용: 신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. 수집하는 개인정보의 항목</h2>
              <p>서비스는 회원가입, 원활한 고객상담, 각종 서비스의 제공을 위해 최초 회원가입 당시 아래와 같은 개인정보를 수집하고 있습니다.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>필수항목: 이메일 주소, 비밀번호, 이름(닉네임)</li>
                <li>선택항목: 프로필 이미지</li>
                <li>자동수집항목: 서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. 개인정보의 보유 및 이용기간</h2>
              <p>원칙적으로, 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>보존 항목: 회원가입정보(이메일, 이름)</li>
                <li>보존 근거: 서비스 이용의 혼선 방지 및 불법적 사용자에 대한 관련 기관 수사 협조</li>
                <li>보존 기간: 회원탈퇴 후 30일</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. 개인정보의 파기절차 및 방법</h2>
              <p>이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다. 파기절차 및 방법은 다음과 같습니다.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>파기절차: 이용자가 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장된 후 파기됩니다.</li>
                <li>파기방법: 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. 정보주체의 권리, 의무 및 그 행사방법</h2>
              <p>이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>자신 및 14세 미만 아동의 개인정보의 조회, 수정 및 가입해지의 요청</li>
                <li>개인정보의 오류에 대한 정정 및 삭제의 요청</li>
                <li>개인정보의 처리정지 요구</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

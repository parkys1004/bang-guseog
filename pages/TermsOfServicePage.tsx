import React from 'react';
import { motion } from 'motion/react';
import { FileText } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#020408] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl mb-6">
            <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            이용약관
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            방구석 작곡가 서비스 이용을 위한 약관을 안내해 드립니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-purple dark:prose-invert max-w-none bg-gray-50 dark:bg-[#11141d] p-8 rounded-3xl border border-gray-100 dark:border-gray-800"
        >
          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 1 조 (목적)</h2>
              <p>본 약관은 방구석 작곡가(이하 "서비스"라 합니다)가 제공하는 제반 서비스의 이용과 관련하여 서비스와 회원과의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 2 조 (정의)</h2>
              <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>"서비스"라 함은 구현되는 단말기(PC, TV, 휴대형단말기 등의 각종 유무선 장치를 포함)와 상관없이 "회원"이 이용할 수 있는 방구석 작곡가 관련 제반 서비스를 의미합니다.</li>
                <li>"회원"이라 함은 서비스에 접속하여 본 약관에 따라 서비스와 이용계약을 체결하고 서비스가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
                <li>"아이디(ID)"라 함은 "회원"의 식별과 "서비스" 이용을 위하여 "회원"이 정하고 "서비스"가 승인하는 문자와 숫자의 조합(이메일 주소 등)을 의미합니다.</li>
                <li>"비밀번호"라 함은 "회원"이 부여 받은 "아이디와 일치되는 "회원"임을 확인하고 비밀보호를 위해 "회원" 자신이 정한 문자 또는 숫자의 조합을 의미합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 3 조 (약관의 게시와 개정)</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>"서비스"는 이 약관의 내용을 "회원"이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
                <li>"서비스"는 "약관의규제에관한법률", "정보통신망이용촉진및정보보호등에관한법률(이하 "정보통신망법")" 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
                <li>"서비스"가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 제1항의 방식에 따라 그 개정약관의 적용일자 7일 전부터 적용일자 전일까지 공지합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 4 조 (회원가입 및 등급)</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>회원가입은 "회원"이 되고자 하는 자가 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고 "서비스"가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</li>
                <li>신규 회원가입 시 자동으로 '실버(Silver)' 등급이 부여되며, 가입 시점으로부터 24시간 동안 실버 등급 전용 자료를 열람할 수 있는 권한이 제공됩니다.</li>
                <li>기간 만료 후에는 기본 등급인 '무료(Free)' 등급으로 전환되며, 추가 이용을 원할 경우 별도의 절차를 통해 등급을 갱신할 수 있습니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 5 조 (회원의 의무)</h2>
              <p>"회원"은 다음 행위를 하여서는 안 됩니다.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>신청 또는 변경 시 허위내용의 등록</li>
                <li>타인의 정보도용</li>
                <li>"서비스"가 게시한 정보의 변경</li>
                <li>"서비스"가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>"서비스"와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>"서비스" 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 "서비스"에 공개 또는 게시하는 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 6 조 (서비스의 제공 등)</h2>
              <p>"서비스"는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다. 다만, "서비스"는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

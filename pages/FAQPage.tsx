import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: '어떤 서비스인가요?',
    answer: 'AI 마스터를 위한 다양한 자료(웹빌더 앱, 전자책, 프롬프트 등)를 제공하는 플랫폼입니다. AI 활용 능력을 높이고 실무에 바로 적용할 수 있는 유용한 콘텐츠를 큐레이션하여 제공합니다.'
  },
  {
    question: '회원 등급은 어떻게 되나요?',
    answer: '회원 등급은 무료(Free), 실버(Silver), 골드(Gold) 등급으로 나뉩니다. 각 등급에 따라 열람할 수 있는 자료의 종류와 범위가 다릅니다. 마이페이지에서 본인의 현재 등급을 확인할 수 있습니다.'
  },
  {
    question: '자료는 어떻게 볼 수 있나요?',
    answer: '상단 메뉴의 [고급 자료], [전자책], [프롬프트] 등 각 카테고리에서 원하는 자료를 클릭하시면 됩니다. 프롬프트는 클릭 시 바로 내용을 확인할 수 있으며, 다른 자료들은 해당 링크로 이동하여 볼 수 있습니다. 단, 본인의 등급에 맞는 자료만 열람 가능합니다.'
  },
  {
    question: '구글 로그인 연동은 어떻게 하나요?',
    answer: '이메일로 가입하신 후, [마이페이지] > [계정 설정] 버튼을 클릭하여 설정 모달창을 엽니다. "계정 설정" 탭에서 구글 계정을 간편하게 연결하거나 해제할 수 있습니다.'
  },
  {
    question: '비밀번호를 변경하고 싶어요.',
    answer: '[마이페이지] > [계정 설정] 버튼을 클릭한 후, "비밀번호 관리" 탭에서 현재 비밀번호와 새 비밀번호를 입력하여 변경할 수 있습니다. 단, 구글 소셜 로그인으로만 가입하신 경우에는 비밀번호를 설정/변경할 수 없습니다.'
  },
  {
    question: '관리자에게 문의하고 싶어요.',
    answer: '아래의 [문의하기] 버튼을 눌러 이메일로 문의해 주시거나, 추후 업데이트될 1:1 문의 기능을 이용해 주세요. 관리자가 발송한 쪽지는 마이페이지의 쪽지함에서 확인할 수 있습니다.'
  }
];

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="animate-in fade-in duration-500 bg-gray-50 dark:bg-[#020408] min-h-screen transition-colors duration-300 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            자주 묻는 질문
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            방구석 작곡가 서비스에 대해 궁금하신 점을 확인해 보세요.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-[#0a0c12] border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md dark:shadow-none"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left bg-transparent focus:outline-none"
              >
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {faq.question}
                </span>
                <div className={`ml-4 flex-shrink-0 p-2 rounded-full transition-colors ${openIndex === index ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-6 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800/50 mt-2">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Prompt */}
        <div className="mt-16 text-center p-8 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            원하는 답변을 찾지 못하셨나요?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            언제든지 문의해 주시면 친절하게 답변해 드리겠습니다.
          </p>
          <button 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
            onClick={() => window.location.href = 'mailto:contact@example.com'}
          >
            문의하기
          </button>
        </div>

      </div>
    </div>
  );
};

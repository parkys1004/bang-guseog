import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Suno V5 PRO는 무엇인가요?',
    answer: 'Suno V5 PRO는 AI를 활용하여 누구나 쉽게 전문가 수준의 음악을 작곡하고 제작할 수 있도록 돕는 프리미엄 가이드 및 도구 모음입니다. 다양한 장르의 프롬프트 템플릿과 고급 활용법을 제공합니다.'
  },
  {
    question: 'PRO 인증은 어떻게 하나요?',
    answer: '상단 메뉴의 [PRO 인증] 버튼을 클릭하여 발급받으신 비밀번호를 입력하시면 PRO 콘텐츠(회원전용)를 열람하실 수 있습니다.'
  },
  {
    question: '전자책은 어떻게 구매할 수 있나요?',
    answer: '상단의 [전자책] 메뉴를 클릭하시면 현재 제공 중인 가이드북 목록을 확인하실 수 있습니다. 각 항목을 클릭하여 상세 내용 및 구매 페이지로 이동할 수 있습니다.'
  },
  {
    question: '음악 저작권은 어떻게 되나요?',
    answer: 'Suno AI를 통해 생성된 음악의 저작권은 Suno의 공식 약관을 따릅니다. 유료 구독자의 경우 상업적 이용이 가능하지만, 무료 사용자의 경우 비상업적 용도로만 제한될 수 있습니다. 자세한 내용은 Suno 공식 홈페이지를 참고해 주세요.'
  },
  {
    question: 'AI Studio 웹빌더앱은 무엇인가요?',
    answer: 'AI Studio를 활용하여 코딩 지식 없이도 나만의 웹 애플리케이션을 만들 수 있는 도구입니다. 본 사이트 역시 AI Studio를 통해 제작되었습니다.'
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

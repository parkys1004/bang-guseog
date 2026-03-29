import React from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#020408] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div>
            <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">Contact Us</h2>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-8 leading-tight transition-colors">
                프로젝트에 대해<br/>
                이야기해볼까요?
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-12 transition-colors">
                새로운 프로젝트, 파트너십, 혹은 단순한 문의사항이 있으신가요?<br/>
                언제든 편하게 연락주세요. 24시간 이내에 회신드립니다.
            </p>

            <div className="space-y-8">
                <div className="flex items-start gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full text-gray-900 dark:text-white transition-colors">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 transition-colors">Email</h3>
                        <p className="text-gray-600 dark:text-gray-400 transition-colors">gandi11@nate.com</p>
                        <p className="text-gray-600 dark:text-gray-400 transition-colors">parkys1004@gmail.com</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full text-gray-900 dark:text-white transition-colors">
                        <Phone className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 transition-colors">Phone</h3>
                        <p className="text-gray-600 dark:text-gray-400 transition-colors">010.2547.3507</p>
                        <p className="text-gray-600 dark:text-gray-400 transition-colors">Mon-Fri, 9am - 6pm</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full text-gray-900 dark:text-white transition-colors">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 transition-colors">Office</h3>
                        <p className="text-gray-600 dark:text-gray-400 transition-colors">부산시 금정구 부곡3동</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Contact Form */}
        <div className="bg-gray-50 dark:bg-gray-900 p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">메시지 보내기</h3>
            <form className="space-y-6" action="mailto:gandi11@nate.com,parkys1004@gmail.com" method="post" encType="text/plain">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">이름</label>
                        <input 
                            type="text" 
                            name="name"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 outline-none transition-all"
                            placeholder="홍길동"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">이메일</label>
                        <input 
                            type="email" 
                            name="email"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 outline-none transition-all"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">문의 유형</label>
                    <select name="type" className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 outline-none transition-all">
                        <option>프로젝트 의뢰</option>
                        <option>견적 문의</option>
                        <option>채용 관련</option>
                        <option>기타</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">메시지</label>
                    <textarea 
                        name="message"
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 outline-none transition-all resize-none"
                        placeholder="프로젝트에 대한 간단한 설명을 적어주세요..."
                    ></textarea>
                </div>
                <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    문의하기
                </button>
            </form>
        </div>
      </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ExternalLink, Globe, Music, Image as ImageIcon, Video, Code, Disc, MessageSquare } from 'lucide-react';

interface Site {
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  category: string;
}

const recommendedSites: Site[] = [
  {
    name: 'ChatGPT',
    description: 'OpenAI의 대화형 AI 모델로, 작사, 아이디어 구상, 코드 작성 등 다양한 작업에 활용할 수 있습니다.',
    url: 'https://chatgpt.com',
    icon: <MessageSquare className="w-6 h-6" />,
    category: 'AI 챗봇'
  },
  {
    name: 'Gemini',
    description: 'Google의 강력한 AI 모델로, 방대한 정보 검색과 창의적인 글쓰기, 아이디어 발상에 탁월합니다.',
    url: 'https://gemini.google.com',
    icon: <MessageSquare className="w-6 h-6" />,
    category: 'AI 챗봇'
  },
  {
    name: 'NotebookLM',
    description: 'Google의 AI 기반 연구 및 글쓰기 어시스턴트로, 업로드한 문서를 바탕으로 정보를 요약하고 질문에 답변해줍니다.',
    url: 'https://notebooklm.google.com',
    icon: <MessageSquare className="w-6 h-6" />,
    category: 'AI 챗봇'
  },
  {
    name: 'Suno AI',
    description: '텍스트 프롬프트만으로 고품질의 음악과 보컬을 생성하는 AI 서비스입니다.',
    url: 'https://suno.com',
    icon: <Music className="w-6 h-6" />,
    category: 'AI 음악'
  },
  {
    name: 'Udio',
    description: 'Suno와 함께 주목받는 고품질 AI 음악 생성 플랫폼입니다.',
    url: 'https://www.udio.com',
    icon: <Music className="w-6 h-6" />,
    category: 'AI 음악'
  },
  {
    name: 'Minimax Music',
    description: '텍스트 프롬프트를 통해 고품질의 음악을 생성하는 혁신적인 AI 음악 플랫폼입니다.',
    url: 'https://www.minimax-music.com',
    icon: <Music className="w-6 h-6" />,
    category: 'AI 음악'
  },
  {
    name: 'Midjourney',
    description: '텍스트를 입력하면 고품질의 이미지를 생성해주는 AI 도구입니다. 앨범 커버 제작에 유용합니다.',
    url: 'https://www.midjourney.com',
    icon: <ImageIcon className="w-6 h-6" />,
    category: 'AI 이미지'
  },
  {
    name: 'Leonardo AI',
    description: '다양한 모델과 세밀한 제어 기능을 제공하여 컨셉 아트, 앨범 커버 제작에 탁월한 AI 이미지 생성 플랫폼입니다.',
    url: 'https://leonardo.ai',
    icon: <ImageIcon className="w-6 h-6" />,
    category: 'AI 이미지'
  },
  {
    name: 'Adobe Firefly',
    description: '안전한 상업적 사용이 가능하며, 포토샵 등 어도비 제품군과 강력하게 연동되는 생성형 AI 도구입니다.',
    url: 'https://firefly.adobe.com',
    icon: <ImageIcon className="w-6 h-6" />,
    category: 'AI 이미지'
  },
  {
    name: 'Runway',
    description: '텍스트나 이미지로 비디오를 생성하고 편집할 수 있는 강력한 AI 비디오 툴입니다.',
    url: 'https://runwayml.com',
    icon: <Video className="w-6 h-6" />,
    category: 'AI 비디오'
  },
  {
    name: 'Luma Dream Machine',
    description: '텍스트와 이미지로 고품질의 사실적인 비디오를 빠르고 쉽게 생성할 수 있는 차세대 AI 모델입니다.',
    url: 'https://lumalabs.ai/dream-machine',
    icon: <Video className="w-6 h-6" />,
    category: 'AI 비디오'
  },
  {
    name: 'Pika',
    description: '아이디어를 입력하면 3D 애니메이션, 시네마틱 영상 등 다양한 스타일의 비디오로 변환해주는 AI 플랫폼입니다.',
    url: 'https://pika.art',
    icon: <Video className="w-6 h-6" />,
    category: 'AI 비디오'
  },
  {
    name: 'Google AI Studio',
    description: 'Gemini 모델을 활용하여 프롬프트를 테스트하고 애플리케이션을 구축할 수 있는 플랫폼입니다.',
    url: 'https://aistudio.google.com',
    icon: <Code className="w-6 h-6" />,
    category: 'AI 개발'
  },
  {
    name: 'DistroKid',
    description: '저렴한 연회비로 무제한 음원 발매가 가능한 글로벌 음원 유통사입니다. 개인 작업자에게 가장 인기가 많습니다.',
    url: 'https://distrokid.com',
    icon: <Disc className="w-6 h-6" />,
    category: '음원 유통사'
  },
  {
    name: 'Ditto Music (디토뮤직)',
    description: '전 세계 160개 이상의 스트리밍 플랫폼에 음원을 유통하고 100% 로열티를 제공하는 글로벌 유통사입니다.',
    url: 'https://dittomusic.com',
    icon: <Disc className="w-6 h-6" />,
    category: '음원 유통사'
  },
  {
    name: 'TuneCore',
    description: '전 세계 주요 스트리밍 플랫폼에 음원을 배급하고 수익을 100% 창작자에게 지급하는 글로벌 유통 플랫폼입니다.',
    url: 'https://www.tunecore.com',
    icon: <Disc className="w-6 h-6" />,
    category: '음원 유통사'
  },
  {
    name: '비스킷 사운드 (Biscuit Sound)',
    description: '국내 인디 뮤지션과 개인 작곡가들이 접근하기 쉬운 국내 음원 유통사입니다. 멜론, 지니 등 국내외 플랫폼 발매를 지원합니다.',
    url: 'https://www.biscuitsound.net/',
    icon: <Disc className="w-6 h-6" />,
    category: '음원 유통사'
  },
  {
    name: '사운드프레스 (SoundPress)',
    description: '개인 창작자도 쉽게 국내외 음원 사이트에 앨범을 발매할 수 있도록 돕는 국내 음원 유통 서비스입니다.',
    url: 'https://sound-press.com/',
    icon: <Disc className="w-6 h-6" />,
    category: '음원 유통사'
  }
];

export const RecommendedSitesPage: React.FC = () => {
  // Group by category and sort according to desired order
  const desiredOrder = ['AI 음악', '음원 유통사', 'AI 챗봇'];
  const categories = Array.from(new Set(recommendedSites.map(site => site.category))).sort((a, b) => {
    const indexA = desiredOrder.indexOf(a);
    const indexB = desiredOrder.indexOf(b);
    
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0; // Keep original order for the rest
  });

  return (
    <div className="animate-in fade-in duration-500 bg-gray-50 dark:bg-[#020408] min-h-screen transition-colors duration-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-2xl mb-6">
            <Globe className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            추천 사이트
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            방구석 작곡가들이 활용하기 좋은 유용한 AI 도구와 리소스 사이트들을 모아두었습니다.
          </p>
        </div>

        {/* Sites Grid */}
        <div className="space-y-12">
          {categories.map(category => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedSites.filter(site => site.category === category).map((site, index) => (
                  <a 
                    key={index}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white dark:bg-[#0a0c12] border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-purple-200 dark:hover:border-purple-900/50 flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
                        {site.icon}
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {site.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-grow">
                      {site.description}
                    </p>
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/50 text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      사이트 방문하기
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

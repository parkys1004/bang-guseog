import { ContentItem, EbookItem } from './types';

export const AI_CONTENTS: ContentItem[] = [
  {
    id: '1',
    category: 'VERCEL',
    title: 'Suno Studio Pro V1.6',
    description: "기획, 구조, 가사, 프롬프트, 앨범아트 제작까지 한 번에 해결하는 통합 웹빌더입니다.",
    url: 'https://suno-studio-pro-kpop.vercel.app',
    isPro: true,
    posterUrl: 'https://picsum.photos/seed/seo/800/450'
  },
  {
    id: '2',
    category: 'VERCEL',
    title: '뮤직 아이디어 뱅크',
    description: "장르를 선택하면 AI가 제목, 가사, 그리고 스타일 프롬프트까지 자동생성(5개)",
    url: 'https://music-idea-bank.vercel.app/',
    isPro: true,
    posterUrl: 'https://picsum.photos/seed/scraper/800/450'
  },
  {
    id: '3',
    category: 'VERCEL',
    title: '프로페셔널 오디오 마스터링 의 혁신',
    description: "드래그 앤 드롭으로 지연 시간 없이 즉시 마스터링됩니다.",
    url: 'https://audio-mastering-ten.vercel.app/',
    isPro: false,
    posterUrl: 'https://picsum.photos/seed/scraper-basic/800/450'
  },
  {
    id: '4',
    category: 'AI STUDIO',
    title: '스펙트럼 스튜디오 Beta버전',
    description: "플레이리스트 제작도구, 스펙트럼과 효과가 들어간 MP4영상",
    url: 'https://spectrum-studio-3soh.vercel.app/',
    isPro: true,
    posterUrl: 'https://picsum.photos/seed/stock/800/450'
  },
  {
    id: '5',
    category: 'AI STUDIO',
    title: 'AI 커버곡 메이커',
    description: "원하는 목소리로 기존 곡을 커버해보세요. AI가 자연스러운 보컬 합성을 도와줍니다.",
    url: '#',
    isPro: true,
    posterUrl: 'https://picsum.photos/seed/cover/800/450'
  },
  {
    id: '6',
    category: 'VERCEL',
    title: '보컬 리무버 PRO',
    description: "음원에서 보컬과 반주를 깔끔하게 분리해주는 고성능 AI 도구입니다. 리믹스나 MR 제작에 최적화되어 있습니다.",
    url: '#',
    isPro: false,
    posterUrl: 'https://picsum.photos/seed/vocal/800/450'
  },
  {
    id: '7',
    category: 'AI STUDIO',
    title: '앨범아트 이미지 생성 웹빌더',
    description: "복잡한 프롬프트 없이 클릭만으로 고퀄리티 앨범 아트를 제작해보세요.",
    url: '#',
    isPro: true,
    posterUrl: 'https://ai.studio/apps/608a12c6-33d6-464c-b56e-d293bd2c68ff'
  },
  {
    id: '8',
    category: 'VERCEL',
    title: '유튜브 숏츠 자동 생성기',
    description: "제작한 음악을 바탕으로 유튜브 숏츠, 틱톡, 릴스용 세로형 비디오를 자동으로 만들어줍니다.",
    url: '#',
    isPro: false,
    posterUrl: 'https://picsum.photos/seed/shorts/800/450'
  }
];

export const EBOOK_CONTENTS: EbookItem[] = [
  {
    id: 'eb1',
    title: '당신의 첫 전자책, AI와 함께 시작해요!',
    description: '글쓰기가 두려운 당신을 위한 AI 활용 전자책 제작 완벽 가이드! 이 책은 아이디어 발굴부터 목차 구성, 초안 작...',
    coverUrl: 'https://picsum.photos/seed/ebook1/400/600',
    isPro: false,
    isFree: true,
    url: '#'
  },
  {
    id: 'eb2',
    title: '콘텐츠 크리에이터를 위한 AI 프롬프트 수익화 마스터 가이드',
    description: '콘텐츠 크리에이터를 위한 AI 수익화 완벽 가이드입니다. 최신 AI 모델 활용법과 프롬프트 엔지니어링 기법을 통...',
    coverUrl: 'https://picsum.photos/seed/ebook2/400/600',
    isPro: true,
    isFree: false,
    url: '#'
  },
  {
    id: 'eb3',
    title: 'MCP 실용 매뉴얼 - 인터랙티브 가이드',
    description: 'MCP의 핵심 개념과 아키텍처를 설명하고, Python 기반 서버 구축부터 Claude AI 연동, 보안 설정까지의 ...',
    coverUrl: 'https://picsum.photos/seed/ebook3/400/600',
    isPro: false,
    isFree: true,
    url: '#'
  },
  {
    id: 'eb4',
    title: '구글이 사랑하는 블로그 SEO 최적화 A to Z',
    description: '구글 상위 노출을 위한 SEO 최적화 가이드입니다. 최신 알고리즘의 핵심은 E-E-A-T(경험·전문성·권위·신뢰)...',
    coverUrl: 'https://picsum.photos/seed/ebook4/400/600',
    isPro: false,
    isFree: true,
    url: '#'
  }
];

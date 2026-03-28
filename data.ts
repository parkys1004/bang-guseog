import { ContentItem, EbookItem } from './types';

export const AI_CONTENTS: ContentItem[] = [
  {
    id: '1',
    category: 'VERCEL',
    title: 'Suno Studio Pro V1.6',
    description: "기획, 구조, 가사, 프롬프트, 앨범아트 제작까지 한 번에 해결하는 통합 웹빌더입니다.",
    url: 'https://suno-studio-pro-kpop.vercel.app',
    isPro: true,
    posterUrl: 'https://github.com/parkys1004/img/blob/main/bang-guseog/Suno%20Studio%20Pro%20V1.6.png?raw=true'
  },
  {
    id: '2',
    category: 'VERCEL',
    title: '뮤직 아이디어 뱅크',
    description: "장르를 선택하면 AI가 제목, 가사, 그리고 스타일 프롬프트까지 자동생성(5개)",
    url: 'https://music-idea-bank.vercel.app/',
    isPro: true,
    posterUrl: 'https://github.com/parkys1004/img/blob/main/bang-guseog/music-idea.png?raw=true'
  },
  {
    id: '3',
    category: 'VERCEL',
    title: '프로페셔널 오디오 마스터링',
    description: "드래그 앤 드롭으로 지연 시간 없이 즉시 마스터링됩니다.",
    url: 'https://audio-mastering-ten.vercel.app/',
    isPro: false,
    posterUrl: 'https://github.com/parkys1004/img/blob/main/bang-guseog/audio-mastering.png?raw=true'
  },
  {
    id: '4',
    category: 'VERCEL',
    title: '스펙트럼 스튜디오',
    description: "플레이리스트 제작도구, 스펙트럼과 효과가 들어간 MP4영상",
    url: 'https://spectrum-studio-3soh.vercel.app/',
    isPro: true,
    posterUrl: 'https://github.com/parkys1004/img/blob/main/bang-guseog/spectrum-studio.png?raw=true'
  },
  {
    id: '5',
    category: 'VERCEL',
    title: 'Spin CD Maker',
    description: "움직이는 cd 이미지 만들어주는 앱",
    url: 'https://spin-cd-maker.vercel.app/',
    isPro: true,
    posterUrl: 'https://github.com/parkys1004/img/blob/main/bang-guseog/Spin%20CD%20Maker.png?raw=true'
  },
  {
    id: '6',
    category: 'VERCEL',
    title: 'Suno AI 음악 생성기',
    description: "음악파일 생성까지 올일원 자동생성, 한번에 음악파일 최대20개(총40개)생성, 플레이리스트용",
    url: 'https://suno-auto-generation.vercel.app/',
    isPro: false,
    posterUrl: 'https://github.com/parkys1004/img/blob/main/bang-guseog/Suno%20AI%20%EC%9D%8C%EC%95%85%20%EC%83%9D%EC%84%B1%EA%B8%B0.png?raw=true'
  },
  {
    id: '7',
    category: 'VERCEL',
    title: '앨범아트 이미지 생성 웹빌더',
    description: "복잡한 프롬프트 없이 클릭만으로 고퀄리티 앨범 아트를 제작해보세요.",
    url: 'https://ai-album-art-builder.vercel.app/',
    isPro: true,
    posterUrl: 'https://github.com/parkys1004/img/blob/main/bang-guseog/New%20Album%20Cover.png?raw=true'
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
    title: 'AI MUSIC BUSINESS!',
    description: 'SUNO AI를 활용한 완벽한 수익 창출 시스템',
    coverUrl: 'https://github.com/parkys1004/img/blob/main/aimusic01.jpg?raw=true',
    isPro: true,
    isFree: false,
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
    isPro: true,
    isFree: false,
    url: '#'
  },
  {
    id: 'eb4',
    title: '구글이 사랑하는 블로그 SEO 최적화 A to Z',
    description: '구글 상위 노출을 위한 SEO 최적화 가이드입니다. 최신 알고리즘의 핵심은 E-E-A-T(경험·전문성·권위·신뢰)...',
    coverUrl: 'https://picsum.photos/seed/ebook4/400/600',
    isPro: true,
    isFree: false,
    url: '#'
  }
];

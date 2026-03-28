import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';

interface PromptItem {
  id: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
}

const PROMPTS: PromptItem[] = [
  { id: 'p1', category: '🎵 음악/가사', title: '감성적인 발라드 가사', description: '주제를 주면 1절, 후렴, 2절 구조의 감성적인 가사를 작성합니다.', prompt: '당신은 감성적인 발라드 작사가입니다. 다음 주제를 바탕으로 은유적이고 시적인 가사를 작성해주세요. [1절 - 프리코러스 - 코러스 - 2절 - 코러스 - 브릿지 - 아웃트로] 구조로 작성하며, 감정선이 점점 고조되도록 표현해주세요. 주제: ' },
  { id: 'p2', category: '🎵 음악/가사', title: 'K-Pop 아이돌 세계관 기획', description: '새로운 아이돌 그룹의 독창적인 컨셉과 세계관을 기획합니다.', prompt: '새로 데뷔할 K-Pop 아이돌 그룹의 세계관과 컨셉을 기획해주세요. 그룹명 후보 3개, 핵심 메시지, 멤버별 상징 요소, 데뷔곡의 시각적/청각적 컨셉을 포함하여 상세히 작성해주세요. 키워드: ' },
  { id: 'p3', category: '🎵 음악/가사', title: '트렌디한 랩 가사 및 라임', description: '특정 키워드를 활용해 펀치라인과 라임이 돋보이는 랩 가사를 씁니다.', prompt: '당신은 트렌디한 힙합 래퍼입니다. 다음 키워드를 활용하여 A-A-B-B 구조의 라임이 딱 떨어지는 랩 가사 16마디를 작성해주세요. 재치 있는 펀치라인을 최소 2개 이상 포함해주세요. 키워드: ' },
  { id: 'p4', category: '🎵 음악/가사', title: '시선을 끄는 곡 제목 아이디어', description: '음원 발매 시 대중의 이목을 끌 수 있는 매력적인 제목 후보를 생성합니다.', prompt: '다음 곡의 분위기와 가사 내용을 바탕으로, 대중의 호기심을 자극하고 스트리밍 플랫폼에서 클릭을 유도할 수 있는 매력적인 곡 제목 후보 10개를 제안해주세요. 곡 설명: ' },
  { id: 'p5', category: '🎬 유튜브/영상', title: '유튜브 쇼츠(Shorts) 대본', description: '60초 이내에 시청자를 사로잡는 숏폼 대본을 작성합니다.', prompt: '다음 주제로 60초 분량의 유튜브 쇼츠 대본을 작성해주세요. 첫 3초에 시선을 끄는 강력한 훅(Hook)으로 시작하고, 빠르고 간결한 템포로 정보를 전달한 뒤, 마지막에 구독과 좋아요를 유도하는 콜투액션(CTA)을 포함해주세요. 주제: ' },
  { id: 'p6', category: '🎬 유튜브/영상', title: '유튜브 영상 기획안 및 대본', description: '10분 내외의 롱폼 영상 기획안과 상세 대본 초안을 작성합니다.', prompt: '다음 주제로 10분 분량의 유튜브 영상 기획안을 작성해주세요. 영상의 타겟 시청자, 기획 의도, 썸네일 아이디어 3개, 그리고 [오프닝 - 본론 3가지 포인트 - 클로징] 구조의 상세 대본 초안을 포함해주세요. 주제: ' },
  { id: 'p7', category: '🎬 유튜브/영상', title: '클릭을 부르는 제목/썸네일', description: '조회수를 극대화할 수 있는 유튜브 제목과 썸네일 텍스트를 기획합니다.', prompt: '다음 영상 내용을 바탕으로, 클릭률(CTR)을 극대화할 수 있는 유튜브 제목 후보 10개와 썸네일에 들어갈 텍스트(3단어 이내) 후보 5개를 제안해주세요. 호기심을 자극하되 과도한 어그로는 피해주세요. 영상 내용: ' },
  { id: 'p8', category: '🎬 유튜브/영상', title: '시청자 소통 커뮤니티 게시글', description: '구독자와의 유대감을 높이는 유튜브 커뮤니티 투표/게시글을 작성합니다.', prompt: '유튜브 채널 구독자들과 소통하고 참여를 유도할 수 있는 커뮤니티 게시글 초안을 작성해주세요. 흥미로운 투표 주제와 함께, 댓글을 유도하는 친근한 톤앤매너로 작성해주세요. 채널 주제: ' },
  { id: 'p9', category: '📝 블로그/SEO', title: '구글 SEO 최적화 포스팅', description: '검색 엔진 상위 노출을 위한 구조화된 블로그 글을 작성합니다.', prompt: '당신은 SEO 전문가입니다. 다음 키워드를 활용하여 구글 검색 상위 노출에 최적화된 블로그 포스팅을 작성해주세요. H2, H3 태그를 적절히 사용하고, 서론에는 독자의 문제 공감을, 본론에는 해결책을, 결론에는 요약과 CTA를 포함해주세요. 메인 키워드: ' },
  { id: 'p10', category: '📝 블로그/SEO', title: '매력적인 블로그 서론(도입부)', description: '독자의 이탈을 막고 끝까지 읽게 만드는 서론을 작성합니다.', prompt: '다음 블로그 글의 주제를 바탕으로, 독자의 공감을 이끌어내고 끝까지 글을 읽고 싶게 만드는 매력적인 서론(도입부) 3가지를 다른 버전(질문형, 스토리텔링형, 통계제시형)으로 작성해주세요. 주제: ' },
  { id: 'p11', category: '📝 블로그/SEO', title: '전문적인 IT/테크 리뷰', description: '제품의 장단점을 객관적이고 전문적으로 분석하는 리뷰 글을 작성합니다.', prompt: '다음 IT/테크 제품에 대한 전문적인 리뷰 블로그 글을 작성해주세요. 제품의 주요 스펙, 디자인, 실사용 후기(장점과 단점 각각 3가지), 그리고 추천하는 대상(타겟 고객)을 명확히 나누어 설명해주세요. 제품명: ' },
  { id: 'p12', category: '📝 블로그/SEO', title: '정보성 글 개요(목차) 구성', description: '글쓰기 전 탄탄한 구조를 잡기 위한 블로그 목차를 기획합니다.', prompt: '다음 주제로 정보성 블로그 글을 작성하려고 합니다. 논리적이고 가독성 높은 글을 쓰기 위한 상세한 개요(목차)를 짜주세요. 각 목차 아래에 들어갈 핵심 내용도 1~2줄로 요약해주세요. 주제: ' },
  { id: 'p13', category: '📈 마케팅/카피', title: '인스타그램 릴스/게시물 캡션', description: '해시태그와 함께 인게이지먼트를 높이는 인스타 캡션을 작성합니다.', prompt: '다음 사진/영상 내용을 바탕으로 인스타그램 게시물 캡션을 작성해주세요. 트렌디하고 친근한 말투를 사용하고, 줄바꿈을 깔끔하게 하며, 댓글 참여를 유도하는 질문과 관련 해시태그 10개를 포함해주세요. 내용: ' },
  { id: 'p14', category: '📈 마케팅/카피', title: '전환율을 높이는 광고 카피', description: '페이스북/인스타그램 스폰서드 광고에 적합한 후킹 카피를 작성합니다.', prompt: '다음 제품/서비스를 홍보하기 위한 SNS 광고 카피를 작성해주세요. 타겟 고객의 페인포인트(Pain point)를 건드리는 후킹 문구, 제품의 핵심 소구점(USP), 그리고 명확한 행동 유도(CTA)를 포함하여 3가지 버전으로 제안해주세요. 제품/서비스: ' },
  { id: 'p15', category: '📈 마케팅/카피', title: '오픈율을 높이는 뉴스레터', description: '구독자가 클릭하고 싶게 만드는 이메일 제목과 본문을 작성합니다.', prompt: '다음 주제로 발송할 뉴스레터/이메일 마케팅 초안을 작성해주세요. 오픈율을 높일 수 있는 호기심 유발 제목 후보 5개와, 친근하면서도 전문적인 톤의 본문, 그리고 명확한 클릭 유도 버튼(CTA) 텍스트를 포함해주세요. 주제: ' },
  { id: 'p16', category: '📈 마케팅/카피', title: '상세페이지 PAS 프레임워크', description: '문제(Problem)-심화(Agitation)-해결(Solution) 구조의 설득 논리를 짭니다.', prompt: '다음 제품을 판매하기 위한 상세페이지 기획안을 PAS(Problem, Agitation, Solution) 프레임워크에 맞춰 작성해주세요. 고객이 겪고 있는 문제점, 그 문제로 인한 고통 심화, 그리고 우리 제품이 어떻게 완벽한 해결책이 되는지 논리적으로 전개해주세요. 제품: ' },
  { id: 'p17', category: '💡 아이디어/기획', title: '신규 비즈니스 브레인스토밍', description: '특정 산업이나 타겟을 위한 창의적인 비즈니스 아이디어를 도출합니다.', prompt: '다음 산업 분야에서 아직 해결되지 않은 고객의 불편함을 찾고, 이를 해결할 수 있는 혁신적인 신규 비즈니스/서비스 아이디어 5가지를 브레인스토밍 해주세요. 각 아이디어의 타겟 고객과 수익 모델도 간략히 설명해주세요. 산업 분야: ' },
  { id: 'p18', category: '💡 아이디어/기획', title: '타겟 고객(페르소나) 설정', description: '마케팅과 기획의 기준이 되는 구체적인 고객 페르소나를 설정합니다.', prompt: '다음 제품/서비스의 핵심 타겟 고객(바이어 페르소나)을 구체적으로 설정해주세요. 이름, 나이, 직업, 관심사, 주요 고민거리(Pain point), 구매 결정 기준, 주로 사용하는 SNS 채널을 포함하여 가상의 인물을 입체적으로 그려주세요. 제품/서비스: ' },
  { id: 'p19', category: '💡 아이디어/기획', title: '전자책(E-book) 목차 기획', description: '지식 창업을 위한 전자책의 매력적인 제목과 상세 목차를 기획합니다.', prompt: '다음 주제로 크몽, 탈잉 등에 판매할 전자책(E-book)을 기획하려고 합니다. 구매욕구를 자극하는 매력적인 메인 제목과 서브 타이틀, 그리고 서론-본론-결론으로 이어지는 상세한 목차(대목차, 중목차 포함)를 구성해주세요. 주제: ' },
  { id: 'p20', category: '💡 아이디어/기획', title: '1주일치 SNS 콘텐츠 캘린더', description: '꾸준한 업로드를 위한 요일별 SNS 콘텐츠 기획안을 작성합니다.', prompt: '다음 브랜드를 위한 1주일치(월~일) 인스타그램 콘텐츠 캘린더를 기획해주세요. 요일별로 정보성, 소통형, 제품 홍보, 비하인드 스토리 등 다양한 포맷을 배치하고, 각 게시물의 핵심 메시지와 이미지/영상 아이디어를 간략히 적어주세요. 브랜드: ' },
  { id: 'p21', category: '🎵 음악/가사', title: '앨범 소개글(보도자료) 작성', description: '음원 발매 시 스트리밍 사이트에 등록할 매력적인 앨범 소개글을 작성합니다.', prompt: '새로 발매할 음원의 앨범 소개글(보도자료)을 작성해주세요. 아티스트의 의도, 곡의 장르와 분위기, 감상 포인트 3가지를 포함하여 대중의 기대감을 높일 수 있는 전문적인 톤으로 써주세요. 곡 정보: ' },
  { id: 'p22', category: '🎵 음악/가사', title: '팬덤명 및 의미 기획', description: '아티스트나 크리에이터를 위한 독창적인 팬덤 이름과 그 의미를 제안합니다.', prompt: '다음 아티스트/크리에이터의 아이덴티티를 바탕으로, 부르기 쉽고 의미 있는 팬덤명 후보 5가지를 기획해주세요. 각 팬덤명에 담긴 스토리와 로고 디자인 아이디어도 함께 제안해주세요. 아티스트 정보: ' },
  { id: 'p23', category: '🎬 유튜브/영상', title: '유튜브 채널 브랜딩 기획', description: '새로운 유튜브 채널의 컨셉, 타겟, 차별화 포인트를 기획합니다.', prompt: '새로 시작할 유튜브 채널의 전반적인 브랜딩 기획안을 작성해주세요. 채널명 후보 3개, 핵심 타겟 시청자층, 경쟁 채널과의 차별화 포인트(USP), 그리고 채널 아트(배너) 디자인 컨셉을 제안해주세요. 채널 주제: ' },
  { id: 'p24', category: '🎬 유튜브/영상', title: '틱톡/릴스 챌린지 기획안', description: '바이럴 마케팅을 위한 숏폼 댄스/참여형 챌린지 아이디어를 도출합니다.', prompt: '다음 신곡/신제품을 홍보하기 위한 틱톡 및 인스타그램 릴스 챌린지 기획안을 작성해주세요. 챌린지 이름(해시태그), 참여 방법(안무 또는 액션), 배경음악의 어느 구간을 사용할지, 그리고 참여를 유도할 경품 아이디어를 포함해주세요. 홍보 대상: ' },
  { id: 'p25', category: '📝 블로그/SEO', title: '인터뷰 형식의 블로그 포스팅', description: '전문가나 고객과의 가상 인터뷰 형식으로 신뢰도 높은 글을 작성합니다.', prompt: '다음 주제에 대해 전문가(또는 만족한 고객)와 진행하는 Q&A 인터뷰 형식의 블로그 포스팅을 작성해주세요. 독자가 가장 궁금해할 만한 질문 5가지를 뽑고, 그에 대한 명쾌하고 신뢰감 있는 답변을 대화체로 작성해주세요. 주제: ' },
  { id: 'p26', category: '📝 블로그/SEO', title: '정보성 리스트형(Listicle) 글', description: '"TOP 5", "7가지 방법" 등 클릭을 유도하는 리스트형 글을 작성합니다.', prompt: '다음 주제로 독자의 클릭을 유도하는 리스트형(Listicle) 블로그 글을 작성해주세요. (예: ~하는 5가지 방법, ~추천 TOP 7). 각 항목마다 명확한 소제목을 달고, 실질적으로 도움되는 구체적인 팁을 3~4문장으로 설명해주세요. 주제: ' },
  { id: 'p27', category: '📈 마케팅/카피', title: '랜딩페이지 헤드라인 카피', description: '웹사이트 첫 화면에서 고객의 이탈을 막는 강력한 헤드라인을 작성합니다.', prompt: '다음 서비스/제품의 랜딩페이지 최상단(Hero section)에 들어갈 강력한 헤드라인 카피 후보 5개를 작성해주세요. 고객의 페인포인트를 자극하는 버전, 혜택을 직관적으로 보여주는 버전, 호기심을 유발하는 버전을 골고루 섞어주세요. 서비스/제품: ' },
  { id: 'p28', category: '📈 마케팅/카피', title: '프로모션/이벤트 기획안', description: '매출을 끌어올릴 수 있는 시즌별 또는 게릴라 이벤트 아이디어를 기획합니다.', prompt: '다음 타겟 고객을 대상으로 한 단기 프로모션/이벤트 기획안을 작성해주세요. 이벤트 타이틀, 참여 조건, 제공할 혜택(리워드), 그리고 고객의 참여를 독려할 긴급성(Scarcity) 부여 전략을 포함해주세요. 타겟 고객 및 목적: ' },
  { id: 'p29', category: '💡 아이디어/기획', title: '앱/웹 서비스 기능 명세서', description: '새로운 IT 서비스 기획 시 필요한 핵심 기능(MVP) 리스트를 도출합니다.', prompt: '다음 아이디어를 바탕으로 앱/웹 서비스의 MVP(최소 기능 제품) 기능 명세서를 작성해주세요. 사용자(User) 관점에서 반드시 필요한 핵심 기능 5가지와, 추후 고도화 단계에서 추가할 부가 기능 3가지를 나누어 설명해주세요. 서비스 아이디어: ' },
  { id: 'p30', category: '💡 아이디어/기획', title: 'SWOT 분석 및 전략 도출', description: '특정 비즈니스나 프로젝트의 강점, 약점, 기회, 위협을 분석합니다.', prompt: '다음 비즈니스 모델에 대한 SWOT 분석(강점, 약점, 기회, 위협)을 진행해주세요. 각 항목별로 3가지씩 요인을 도출하고, 마지막에 강점을 활용해 기회를 잡는 SO 전략과 약점을 보완해 위협을 피하는 WT 전략을 각각 1개씩 제안해주세요. 비즈니스 모델: ' }
];

const CATEGORIES = ['전체', '🎵 음악/가사', '🎬 유튜브/영상', '📝 블로그/SEO', '📈 마케팅/카피', '💡 아이디어/기획'];

export const PromptPage: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPrompts = selectedCategory === '전체' 
    ? PROMPTS 
    : PROMPTS.filter(p => p.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
          ChatGPT / Gemini 프롬프트 모음
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          음악, 영상 기획부터 마케팅, 아이디어 도출까지! 복사해서 바로 사용할 수 있는 30가지 실전 프롬프트입니다.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.map((item) => (
          <div 
            key={item.id}
            className="flex flex-col bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="p-6 flex-1">
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">
                {item.category}
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {item.description}
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl relative group">
                <p className="text-sm font-mono text-gray-800 dark:text-gray-300 break-words">
                  {item.prompt}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => handleCopy(item.id, item.prompt)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  copiedId === item.id
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    복사 완료!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    프롬프트 복사하기
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

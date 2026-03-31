import React, { useEffect, useState } from 'react';
import { Music, ExternalLink, Sparkles, Zap, Video, DollarSign, FileText, Calendar, Lock } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth: any) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

const ServiceCard: React.FC<{ title: string; desc: string; icon: React.ReactNode; url?: string }> = ({ title, desc, icon, url }) => (
  <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6 text-gray-900 dark:text-white group-hover:bg-blue-600 group-hover:text-white transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white transition-colors">{title}</h3>
    <p className="text-gray-500 dark:text-gray-300 leading-relaxed text-sm transition-colors flex-grow">
      {desc}
    </p>
    {url && (
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-all shadow-md shadow-blue-500/10"
        >
          바로가기 <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    )}
  </div>
);

export const servicesData = [
  {
    icon: <Music className="w-7 h-7" />,
    title: "AI 음악 수익화 전략",
    desc: "Suno와 AI 도구를 활용하여 제작한 음악으로 수익을 창출하는 구체적인 방법과 유통 전략을 제시합니다.",
    url: "https://suno-ai-biz-2026-a.vercel.app/"
  },
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: "Suno v5 Prompt Lab Pro",
    desc: "40가지 장르 x 각 6개 프롬프트 (총 240세트)를 제공하는 전문가용 프롬프트 라이브러리입니다.",
    url: "https://v0-prompt-lab-pro-mvt4.vercel.app/"
  },
  {
    icon: <Zap className="w-7 h-7" />,
    title: "Suno v5 가사 치트키",
    desc: "v5의 향상된 구조 파악과 SFX 능력을 200% 활용하는 가사 치트키 가이드입니다.",
    url: "https://suno-lyrics-cheat-key.vercel.app/"
  },
  {
    icon: <Video className="w-7 h-7" />,
    title: "뮤직비디오 제작 도구 비교",
    desc: "Kling O1, Runway Gen-3, Google Veo 등 주요 AI 비디오 모델의 성능을 비교 분석한 자료입니다.",
    url: "https://v0-ai-video-model-battle-s9wm.vercel.app/"
  },
  {
    icon: <DollarSign className="w-7 h-7" />,
    title: "DistroKid 2026 기본가이드",
    desc: "'아티스트 중심' 로열티 구조와 AI 기술 규제 시대, 독립 아티스트의 수익 극대화를 위한 DistroKid 활용 전략의 모든 것.",
    url: "https://distro-kid-guide-pro.vercel.app/"
  }
];

export const ServicePage: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'materials'),
      where('category', '==', 'service'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const materialsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      materialsData.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 999999;
        const orderB = typeof b.order === 'number' ? b.order : 999999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setMaterials(materialsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'materials', null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasAccess = (requiredTier: string) => {
    if (user?.role === 'admin') return true;
    if (requiredTier === 'free') return true;
    if (requiredTier === 'silver' && (user?.tier === 'silver' || user?.tier === 'gold')) return true;
    if (requiredTier === 'gold' && user?.tier === 'gold') return true;
    return false;
  };

  const dbServices = materials.map(m => ({
    title: m.title,
    desc: m.description,
    url: m.contentUrl,
    icon: <Sparkles className="w-7 h-7" />, // Default icon for db items
    requiredTier: m.requiredTier,
    id: m.id
  }));

  const allServices = [...dbServices];
  const existingTitles = new Set(dbServices.map(s => s.title));
  for (const s of servicesData) {
    if (!existingTitles.has(s.title)) {
      allServices.push({
        ...s,
        requiredTier: 'free', // Assuming static ones are free by default unless specified
        id: s.title
      });
    }
  }

  const handleMaterialClick = (material: any) => {
    if (!hasAccess(material.requiredTier)) {
      alert(`${material.requiredTier === 'gold' ? '골드' : '실버'} 등급 이상 회원만 열람 가능합니다.`);
      return;
    }
    window.open(material.url, '_blank');
  };
  return (
    <div className="min-h-screen bg-white dark:bg-[#020408] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in fade-in duration-500">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-blue-600 dark:text-blue-500 font-bold tracking-wide uppercase text-sm mb-3">Other Materials</h2>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight transition-colors">
            그외 유용한 자료들
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors">
            음악 제작, 디자인, 개발 등 다양한 분야에서<br className="hidden md:block"/> 
            활용할 수 있는 유용한 리소스와 도구들을 소개합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {allServices.map((service, index) => (
            <div key={service.id || index} className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
              <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6 text-gray-900 dark:text-white group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {service.icon}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                  service.requiredTier === 'gold' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                  service.requiredTier === 'silver' ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {service.requiredTier === 'gold' ? '골드 전용' : service.requiredTier === 'silver' ? '실버 이상' : '무료 회원'}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white transition-colors">{service.title}</h3>
              <p className="text-gray-500 dark:text-gray-300 leading-relaxed text-sm transition-colors flex-grow">
                {service.desc}
              </p>
              {service.url && (
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button 
                    onClick={() => handleMaterialClick(service)}
                    className={`inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                      hasAccess(service.requiredTier)
                        ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-md shadow-blue-500/10'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {hasAccess(service.requiredTier) ? (
                      <>
                        바로가기 <ExternalLink className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        권한 없음 <Lock className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { EbookCard } from '../components/EbookCard';
import { EbookItem } from '../types';
import { Crown, FileText, ExternalLink, Calendar, Lock } from 'lucide-react';
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

interface Props {
  onOpenAuth: () => void;
  onOpenAccessDenied: (type: 'expired' | 'tier-low' | 'login-required', tier?: string) => void;
}

export const EbookPage: React.FC<Props> = ({ onOpenAuth, onOpenAccessDenied }) => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'materials'),
      where('category', '==', 'ebook'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const materialsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
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
  const handleCardClick = (item: EbookItem) => {
    if (item.isPro) {
      if (!user) {
        onOpenAccessDenied('login-required');
        return;
      }

      const isExpired = user?.subscriptionEndDate && user.subscriptionEndDate !== 'unlimited' && new Date(user.subscriptionEndDate) < new Date();
      if (isExpired) {
        onOpenAccessDenied('expired');
        return;
      }

      if (!hasAccess(item.requiredTier || 'gold')) {
        onOpenAccessDenied('tier-low', item.requiredTier);
        return;
      }
    }
    
    let targetUrl = item.url;
    if (user?.email) {
      const encodedEmail = encodeURIComponent(user.email);
      const separator = targetUrl.includes('?') ? '&' : '?';
      targetUrl = `${targetUrl}${separator}u=${encodedEmail}`;
    }
    
    window.open(targetUrl, '_blank');
  };

  const hasAccess = (requiredTier: string) => {
    if (user?.role === 'admin') return true;
    if (requiredTier === 'free') return true;
    
    // Check subscription expiration
    if (user?.subscriptionEndDate && user.subscriptionEndDate !== 'unlimited') {
      if (new Date(user.subscriptionEndDate) < new Date()) {
        return false; // Expired
      }
    }

    if (requiredTier === 'silver' && (user?.tier === 'silver' || user?.tier === 'gold')) return true;
    if (requiredTier === 'gold' && user?.tier === 'gold') return true;
    return false;
  };

  const dbEbooks = materials.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description,
    url: m.contentUrl,
    coverUrl: m.imageUrl,
    isPro: m.requiredTier === 'gold' || m.requiredTier === 'silver',
    requiredTier: m.requiredTier
  })) as EbookItem[];

  const allEbooks = [...dbEbooks];

  return (
    <div className="min-h-screen bg-white dark:bg-[#020408] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in fade-in duration-500">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest mb-6 border border-amber-200 dark:border-amber-800 animate-bounce">
            <Crown className="w-3.5 h-3.5" />
            <span>Premium Member Only</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-[1.4] transition-colors">
            AI 음악 제작의 모든 것<br />
            전문가의 노하우를 담은 전자책
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors">
            AI Studio와 Suno를 활용한 작곡 기법부터 수익화 전략까지,<br className="hidden md:block"/> 
            방구석 작곡가를 위한 실전 가이드를 만나보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 mb-16">
          {allEbooks.map(item => (
            <EbookCard 
              key={item.id} 
              item={item} 
              onClick={handleCardClick} 
            />
          ))}
        </div>

        <div className="mt-20 bg-gray-900 dark:bg-blue-900/10 rounded-3xl p-8 md:p-16 text-center text-white border border-transparent dark:border-blue-500/10 transition-colors">
          <h2 className="text-3xl md:text-4xl font-black mb-6">지금 바로 시작하세요</h2>
          <p className="text-gray-400 dark:text-gray-300 mb-10 max-w-2xl mx-auto transition-colors">
            전자책 구매 시 전용 커뮤니티 초대권과 최신 프롬프트 업데이트를 평생 무료로 제공합니다.
          </p>
          <button className="bg-[#2563eb] text-white px-8 py-4 rounded-full font-bold hover:bg-[#1d4ed8] transition-colors shadow-xl">
            전자책 보러가기
          </button>
        </div>
      </div>
    </div>
  );
};

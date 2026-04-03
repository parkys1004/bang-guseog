import React, { useEffect, useState } from 'react';
import { Lock, Crown, FileText, ExternalLink, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const AdvancedMaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!user || user.tier !== 'gold') {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'materials'),
          where('category', '==', 'advanced'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const materialsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        materialsData.sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : 999999;
          const orderB = typeof b.order === 'number' ? b.order : 999999;
          if (orderA !== orderB) return orderA - orderB;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setMaterials(materialsData);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }

  const isExpired = user?.subscriptionEndDate && user.subscriptionEndDate !== 'unlimited' && new Date(user.subscriptionEndDate) < new Date();

  if (!user || user.tier !== 'gold' || isExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#020408] p-4">
        <div className="bg-white dark:bg-[#11141d] p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl text-center max-w-md">
          <Lock className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4">접근 제한</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            이 페이지는 '골드' 등급 회원만 접근할 수 있습니다.
            등급을 확인하거나 관리자에게 문의하세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020408] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Crown className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">고급 자료실</h1>
        </div>
        <div className="bg-white dark:bg-[#11141d] p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-8">
          <p className="text-gray-600 dark:text-gray-400">
            골드 등급 회원님을 위한 특별한 자료들이 준비되어 있습니다.
          </p>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>아직 등록된 고급 자료가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div key={material.id} className="bg-white dark:bg-[#11141d] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                      골드 전용
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {material.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                    {material.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(material.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  <a
                    href={user?.email ? `${material.contentUrl}${material.contentUrl.includes('?') ? '&' : '?'}u=${encodeURIComponent(user.email)}` : material.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors"
                  >
                    자료 열람하기
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

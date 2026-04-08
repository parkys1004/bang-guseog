import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc, onSnapshot, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Activity, Database, ShieldCheck, Mail, Calendar, Edit2, Check, X, Search, Send, Upload, FileText, Trash2, Download, Key, UserX, Bell } from 'lucide-react';
import { AI_CONTENTS, EBOOK_CONTENTS } from '../data';
import { servicesData } from './ServicePage';
import { PROMPTS } from './PromptPage';
import { recommendedSites } from './RecommendedSitesPage';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editOption, setEditOption] = useState<string>('restricted');
  
  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterSubStatus, setFilterSubStatus] = useState<string>('all');
  const [filterJoinDateStart, setFilterJoinDateStart] = useState<string>('');
  const [filterJoinDateEnd, setFilterJoinDateEnd] = useState<string>('');
  
  // Selection state
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  
  // Messaging state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Material Upload state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialImageUrl, setMaterialImageUrl] = useState('');
  const [materialPrompt, setMaterialPrompt] = useState('');
  const [materialCategory, setMaterialCategory] = useState<'ebook' | 'prompt' | 'service' | 'advanced' | 'webbuilder'>('advanced');
  const [materialSubCategory, setMaterialSubCategory] = useState('');
  const [materialTier, setMaterialTier] = useState<'free' | 'silver' | 'gold'>('gold');
  const [materialOrder, setMaterialOrder] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState<'users' | 'materials' | 'settings'>('users');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Material Filter state
  const [searchMaterialQuery, setSearchMaterialQuery] = useState('');
  const [filterMaterialCategory, setFilterMaterialCategory] = useState<string>('all');

  // Modal states
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean, message: string }>({ isOpen: false, message: '' });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, message: string, onConfirm: () => void }>({ isOpen: false, message: '', onConfirm: () => {} });

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Master Password state
  const [currentMasterPassword, setCurrentMasterPassword] = useState('');
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [passwordLastUpdated, setPasswordLastUpdated] = useState('');
  const [passwordLastUpdatedBy, setPasswordLastUpdatedBy] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const showAlert = (message: string) => {
    setAlertModal({ isOpen: true, message });
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, message, onConfirm });
  };

  const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.id,
        email: user?.email,
        role: user?.role
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    // throw new Error(JSON.stringify(errInfo));
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      let unsubscribeUsers: () => void;
      let unsubscribeMaterials: () => void;
      let unsubscribeConfig: (() => void) | undefined;
      let unsubscribeNotifications: () => void;

      // Fetch admin notifications
      const notifQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      unsubscribeNotifications = onSnapshot(notifQuery, (querySnapshot) => {
        const notifs = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(msg => msg.receiverId === 'admin');
        setNotifications(notifs);
      }, (err) => {
        console.error("Failed to fetch notifications:", err);
      });

      if (activeTab === 'users') {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        unsubscribeUsers = onSnapshot(q, (querySnapshot) => {
          const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          setUsers(usersData);
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, 'list', 'users');
          setError("사용자 목록을 불러오는데 실패했습니다. (Firestore 규칙을 확인해주세요)");
          setLoading(false);
        });
      } else if (activeTab === 'materials') {
        setLoadingMaterials(true);
        const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
        unsubscribeMaterials = onSnapshot(q, (querySnapshot) => {
          const materialsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          materialsData.sort((a, b) => {
            const orderA = typeof a.order === 'number' ? a.order : 999999;
            const orderB = typeof b.order === 'number' ? b.order : 999999;
            if (orderA !== orderB) return orderA - orderB;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setMaterials(materialsData);
          setLoadingMaterials(false);
        }, (err) => {
          handleFirestoreError(err, 'list', 'materials');
          showAlert("자료 목록을 불러오는데 실패했습니다.");
          setLoadingMaterials(false);
        });
      } else if (activeTab === 'settings') {
        const configRef = doc(db, 'config', 'globalConfig');
        unsubscribeConfig = onSnapshot(configRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCurrentMasterPassword(data.currentPassword || '');
            setPasswordLastUpdated(data.lastUpdated || '');
            setPasswordLastUpdatedBy(data.lastUpdatedBy || '');
          }
          setLoading(false);
        }, (err) => {
          console.error("Failed to fetch global config:", err);
          showAlert("설정 정보를 불러오는데 실패했습니다.");
          setLoading(false);
        });
      }

      return () => {
        if (unsubscribeUsers) unsubscribeUsers();
        if (unsubscribeMaterials) unsubscribeMaterials();
        if (unsubscribeConfig) unsubscribeConfig();
        if (unsubscribeNotifications) unsubscribeNotifications();
      };
    } else {
      setLoading(false);
    }
  }, [user, activeTab]);

  const handleDeleteMaterial = (materialId: string) => {
    showConfirm('정말로 이 자료를 삭제하시겠습니까?', async () => {
      try {
        await deleteDoc(doc(db, 'materials', materialId));
      } catch (err) {
        handleFirestoreError(err, 'delete', `materials/${materialId}`);
        showAlert('자료 삭제에 실패했습니다.');
      }
    });
  };

  const handleKickUser = (userId: string, email: string) => {
    showConfirm('정말로 이 회원을 강퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.', async () => {
      try {
        if (email) {
          await setDoc(doc(db, 'deleted_users', email), {
            email,
            deletedAt: new Date().toISOString(),
            reason: 'kicked'
          });
        }
        await deleteDoc(doc(db, 'users', userId));
        showAlert('회원이 강퇴되었습니다.');
      } catch (err) {
        handleFirestoreError(err, 'delete', `users/${userId}`);
        showAlert('회원 강퇴에 실패했습니다.');
      }
    });
  };

  const handleMigrateData = async () => {
    if (!user) {
      showAlert('로그인이 필요합니다.');
      return;
    }
    showConfirm('기존 하드코딩된 자료들을 DB로 가져오시겠습니까? 중복된 제목은 제외됩니다.', async () => {
      setIsMigrating(true);
      try {
        const q = query(collection(db, 'materials'));
        const querySnapshot = await getDocs(q);
        const existingTitles = new Set(querySnapshot.docs.map(doc => doc.data().title));
        
        let addedCount = 0;
        const authorId = user.id;
        
        // Migrate Web Builder Apps
        for (const item of AI_CONTENTS) {
          if (!existingTitles.has(item.title)) {
            await addDoc(collection(db, 'materials'), {
              title: item.title,
              description: item.description || '',
              contentUrl: item.url === '#' ? '' : item.url,
              category: 'webbuilder',
              subCategory: item.category || 'ETC',
              requiredTier: item.isPro ? 'gold' : 'free',
              imageUrl: item.posterUrl || null,
              prompt: null,
              authorId: authorId,
              createdAt: new Date().toISOString()
            });
            addedCount++;
            existingTitles.add(item.title);
          }
        }
        
        // Migrate Ebooks
        for (const item of EBOOK_CONTENTS) {
          if (!existingTitles.has(item.title)) {
            await addDoc(collection(db, 'materials'), {
              title: item.title,
              description: item.description || '',
              contentUrl: item.url === '#' ? '' : item.url,
              category: 'ebook',
              requiredTier: item.isPro ? 'gold' : 'free',
              imageUrl: item.coverUrl || null,
              prompt: null,
              authorId: authorId,
              createdAt: new Date().toISOString()
            });
            addedCount++;
            existingTitles.add(item.title);
          }
        }

        // Migrate Prompts
        for (const item of PROMPTS) {
          if (!existingTitles.has(item.title)) {
            await addDoc(collection(db, 'materials'), {
              title: item.title,
              description: item.description || '',
              contentUrl: '',
              prompt: item.prompt || '',
              category: 'prompt',
              subCategory: item.category || '기타',
              requiredTier: item.isPro ? 'gold' : 'free',
              imageUrl: null,
              authorId: authorId,
              createdAt: new Date().toISOString()
            });
            addedCount++;
            existingTitles.add(item.title);
          }
        }

        // Migrate Services
        for (const item of (servicesData as any[])) {
          if (!existingTitles.has(item.title)) {
            await addDoc(collection(db, 'materials'), {
              title: item.title,
              description: item.desc || '',
              contentUrl: item.url === '#' ? '' : (item.url || ''),
              category: 'service',
              requiredTier: item.requiredTier || 'free',
              imageUrl: null,
              prompt: null,
              authorId: authorId,
              createdAt: new Date().toISOString()
            });
            addedCount++;
            existingTitles.add(item.title);
          }
        }

        // Migrate Recommended Sites
        for (const item of recommendedSites) {
          if (!existingTitles.has(item.name)) {
            await addDoc(collection(db, 'materials'), {
              title: item.name,
              description: item.description || '',
              contentUrl: item.url === '#' ? '' : (item.url || ''),
              category: 'service',
              subCategory: item.category || '추천 사이트',
              requiredTier: 'free',
              imageUrl: null,
              prompt: null,
              authorId: authorId,
              createdAt: new Date().toISOString()
            });
            addedCount++;
            existingTitles.add(item.name);
          }
        }
        
        showAlert(`총 ${addedCount}개의 자료가 성공적으로 DB로 가져와졌습니다.`);
      } catch (err) {
        handleFirestoreError(err, 'create', 'materials');
        showAlert('자료 가져오기에 실패했습니다.');
      } finally {
        setIsMigrating(false);
      }
    });
  };

  const handleUpdateSubscription = async (userId: string) => {
    try {
      let finalDate = null;
      if (editOption === 'unlimited') {
        finalDate = 'unlimited';
      } else if (editOption === '1m') {
        const d = new Date(); d.setMonth(d.getMonth() + 1); finalDate = d.toISOString();
      } else if (editOption === '3m') {
        const d = new Date(); d.setMonth(d.getMonth() + 3); finalDate = d.toISOString();
      } else if (editOption === '6m') {
        const d = new Date(); d.setMonth(d.getMonth() + 6); finalDate = d.toISOString();
      } else if (editOption === '1y') {
        const d = new Date(); d.setFullYear(d.getFullYear() + 1); finalDate = d.toISOString();
      } else if (editOption === 'custom') {
        finalDate = editDate ? new Date(editDate).toISOString() : null;
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscriptionEndDate: finalDate
      });
      setEditingUserId(null);
    } catch (err) {
      handleFirestoreError(err, 'update', `users/${userId}`);
      showAlert("사용 기간 업데이트에 실패했습니다.");
    }
  };

  const handleUpdateTier = async (userId: string, newTier: 'free' | 'silver' | 'gold') => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        tier: newTier
      });
    } catch (err) {
      handleFirestoreError(err, 'update', `users/${userId}`);
      showAlert("등급 업데이트에 실패했습니다.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipients = isBulkMode ? Array.from(selectedUserIds) : [selectedUser?.id];
    
    if (recipients.length === 0 || !messageTitle.trim() || !messageContent.trim()) return;

    setIsSending(true);
    try {
      const promises = recipients.map(recipientId => 
        addDoc(collection(db, 'messages'), {
          senderId: user?.id,
          receiverId: recipientId,
          title: messageTitle,
          content: messageContent,
          isRead: false,
          createdAt: new Date().toISOString()
        })
      );
      
      await Promise.all(promises);
      
      showAlert(`${recipients.length}명에게 쪽지가 성공적으로 발송되었습니다.`);
      setIsMessageModalOpen(false);
      setMessageTitle('');
      setMessageContent('');
      setSelectedUser(null);
      setIsBulkMode(false);
      if (isBulkMode) setSelectedUserIds(new Set());
    } catch (err) {
      handleFirestoreError(err, 'create', 'messages');
      showAlert('쪽지 발송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterPassword.trim()) {
      showAlert('새로운 마스터 비밀번호를 입력해주세요.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const configRef = doc(db, 'config', 'globalConfig');
      await setDoc(configRef, {
        currentPassword: newMasterPassword,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: user?.name || user?.email || 'Admin'
      }, { merge: true });
      
      showAlert('마스터 비밀번호가 성공적으로 변경되었습니다.');
      setNewMasterPassword('');
    } catch (err) {
      console.error("Failed to update master password:", err);
      showAlert('마스터 비밀번호 변경에 실패했습니다.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const resetMaterialForm = () => {
    setMaterialTitle('');
    setMaterialDescription('');
    setMaterialUrl('');
    setMaterialImageUrl('');
    setMaterialPrompt('');
    setMaterialCategory('advanced');
    setMaterialSubCategory('');
    setMaterialTier('gold');
    setMaterialOrder('');
    setEditingMaterialId(null);
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim() || !materialDescription.trim()) return;
    if (materialCategory !== 'prompt' && !materialUrl.trim()) return;
    if (materialCategory === 'prompt' && !materialPrompt.trim()) return;

    setIsUploading(true);
    try {
      await addDoc(collection(db, 'materials'), {
        title: materialTitle,
        description: materialDescription,
        contentUrl: materialCategory === 'prompt' ? '' : materialUrl,
        imageUrl: (materialCategory === 'webbuilder' || materialCategory === 'ebook') ? materialImageUrl : null,
        prompt: materialCategory === 'prompt' ? materialPrompt : null,
        category: materialCategory,
        subCategory: materialSubCategory,
        requiredTier: materialTier,
        order: materialOrder === '' ? null : Number(materialOrder),
        authorId: user?.id,
        createdAt: new Date().toISOString()
      });
      
      showAlert('자료가 성공적으로 업로드되었습니다.');
      setIsUploadModalOpen(false);
      resetMaterialForm();
    } catch (err) {
      handleFirestoreError(err, 'create', 'materials');
      showAlert('자료 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const openEditMaterialModal = (material: any) => {
    setEditingMaterialId(material.id);
    setMaterialTitle(material.title);
    setMaterialDescription(material.description);
    setMaterialUrl(material.contentUrl || '');
    setMaterialImageUrl(material.imageUrl || '');
    setMaterialPrompt(material.prompt || '');
    setMaterialCategory(material.category);
    setMaterialSubCategory(material.subCategory || '');
    setMaterialTier(material.requiredTier);
    setMaterialOrder(material.order ?? '');
    setIsEditModalOpen(true);
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterialId || !materialTitle.trim() || !materialDescription.trim()) return;
    if (materialCategory !== 'prompt' && !materialUrl.trim()) return;
    if (materialCategory === 'prompt' && !materialPrompt.trim()) return;

    setIsUploading(true);
    try {
      const materialRef = doc(db, 'materials', editingMaterialId);
      await updateDoc(materialRef, {
        title: materialTitle,
        description: materialDescription,
        contentUrl: materialCategory === 'prompt' ? '' : materialUrl,
        imageUrl: (materialCategory === 'webbuilder' || materialCategory === 'ebook') ? materialImageUrl : null,
        prompt: materialCategory === 'prompt' ? materialPrompt : null,
        category: materialCategory,
        subCategory: materialSubCategory,
        requiredTier: materialTier,
        order: materialOrder === '' ? null : Number(materialOrder),
      });
      
      showAlert('자료가 성공적으로 수정되었습니다.');
      setIsEditModalOpen(false);
      resetMaterialForm();
    } catch (err) {
      handleFirestoreError(err, 'update', `materials/${editingMaterialId}`);
      showAlert('자료 수정에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const toggleSelectAll = (filteredUsers: any[]) => {
    if (selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const filteredUsers = users.filter(u => {
    // Search query
    const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Role filter
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    
    // Subscription status filter
    let matchesSub = true;
    const now = new Date();
    if (filterSubStatus === 'active') {
      matchesSub = u.subscriptionEndDate === 'unlimited' || (u.subscriptionEndDate && new Date(u.subscriptionEndDate) >= now);
    } else if (filterSubStatus === 'expired') {
      matchesSub = u.subscriptionEndDate && u.subscriptionEndDate !== 'unlimited' && new Date(u.subscriptionEndDate) < now;
    } else if (filterSubStatus === 'restricted') {
      matchesSub = !u.subscriptionEndDate;
    } else if (filterSubStatus === 'unlimited') {
      matchesSub = u.subscriptionEndDate === 'unlimited';
    }

    // Join date filter
    let matchesJoinDate = true;
    if (u.createdAt) {
      const joinDate = new Date(u.createdAt);
      if (filterJoinDateStart) {
        const start = new Date(filterJoinDateStart);
        start.setHours(0, 0, 0, 0);
        matchesJoinDate = matchesJoinDate && joinDate >= start;
      }
      if (filterJoinDateEnd) {
        const end = new Date(filterJoinDateEnd);
        end.setHours(23, 59, 59, 999);
        matchesJoinDate = matchesJoinDate && joinDate <= end;
      }
    }

    return matchesSearch && matchesRole && matchesSub && matchesJoinDate;
  });

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title?.toLowerCase().includes(searchMaterialQuery.toLowerCase()) || 
                          m.description?.toLowerCase().includes(searchMaterialQuery.toLowerCase());
    const matchesCategory = filterMaterialCategory === 'all' || m.category === filterMaterialCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">로딩 중...</div>;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-500">접근 권한이 없습니다</h2>
          <p className="text-gray-500 dark:text-gray-400">관리자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">관리자 대시보드</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">알림</h3>
                  <button 
                    onClick={async () => {
                      const unreadNotifs = notifications.filter(n => !n.isRead);
                      for (const notif of unreadNotifs) {
                        try {
                          await updateDoc(doc(db, 'messages', notif.id), { isRead: true });
                        } catch (e) {
                          console.error("Failed to mark as read", e);
                        }
                      }
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    모두 읽음 처리
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      새로운 알림이 없습니다.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`p-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0 ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-bold ${!notif.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-gray-400">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {notif.content}
                        </p>
                        {!notif.isRead && (
                          <button 
                            onClick={async () => {
                              try {
                                await updateDoc(doc(db, 'messages', notif.id), { isRead: true });
                              } catch (e) {
                                console.error("Failed to mark as read", e);
                              }
                            }}
                            className="text-[10px] text-blue-600 dark:text-blue-400 mt-2 hover:underline"
                          >
                            읽음 표시
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700 flex gap-1 mr-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              회원 관리
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'materials' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              자료 관리
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              환경 설정
            </button>
          </div>

          {activeTab === 'materials' && (
            <>
              <button
                onClick={handleMigrateData}
                disabled={isMigrating}
                className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all animate-in slide-in-from-right-4 disabled:opacity-50"
              >
                {isMigrating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                기존 자료 가져오기
              </button>
              <button
                onClick={() => { resetMaterialForm(); setIsUploadModalOpen(true); }}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all animate-in slide-in-from-right-4"
              >
                <Upload className="w-4 h-4" />
                새 자료 업로드
              </button>
            </>
          )}
          
          {activeTab === 'users' && selectedUserIds.size > 0 && (
            <button
              onClick={() => {
                setIsBulkMode(true);
                setIsMessageModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all animate-in slide-in-from-right-4"
            >
              <Send className="w-4 h-4" />
              선택 회원 일괄 쪽지 발송 ({selectedUserIds.size}명)
            </button>
          )}
        </div>
      </div>

      {activeTab === 'users' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">총 회원 수</p>
            <h3 className="text-3xl font-black">{users.length}명</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">검색 결과</p>
            <h3 className="text-3xl font-black">{filteredUsers.length}명</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">선택된 회원</p>
            <h3 className="text-3xl font-black">{selectedUserIds.size}명</h3>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold">상세 검색 필터</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">이름 또는 이메일</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="검색어 입력..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">권한</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="all">전체 권한</option>
              <option value="user">일반 회원</option>
              <option value="admin">관리자</option>
            </select>
          </div>

          {/* Subscription Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">사용 상태</label>
            <select
              value={filterSubStatus}
              onChange={(e) => setFilterSubStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="all">전체 상태</option>
              <option value="active">회원전용 사용중</option>
              <option value="expired">기간 만료</option>
              <option value="restricted">사용 제한</option>
              <option value="unlimited">무제한 회원</option>
            </select>
          </div>

          {/* Join Date Filter */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">가입 기간</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filterJoinDateStart}
                onChange={(e) => setFilterJoinDateStart(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <span className="text-gray-400">~</span>
              <input
                type="date"
                value={filterJoinDateEnd}
                onChange={(e) => setFilterJoinDateEnd(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterRole('all');
              setFilterSubStatus('all');
              setFilterJoinDateStart('');
              setFilterJoinDateEnd('');
              setSelectedUserIds(new Set());
            }}
            className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            필터 초기화
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">회원 목록</h2>
          <div className="text-sm text-gray-500">
            총 <span className="font-bold text-blue-500">{filteredUsers.length}</span>명 검색됨
          </div>
        </div>
        
        {error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 font-bold">
                <tr>
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedUserIds.size === filteredUsers.length}
                      onChange={() => toggleSelectAll(filteredUsers)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4">이름</th>
                  <th className="px-6 py-4">이메일</th>
                  <th className="px-6 py-4">권한</th>
                  <th className="px-6 py-4">등급</th>
                  <th className="px-6 py-4">가입일</th>
                  <th className="px-6 py-4">사용 기간 (회원전용)</th>
                  <th className="px-6 py-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className={`transition-colors ${selectedUserIds.has(u.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox"
                        checked={selectedUserIds.has(u.id)}
                        onChange={() => toggleUserSelection(u.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xs">
                        {u.name?.charAt(0) || '?'}
                      </div>
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          관리자
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold">
                          일반 회원
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={u.tier || 'free'}
                        onChange={(e) => handleUpdateTier(u.id, e.target.value as 'free' | 'silver' | 'gold')}
                        className="px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 font-bold"
                      >
                        <option value="free">무료</option>
                        <option value="silver">실버</option>
                        <option value="gold">골드</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '알 수 없음'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingUserId === u.id ? (
                        <div className="flex items-center gap-2">
                          <select 
                            value={editOption}
                            onChange={(e) => {
                              setEditOption(e.target.value);
                              if (e.target.value === 'custom') {
                                setEditDate(u.subscriptionEndDate && u.subscriptionEndDate !== 'unlimited' ? u.subscriptionEndDate.split('T')[0] : new Date().toISOString().split('T')[0]);
                              }
                            }}
                            className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                          >
                            <option value="restricted">사용 제한</option>
                            <option value="1m">1개월</option>
                            <option value="3m">3개월</option>
                            <option value="6m">6개월</option>
                            <option value="1y">1년</option>
                            <option value="unlimited">무제한</option>
                            <option value="custom">직접 지정</option>
                          </select>
                          {editOption === 'custom' && (
                            <input 
                              type="date" 
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                          )}
                          <button 
                            onClick={() => handleUpdateSubscription(u.id)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded dark:text-green-400 dark:hover:bg-green-900/30"
                            title="저장"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingUserId(null)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded dark:text-red-400 dark:hover:bg-red-900/30"
                            title="취소"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            !u.subscriptionEndDate 
                              ? 'text-red-500' 
                              : u.subscriptionEndDate === 'unlimited' 
                                ? 'text-blue-600 dark:text-blue-400'
                                : new Date(u.subscriptionEndDate) < new Date() 
                                  ? 'text-red-500' 
                                  : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {!u.subscriptionEndDate 
                              ? '사용 제한' 
                              : u.subscriptionEndDate === 'unlimited' 
                                ? '무제한' 
                                : `${new Date(u.subscriptionEndDate).toLocaleDateString()} 까지`}
                          </span>
                          <button 
                            onClick={() => {
                              setEditingUserId(u.id);
                              if (!u.subscriptionEndDate) {
                                setEditOption('restricted');
                                setEditDate('');
                              } else if (u.subscriptionEndDate === 'unlimited') {
                                setEditOption('unlimited');
                                setEditDate('');
                              } else {
                                setEditOption('custom');
                                setEditDate(u.subscriptionEndDate.split('T')[0]);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            title="기간 설정"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedUser(u);
                            setIsBulkMode(false);
                            setIsMessageModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="쪽지 보내기"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <a 
                          href={`mailto:${u.email}`}
                          className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="이메일 보내기"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleKickUser(u.id, u.email)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="회원 강퇴"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 opacity-20" />
                        <p>검색 결과가 없습니다.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      ) : activeTab === 'materials' ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Materials Filter */}
          <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Search className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold">자료 검색 필터</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">제목 또는 설명</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="검색어 입력..."
                    value={searchMaterialQuery}
                    onChange={(e) => setSearchMaterialQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">카테고리</label>
                <select
                  value={filterMaterialCategory}
                  onChange={(e) => setFilterMaterialCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="all">전체 카테고리</option>
                  <option value="webbuilder">웹빌더앱</option>
                  <option value="advanced">고급 자료실</option>
                  <option value="ebook">전자책</option>
                  <option value="prompt">프롬프트</option>
                  <option value="service">그외 자료</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">업로드된 자료 목록</h2>
              <div className="text-sm text-gray-500">
                총 <span className="font-bold text-indigo-500">{filteredMaterials.length}</span>개의 자료
              </div>
            </div>
            
            {loadingMaterials ? (
              <div className="p-12 text-center text-gray-500">자료를 불러오는 중...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 font-bold">
                    <tr>
                      <th className="px-6 py-4">순서</th>
                      <th className="px-6 py-4">카테고리</th>
                      <th className="px-6 py-4">제목</th>
                      <th className="px-6 py-4">설명</th>
                      <th className="px-6 py-4">열람 등급</th>
                      <th className="px-6 py-4">등록일</th>
                      <th className="px-6 py-4 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredMaterials.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-gray-500 dark:text-gray-400">
                        {m.order ?? '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                          m.category === 'advanced' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                          m.category === 'ebook' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          m.category === 'prompt' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                          m.category === 'webbuilder' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                        }`}>
                          {m.category === 'advanced' ? '고급 자료' : 
                           m.category === 'ebook' ? '전자책' : 
                           m.category === 'prompt' ? '프롬프트' : 
                           m.category === 'webbuilder' ? '웹빌더앱' : '그외 자료'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium max-w-[200px] truncate" title={m.title}>
                        {m.title}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-[300px] truncate" title={m.description}>
                        {m.description}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                          m.requiredTier === 'gold' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          m.requiredTier === 'silver' ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {m.requiredTier === 'gold' ? '골드' : m.requiredTier === 'silver' ? '실버' : '무료'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {m.category === 'prompt' ? (
                            <button 
                              onClick={() => showAlert(`프롬프트 내용:\n\n${m.prompt || '내용 없음'}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="자료 보기"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          ) : (
                            <a 
                              href={(m.contentUrl && m.contentUrl !== '#') ? m.contentUrl : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                if (!m.contentUrl || m.contentUrl === '#') {
                                  e.preventDefault();
                                  showAlert('연결된 URL이 없습니다.');
                                }
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors inline-block"
                              title="자료 보기"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          <button 
                            onClick={() => openEditMaterialModal(m)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="수정"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteMaterial(m.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMaterials.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-8 h-8 opacity-20" />
                          <p>검색된 자료가 없습니다.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      ) : activeTab === 'settings' ? (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-bold">마스터 비밀번호 관리</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">현재 마스터 비밀번호</h3>
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-emerald-500" />
                    <span className="text-2xl font-mono font-bold tracking-wider text-gray-900 dark:text-white">
                      {currentMasterPassword || '설정되지 않음'}
                    </span>
                  </div>
                  
                  {passwordLastUpdated && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>마지막 변경일: {new Date(passwordLastUpdated).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>변경자: {passwordLastUpdatedBy || '알 수 없음'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <form onSubmit={handleUpdateMasterPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      새로운 마스터 비밀번호
                    </label>
                    <input
                      type="text"
                      value={newMasterPassword}
                      onChange={(e) => setNewMasterPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                      placeholder="새로운 비밀번호 입력"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      * 변경 시 즉시 적용되며, 기존 비밀번호로는 접근할 수 없습니다.
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isUpdatingPassword || !newMasterPassword.trim()}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isUpdatingPassword ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        즉시 변경
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Material Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-500" />
                새 자료 업로드
              </h2>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUploadMaterial} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">자료 제목</label>
                  <input
                    type="text"
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="자료 제목을 입력하세요"
                    required
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">표시 순서 (선택)</label>
                  <input
                    type="number"
                    value={materialOrder}
                    onChange={(e) => setMaterialOrder(e.target.value ? Number(e.target.value) : '')}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="숫자가 작을수록 먼저 표시"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">자료 설명</label>
                <textarea
                  value={materialDescription}
                  onChange={(e) => setMaterialDescription(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[100px] resize-none"
                  placeholder="자료에 대한 간단한 설명을 입력하세요"
                  required
                />
              </div>

              {materialCategory === 'prompt' ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">프롬프트 내용</label>
                  <textarea
                    value={materialPrompt}
                    onChange={(e) => setMaterialPrompt(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[150px] resize-none"
                    placeholder="프롬프트 내용을 입력하세요"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">자료 URL (링크)</label>
                  <input
                    type="url"
                    value={materialUrl}
                    onChange={(e) => setMaterialUrl(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="https://..."
                    required
                  />
                </div>
              )}

              {(materialCategory === 'webbuilder' || materialCategory === 'ebook') && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">썸네일 이미지 URL</label>
                  <input
                    type="url"
                    value={materialImageUrl}
                    onChange={(e) => setMaterialImageUrl(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="https://... (이미지 주소)"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">카테고리</label>
                  <select
                    value={materialCategory}
                    onChange={(e) => setMaterialCategory(e.target.value as any)}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="webbuilder">웹빌더앱</option>
                    <option value="advanced">고급 자료실</option>
                    <option value="ebook">전자책</option>
                    <option value="prompt">프롬프트</option>
                    <option value="service">그외 자료</option>
                  </select>
                </div>
                {materialCategory === 'webbuilder' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">서브 카테고리</label>
                    <select
                      value={materialSubCategory}
                      onChange={(e) => setMaterialSubCategory(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="">선택 안함</option>
                      <option value="AI STUDIO">AI STUDIO</option>
                      <option value="VERCEL">VERCEL</option>
                      <option value="ETC">ETC</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">열람 가능 등급</label>
                  <select
                    value={materialTier}
                    onChange={(e) => setMaterialTier(e.target.value as any)}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="free">무료 회원 이상</option>
                    <option value="silver">실버 회원 이상</option>
                    <option value="gold">골드 회원 전용</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      업로드하기
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                자료 수정
              </h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateMaterial} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">자료 제목</label>
                  <input
                    type="text"
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="자료 제목을 입력하세요"
                    required
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">표시 순서 (선택)</label>
                  <input
                    type="number"
                    value={materialOrder}
                    onChange={(e) => setMaterialOrder(e.target.value ? Number(e.target.value) : '')}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="숫자가 작을수록 먼저 표시"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">자료 설명</label>
                <textarea
                  value={materialDescription}
                  onChange={(e) => setMaterialDescription(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[100px] resize-none"
                  placeholder="자료에 대한 간단한 설명을 입력하세요"
                  required
                />
              </div>

              {materialCategory === 'prompt' ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">프롬프트 내용</label>
                  <textarea
                    value={materialPrompt}
                    onChange={(e) => setMaterialPrompt(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[150px] resize-none"
                    placeholder="프롬프트 내용을 입력하세요"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">자료 URL (링크)</label>
                  <input
                    type="url"
                    value={materialUrl}
                    onChange={(e) => setMaterialUrl(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="https://..."
                    required
                  />
                </div>
              )}

              {(materialCategory === 'webbuilder' || materialCategory === 'ebook') && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">썸네일 이미지 URL</label>
                  <input
                    type="url"
                    value={materialImageUrl}
                    onChange={(e) => setMaterialImageUrl(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="https://... (이미지 주소)"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">카테고리</label>
                  <select
                    value={materialCategory}
                    onChange={(e) => setMaterialCategory(e.target.value as any)}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="webbuilder">웹빌더앱</option>
                    <option value="advanced">고급 자료실</option>
                    <option value="ebook">전자책</option>
                    <option value="prompt">프롬프트</option>
                    <option value="service">그외 자료</option>
                  </select>
                </div>
                {materialCategory === 'webbuilder' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">서브 카테고리</label>
                    <select
                      value={materialSubCategory}
                      onChange={(e) => setMaterialSubCategory(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="">선택 안함</option>
                      <option value="AI STUDIO">AI STUDIO</option>
                      <option value="VERCEL">VERCEL</option>
                      <option value="ETC">ETC</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">열람 가능 등급</label>
                  <select
                    value={materialTier}
                    onChange={(e) => setMaterialTier(e.target.value as any)}
                    className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="free">무료 회원 이상</option>
                    <option value="silver">실버 회원 이상</option>
                    <option value="gold">골드 회원 전용</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      수정하기
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {isMessageModalOpen && (isBulkMode || selectedUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-500" />
                {isBulkMode ? `일괄 쪽지 발송 (${selectedUserIds.size}명)` : '쪽지 발송'}
              </h2>
              <button 
                onClick={() => {
                  setIsMessageModalOpen(false);
                  setIsBulkMode(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">수신자</label>
                <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium max-h-24 overflow-y-auto">
                  {isBulkMode ? (
                    <div className="flex flex-wrap gap-1">
                      {Array.from(selectedUserIds).map(id => {
                        const u = users.find(user => user.id === id);
                        return u ? (
                          <span key={id} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded text-xs">
                            {u.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    `${selectedUser.name} (${selectedUser.email})`
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">제목</label>
                <input
                  type="text"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="쪽지 제목을 입력하세요"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">내용</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[150px] resize-none"
                  placeholder="쪽지 내용을 입력하세요"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsMessageModalOpen(false);
                    setIsBulkMode(false);
                  }}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {isBulkMode ? '일괄 발송' : '발송하기'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Alert Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141d] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">알림</h3>
                <button 
                  onClick={() => setAlertModal({ isOpen: false, message: '' })}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {alertModal.message}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setAlertModal({ isOpen: false, message: '' })}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141d] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">확인</h3>
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-6">
                {confirmModal.message}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
                  }}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
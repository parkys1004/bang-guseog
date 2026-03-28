import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Activity, Database, ShieldCheck, Mail, Calendar, Edit2, Check, X, Search, Send } from 'lucide-react';

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
    throw new Error(JSON.stringify(errInfo));
  };

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (err: any) {
      handleFirestoreError(err, 'get', 'users');
      setError("사용자 목록을 불러오는데 실패했습니다. (Firestore 규칙을 확인해주세요)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

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
      fetchUsers(); // Refresh the list
    } catch (err) {
      handleFirestoreError(err, 'update', `users/${userId}`);
      alert("사용 기간 업데이트에 실패했습니다.");
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
      
      alert(`${recipients.length}명에게 쪽지가 성공적으로 발송되었습니다.`);
      setIsMessageModalOpen(false);
      setMessageTitle('');
      setMessageContent('');
      setSelectedUser(null);
      setIsBulkMode(false);
      if (isBulkMode) setSelectedUserIds(new Set());
    } catch (err) {
      handleFirestoreError(err, 'create', 'messages');
      alert('쪽지 발송에 실패했습니다.');
    } finally {
      setIsSending(false);
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
        
        {selectedUserIds.size > 0 && (
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
    </div>
  );
};

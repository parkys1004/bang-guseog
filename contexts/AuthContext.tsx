import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  unlink,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string | null;
  role: 'admin' | 'user';
  tier: 'free' | 'silver' | 'gold';
  subscriptionEndDate?: string | null;
  providerId?: string;
  providers?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  unlinkGoogleAccount: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileInfo: (name: string, photoURL?: string) => Promise<void>;
  updateEmailAddress: (newEmail: string) => Promise<void>;
  updatePasswordValue: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: (email: string, password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified && firebaseUser.providerData[0]?.providerId === 'password') {
          await signOut(auth);
          setUser(null);
          setLoading(false);
          return;
        }

        if (firebaseUser.email) {
          try {
            const deletedUserDoc = await getDoc(doc(db, 'deleted_users', firebaseUser.email));
            if (deletedUserDoc.exists()) {
              const deletedAt = new Date(deletedUserDoc.data().deletedAt);
              const now = new Date();
              const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
              if (now.getTime() - deletedAt.getTime() < sevenDaysInMillis) {
                await signOut(auth);
                setUser(null);
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            console.error("Error checking ban status in auth state changed", e);
          }
        }

        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          let role: 'admin' | 'user' = 'user';
          let tier: 'free' | 'silver' | 'gold' = 'free';
          let subscriptionEndDate: string | null = null;
          
          if (userDoc.exists()) {
            role = userDoc.data().role || 'user';
            tier = userDoc.data().tier || 'free';
            subscriptionEndDate = userDoc.data().subscriptionEndDate || null;
          } else {
            // First user or specific email becomes admin
            role = firebaseUser.email === 'aimaster1004@gmail.com' ? 'admin' : 'user';
            tier = 'silver'; // Give silver access for 1 day
            
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            subscriptionEndDate = tomorrow.toISOString();

            await setDoc(userDocRef, {
              email: firebaseUser.email,
              name: firebaseUser.displayName || '사용자',
              role: role,
              tier: tier,
              subscriptionEndDate,
              createdAt: new Date().toISOString()
            });

            // Get master password
            let masterPassword = '';
            try {
              const configDoc = await getDoc(doc(db, 'config', 'globalConfig'));
              if (configDoc.exists()) {
                masterPassword = configDoc.data().currentPassword || '';
              }
            } catch (e) {
              console.error("Failed to get master password", e);
            }

            // Send welcome message
            try {
              await addDoc(collection(db, 'messages'), {
                title: '가입을 환영합니다!',
                content: `방구석 작곡가에 오신 것을 환영합니다!\n\n현재 마스터 비밀번호는 [ ${masterPassword} ] 입니다.\n사용 기간은 가입일로부터 1일로 자동 설정되었습니다.`,
                receiverId: firebaseUser.uid,
                senderId: 'system',
                senderName: '시스템 관리자',
                isRead: false,
                createdAt: new Date().toISOString()
              });
            } catch (e) {
              console.error("Failed to send welcome message", e);
            }

            // Send admin notification
            try {
              await addDoc(collection(db, 'messages'), {
                title: '🎉 신규 회원 가입 알림',
                content: `${firebaseUser.displayName || '사용자'} (${firebaseUser.email}) 님이 새로 가입했습니다.`,
                receiverId: 'admin',
                senderId: firebaseUser.uid,
                senderName: '시스템 알림',
                isRead: false,
                createdAt: new Date().toISOString()
              });
            } catch (e) {
              console.error("Failed to send admin notification", e);
            }

            // Send Discord webhook notification
            try {
              const webhookUrl = 'https://discord.com/api/webhooks/1490519327223582950/eQDEhqz1AbmdsSdeifBJlvQY1dcbOjnVtCsdo1gFtqX2gjwSCWTJHI4ZEEFq71zJJvtv';
              await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  embeds: [{
                    title: "🎉 신규 회원 가입 알림",
                    description: "방구석 작곡가 서비스에 새로운 회원이 가입했습니다.",
                    color: 3447003, // Blue color
                    fields: [
                      { name: "이름", value: firebaseUser.displayName || '사용자', inline: true },
                      { name: "이메일", value: firebaseUser.email || '이메일 없음', inline: true }
                    ],
                    timestamp: new Date().toISOString()
                  }]
                })
              });
            } catch (e) {
              console.error("Failed to send Discord notification", e);
            }
          }

          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '사용자',
            photoURL: firebaseUser.photoURL,
            role,
            tier,
            subscriptionEndDate,
            providerId: firebaseUser.providerData[0]?.providerId,
            providers: firebaseUser.providerData.map(p => p.providerId)
          });
        } catch (error) {
          console.error("Error fetching user role:", error);
          // Fallback if Firestore fails (e.g. permission denied)
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '사용자',
            photoURL: firebaseUser.photoURL,
            role: 'user',
            tier: 'free',
            providerId: firebaseUser.providerData[0]?.providerId,
            providers: firebaseUser.providerData.map(p => p.providerId)
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified && userCredential.user.providerData[0]?.providerId === 'password') {
        await signOut(auth);
        throw new Error('auth/not-verified');
      }
    } catch (error: any) {
      console.error("Login error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      if (error.message === 'auth/not-verified') {
        throw new Error('이메일 인증이 완료되지 않았습니다. 가입하신 이메일의 메일함을 확인해주세요.');
      }
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
      }
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('인증되지 않은 도메인입니다. 관리자에게 문의하세요.');
      }
      throw new Error(`로그인 중 오류가 발생했습니다: ${error.code || error.message}`);
    }
  };

  const resendVerificationEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
      } else {
        await signOut(auth);
        throw new Error('이미 인증된 계정입니다. 로그인해주세요.');
      }
    } catch (error: any) {
      console.error("Resend verification error:", error);
      if (error.message === '이미 인증된 계정입니다. 로그인해주세요.') throw error;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
      }
      throw new Error(`인증 메일 재전송 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const deletedUserDoc = await getDoc(doc(db, 'deleted_users', email));
      if (deletedUserDoc.exists()) {
        const deletedAt = new Date(deletedUserDoc.data().deletedAt);
        const now = new Date();
        const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
        if (now.getTime() - deletedAt.getTime() < sevenDaysInMillis) {
          const remainingMillis = sevenDaysInMillis - (now.getTime() - deletedAt.getTime());
          const remainingDays = Math.ceil(remainingMillis / (1000 * 60 * 60 * 24));
          throw new Error(`탈퇴 또는 강퇴된 계정입니다. ${remainingDays}일 후에 재가입이 가능합니다.`);
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      const role = email === 'aimaster1004@gmail.com' ? 'admin' : 'user';
      const tier = 'silver'; // Give silver access for 1 day
      
      // Save user to Firestore
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const subscriptionEndDate = tomorrow.toISOString();

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          name,
          role,
          tier,
          subscriptionEndDate,
          createdAt: new Date().toISOString()
        });

        // Get master password
        let masterPassword = '';
        try {
          const configDoc = await getDoc(doc(db, 'config', 'globalConfig'));
          if (configDoc.exists()) {
            masterPassword = configDoc.data().currentPassword || '';
          }
        } catch (e) {
          console.error("Failed to get master password", e);
        }

        // Send welcome message
        await addDoc(collection(db, 'messages'), {
          title: '가입을 환영합니다!',
          content: `방구석 작곡가에 오신 것을 환영합니다!\n\n현재 마스터 비밀번호는 [ ${masterPassword} ] 입니다.\n사용 기간은 가입일로부터 1일로 자동 설정되었습니다.`,
          receiverId: userCredential.user.uid,
          senderId: 'system',
          senderName: '시스템 관리자',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } catch (fsError: any) {
        console.error("Firestore signup error:", fsError);
      }

      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // Sign out immediately
      await signOut(auth);
      setUser(null);
      
      throw new Error('auth/verification-sent');
    } catch (error: any) {
      console.error("Signup error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      if (error.message.includes('탈퇴 또는 강퇴된 계정입니다')) {
        throw error;
      }
      if (error.message === 'auth/verification-sent') {
        throw new Error('가입하신 이메일로 인증 메일이 발송되었습니다. 이메일 인증 후 로그인해주세요.');
      }
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('이미 가입된 이메일입니다.');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('비밀번호는 6자리 이상이어야 합니다.');
      }
      throw new Error(`회원가입 중 오류가 발생했습니다: ${error.code || error.message}`);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user.email) {
        const deletedUserDoc = await getDoc(doc(db, 'deleted_users', result.user.email));
        if (deletedUserDoc.exists()) {
          const deletedAt = new Date(deletedUserDoc.data().deletedAt);
          const now = new Date();
          const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
          if (now.getTime() - deletedAt.getTime() < sevenDaysInMillis) {
            const remainingMillis = sevenDaysInMillis - (now.getTime() - deletedAt.getTime());
            const remainingDays = Math.ceil(remainingMillis / (1000 * 60 * 60 * 24));
            
            await result.user.delete().catch(() => signOut(auth));
            throw new Error(`탈퇴 또는 강퇴된 계정입니다. ${remainingDays}일 후에 재가입이 가능합니다.`);
          }
        }
      }
    } catch (error: any) {
      console.error("Google login error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      if (error.message.includes('탈퇴 또는 강퇴된 계정입니다')) {
        throw error;
      }
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('인증되지 않은 도메인입니다. 관리자에게 문의하세요.');
      }
      if (error.message && error.message.includes('disallowed_useragent')) {
        throw new Error('앱 내장 브라우저에서는 구글 로그인을 지원하지 않습니다. 사파리나 크롬 등 외부 브라우저로 접속해주세요.');
      }
      throw new Error(`구글 로그인 중 오류가 발생했습니다: ${error.code || error.message}`);
    }
  };

  const linkGoogleAccount = async () => {
    if (!auth.currentUser) throw new Error('로그인이 필요합니다.');
    try {
      const provider = new GoogleAuthProvider();
      const result = await linkWithPopup(auth.currentUser, provider);
      
      // Update user state with new providers
      setUser(prev => prev ? {
        ...prev,
        providers: result.user.providerData.map(p => p.providerId)
      } : null);
    } catch (error: any) {
      console.error("Google link error:", error);
      if (error.code === 'auth/credential-already-in-use') {
        throw new Error('이미 다른 계정에 연결된 구글 계정입니다.');
      }
      if (error.message && error.message.includes('disallowed_useragent')) {
        throw new Error('앱 내장 브라우저에서는 구글 계정 연결을 지원하지 않습니다. 사파리나 크롬 등 외부 브라우저로 접속해주세요.');
      }
      throw new Error(`구글 계정 연결 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const unlinkGoogleAccount = async () => {
    if (!auth.currentUser) throw new Error('로그인이 필요합니다.');
    
    // Check if user has other providers or a password before unlinking
    const hasPassword = auth.currentUser.providerData.some(p => p.providerId === 'password');
    const otherProviders = auth.currentUser.providerData.filter(p => p.providerId !== 'google.com');
    
    if (!hasPassword && otherProviders.length === 0) {
      throw new Error('비밀번호가 설정되어 있지 않아 구글 계정 연결을 해제할 수 없습니다. 먼저 비밀번호를 설정해주세요.');
    }

    try {
      const result = await unlink(auth.currentUser, 'google.com');
      
      // Update user state with new providers
      setUser(prev => prev ? {
        ...prev,
        providers: result.providerData.map(p => p.providerId)
      } : null);
    } catch (error: any) {
      console.error("Google unlink error:", error);
      throw new Error(`구글 계정 연결 해제 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfileInfo = async (name: string, photoURL?: string) => {
    if (!auth.currentUser) throw new Error('로그인이 필요합니다.');
    
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoURL || auth.currentUser.photoURL
      });

      // Update Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        name: name,
        photoURL: photoURL || auth.currentUser.photoURL || null
      });

      setUser(prev => prev ? { ...prev, name, photoURL: photoURL || prev.photoURL } : null);
    } catch (error: any) {
      console.error("Profile update error:", error);
      throw new Error(`프로필 수정 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const updateEmailAddress = async (newEmail: string) => {
    if (!auth.currentUser) throw new Error('로그인이 필요합니다.');
    
    try {
      await updateEmail(auth.currentUser, newEmail);
      
      // Update Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        email: newEmail
      });

      setUser(prev => prev ? { ...prev, email: newEmail } : null);
    } catch (error: any) {
      console.error("Email update error:", error);
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('보안을 위해 다시 로그인한 후 이메일을 변경해주세요.');
      }
      throw new Error(`이메일 변경 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const updatePasswordValue = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser || !auth.currentUser.email) throw new Error('로그인이 필요합니다.');
    
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      console.error("Password update error:", error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('현재 비밀번호가 일치하지 않습니다.');
      }
      throw new Error(`비밀번호 변경 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Password reset error:", error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('가입되지 않은 이메일입니다.');
      }
      throw new Error(`비밀번호 재설정 이메일 발송 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) throw new Error('로그인이 필요합니다.');
    
    const uid = auth.currentUser.uid;
    const email = auth.currentUser.email;
    
    try {
      if (email) {
        await setDoc(doc(db, 'deleted_users', email), {
          email,
          deletedAt: new Date().toISOString(),
          reason: 'withdrawal'
        });
      }

      // Delete from Firestore first
      await deleteDoc(doc(db, 'users', uid));
      
      // Delete from Auth
      await deleteUser(auth.currentUser);
      
      setUser(null);
    } catch (error: any) {
      console.error("Account deletion error:", error);
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('보안을 위해 다시 로그인한 후 계정을 탈퇴해주세요.');
      }
      throw new Error(`계정 탈퇴 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      loginWithGoogle, 
      linkGoogleAccount,
      unlinkGoogleAccount,
      logout, 
      updateProfileInfo,
      updateEmailAddress,
      updatePasswordValue,
      resetPassword,
      resendVerificationEmail,
      deleteAccount,
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

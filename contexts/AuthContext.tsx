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
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  login: (email: string, password: string, targetAppUrl?: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (targetAppUrl?: string) => Promise<void>;
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
            await setDoc(userDocRef, {
              email: firebaseUser.email,
              name: firebaseUser.displayName || '사용자',
              role: role,
              tier: tier,
              subscriptionEndDate: null,
              createdAt: new Date().toISOString()
            });
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

  /**
   * @param {string} email - 사용자 이메일
   * @param {string} password - 사용자 비밀번호
   * @param {string} targetAppUrl - 이동할 지점 앱의 주소 (기본값 설정 가능)
   */
  const login = async (email: string, password: string, targetAppUrl: string = "https://app-test-olive-sigma.vercel.app") => {
    try {
      // 1. 본점 로그인 시도 (이메일/비번 방식)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified && userCredential.user.providerData[0]?.providerId === 'password') {
        await signOut(auth);
        throw new Error('auth/not-verified');
      }

      const user = userCredential.user;
      if (user && user.email) {
        // 2. 이메일 인코딩 (주소창 오류 방지)
        const encodedEmail = encodeURIComponent(user.email);
        
        // 3. 선택한 지점 앱으로 이메일을 들고 자동 이동!
        // 예: https://app1.vercel.app?u=gandi11@nate.com
        window.location.href = `${targetAppUrl}?u=${encodedEmail}`;
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      const role = email === 'aimaster1004@gmail.com' ? 'admin' : 'user';
      const tier = 'free';
      
      // Save user to Firestore
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          name,
          role,
          tier,
          subscriptionEndDate: null,
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

  /**
   * @param {string} targetAppUrl - 이동할 지점 앱의 주소 (기본값 설정 가능)
   */
  const loginWithGoogle = async (targetAppUrl: string = "https://app-test-olive-sigma.vercel.app") => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const user = userCredential.user;
      if (user && user.email) {
        // 2. 이메일 인코딩 (주소창 오류 방지)
        const encodedEmail = encodeURIComponent(user.email);
        
        // 3. 선택한 지점 앱으로 이메일을 들고 자동 이동!
        window.location.href = `${targetAppUrl}?u=${encodedEmail}`;
      }
    } catch (error: any) {
      console.error("Google login error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
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
    
    try {
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

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
  unlink
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string | null;
  role: 'admin' | 'user';
  subscriptionEndDate?: string | null;
  providerId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileInfo: (name: string, photoURL?: string) => Promise<void>;
  updateEmailAddress: (newEmail: string) => Promise<void>;
  updatePasswordValue: (currentPassword: string, newPassword: string) => Promise<void>;
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
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          let role: 'admin' | 'user' = 'user';
          let subscriptionEndDate: string | null = null;
          
          if (userDoc.exists()) {
            role = userDoc.data().role || 'user';
            subscriptionEndDate = userDoc.data().subscriptionEndDate || null;
          } else {
            // First user or specific email becomes admin
            role = firebaseUser.email === 'aimaster1004@gmail.com' ? 'admin' : 'user';
            await setDoc(userDocRef, {
              email: firebaseUser.email,
              name: firebaseUser.displayName || '사용자',
              role: role,
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
            subscriptionEndDate,
            providerId: firebaseUser.providerData[0]?.providerId
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
            providerId: firebaseUser.providerData[0]?.providerId
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
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Login error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
      }
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('인증되지 않은 도메인입니다. 관리자에게 문의하세요.');
      }
      throw new Error(`로그인 중 오류가 발생했습니다: ${error.code || error.message}`);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      const role = email === 'aimaster1004@gmail.com' ? 'admin' : 'user';
      
      // Save user to Firestore
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          name,
          role,
          subscriptionEndDate: null,
          createdAt: new Date().toISOString()
        });
      } catch (fsError: any) {
        console.error("Firestore signup error:", fsError);
        // We don't throw here to allow the user to be logged in even if Firestore fails
        // The onAuthStateChanged will try to fix it later
      }

      setUser({
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: name,
        role,
        subscriptionEndDate: null
      });
    } catch (error: any) {
      console.error("Signup error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
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
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google login error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('인증되지 않은 도메인입니다. 관리자에게 문의하세요.');
      }
      throw new Error(`구글 로그인 중 오류가 발생했습니다: ${error.code || error.message}`);
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
      logout, 
      updateProfileInfo,
      updateEmailAddress,
      updatePasswordValue,
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

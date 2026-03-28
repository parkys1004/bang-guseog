import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  subscriptionEndDate?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
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
            role,
            subscriptionEndDate
          });
        } catch (error) {
          console.error("Error fetching user role:", error);
          // Fallback if Firestore fails (e.g. permission denied)
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '사용자',
            role: 'user'
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

  return (
    <AuthContext.Provider value={{ user, login, signup, loginWithGoogle, logout, loading }}>
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

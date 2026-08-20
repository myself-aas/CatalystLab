import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  loginWithGoogle, 
  logout as fbLogout, 
  type User,
  type AuthErrorInfo 
} from '../lib/firebase';

export const SUPERADMIN_EMAILS = [
  'shuvo.1807016@bau.edu.bd',
  'shuvoasifahmed@gmail.com',
  'asifahmedshuvo.aas@gmail.com'
];

const LOCAL_SESSION_KEY = 'catalystlab_local_session';

export interface LocalSessionParams {
  email?: string;
  displayName?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  authError: AuthErrorInfo | null;
  showDomainModal: boolean;
  setShowDomainModal: (open: boolean) => void;
  login: () => Promise<User | null>;
  loginWithLocalSession: (params?: LocalSessionParams) => void;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  authError: null,
  showDomainModal: false,
  setShowDomainModal: () => {},
  login: async () => null,
  loginWithLocalSession: () => {},
  logout: async () => {},
  clearAuthError: () => {}
});

function getStoredLocalSession(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredLocalSession());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);
  const [showDomainModal, setShowDomainModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Real Firebase Auth session is active
        setUser(currentUser);
        try {
          localStorage.removeItem(LOCAL_SESSION_KEY);
        } catch {}
      } else {
        // Check for local preview session fallback
        const local = getStoredLocalSession();
        if (local) {
          setUser(local);
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (): Promise<User | null> => {
    setAuthError(null);
    try {
      const loggedUser = await loginWithGoogle();
      setUser(loggedUser);
      return loggedUser;
    } catch (error: any) {
      const isUnauthorized = error?.isUnauthorizedDomain || 
        error?.code === 'auth/unauthorized-domain' ||
        (typeof error?.message === 'string' && error.message.includes('unauthorized-domain'));
      
      const isCancelled = error?.isUserCancelled || 
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request';

      const errorInfo: AuthErrorInfo = {
        code: error?.code || 'auth/error',
        message: error?.message || 'Authentication failed',
        domain: error?.domain || (typeof window !== 'undefined' ? window.location.hostname : ''),
        isUnauthorizedDomain: Boolean(isUnauthorized),
        isUserCancelled: Boolean(isCancelled)
      };

      setAuthError(errorInfo);

      if (isUnauthorized) {
        setShowDomainModal(true);
      }

      return null;
    }
  };

  const loginWithLocalSession = (params?: LocalSessionParams) => {
    const isAdmin = params?.isAdmin ?? true;
    const email = params?.email || (isAdmin ? 'asifahmedshuvo.aas@gmail.com' : 'developer@catalystlab.io');
    const displayName = params?.displayName || (isAdmin ? 'Asif Ahmed Shuvo (Superadmin)' : 'CatalystLab Developer');
    
    const mockUser = {
      uid: isAdmin ? 'superadmin-dev-01' : 'dev-user-01',
      email,
      displayName,
      photoURL: '',
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
      providerData: [{
        providerId: 'google.com',
        uid: isAdmin ? 'superadmin-dev-01' : 'dev-user-01',
        displayName,
        email,
        phoneNumber: null,
        photoURL: null
      }]
    } as unknown as User;

    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mockUser));
    } catch (err) {
      console.warn("Failed to persist local session:", err);
    }

    setUser(mockUser);
    setAuthError(null);
  };

  const logout = async () => {
    try {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    } catch {}
    
    try {
      await fbLogout();
    } catch (error) {
      console.warn("Firebase signout notice:", error);
    }
    
    setUser(null);
    setAuthError(null);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  // Strictly enforce superadmin access for specified emails only
  const userEmail = user?.email?.toLowerCase() || '';
  const isAdmin = Boolean(user && SUPERADMIN_EMAILS.includes(userEmail));

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin, 
      authError,
      showDomainModal,
      setShowDomainModal,
      login, 
      loginWithLocalSession,
      logout,
      clearAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

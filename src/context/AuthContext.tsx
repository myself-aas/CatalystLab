import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  loginWithGoogle as fbLoginWithGoogle,
  loginWithGithub as fbLoginWithGithub,
  loginWithEmail as fbLoginWithEmail,
  signUpWithEmail as fbSignUpWithEmail,
  sendPasswordReset as fbSendPasswordReset,
  logout as fbLogout, 
  type User,
  type AuthErrorInfo,
  formatAuthError
} from '../lib/firebase';
import { logger } from '../lib/logger';
import { isSuperadminClaim } from '../lib/authClaims';

/** @deprecated Superadmin is exclusively a signed custom claim. Kept empty so legacy imports compile. */
export const SUPERADMIN_EMAILS: string[] = [];

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
  hasSuperadminClaim: boolean;
  tokenClaims: Record<string, any>;
  authError: AuthErrorInfo | null;
  showDomainModal: boolean;
  setShowDomainModal: (open: boolean) => void;
  login: () => Promise<User | null>;
  loginWithGoogle: () => Promise<User | null>;
  loginWithGithub: () => Promise<User | null>;
  loginWithEmail: (email: string, pass: string) => Promise<User | null>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<User | null>;
  sendPasswordReset: (email: string) => Promise<void>;
  loginWithLocalSession: (params?: LocalSessionParams) => void;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  hasSuperadminClaim: false,
  tokenClaims: {},
  authError: null,
  showDomainModal: false,
  setShowDomainModal: () => {},
  login: async () => null,
  loginWithGoogle: async () => null,
  loginWithGithub: async () => null,
  loginWithEmail: async () => null,
  signUpWithEmail: async () => null,
  sendPasswordReset: async () => {},
  loginWithLocalSession: () => {},
  logout: async () => {},
  clearAuthError: () => {},
  refreshClaims: async () => {}
});

function getStoredLocalSession(): User | null {
  if (!import.meta.env.DEV) return null;
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
  const [tokenClaims, setTokenClaims] = useState<Record<string, any>>({});
  const [hasSuperadminClaim, setHasSuperadminClaim] = useState<boolean>(false);

  const checkUserClaims = async (currentUser: User | null) => {
    if (!currentUser) {
      setTokenClaims({});
      setHasSuperadminClaim(false);
      return;
    }

    if (typeof (currentUser as any).getIdTokenResult === 'function') {
      try {
        const result = await (currentUser as any).getIdTokenResult();
        const claims = result?.claims || {};
        setTokenClaims(claims);
        setHasSuperadminClaim(isSuperadminClaim(claims));
        return;
      } catch (err) {
        logger.warn("Could not retrieve custom token claims:", err);
      }
    }

    setHasSuperadminClaim(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Real Firebase Auth session is active
        setUser(currentUser);
        await checkUserClaims(currentUser);
        try {
          localStorage.removeItem(LOCAL_SESSION_KEY);
        } catch (e) { logger.error("Ignored error:", e); }
      } else {
        // Check for local preview session fallback
        const local = getStoredLocalSession();
        if (local) {
          setUser(local);
          await checkUserClaims(local);
        } else {
          setUser(null);
          setTokenClaims({});
          setHasSuperadminClaim(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshClaims = async () => {
    if (user && typeof (user as any).getIdTokenResult === 'function') {
      try {
        const result = await (user as any).getIdTokenResult(true);
        const claims = result?.claims || {};
        setTokenClaims(claims);
        setHasSuperadminClaim(isSuperadminClaim(claims));
      } catch (err) {
        logger.warn("Failed to refresh token claims:", err);
      }
    }
  };

  const handleAuthError = (error: unknown) => {
    const errorInfo: AuthErrorInfo = formatAuthError(error);
    setAuthError(errorInfo);
    if (errorInfo.isUnauthorizedDomain) {
      setShowDomainModal(true);
    }
    return errorInfo;
  };

  const loginWithGoogle = async (): Promise<User | null> => {
    setAuthError(null);
    try {
      const loggedUser = await fbLoginWithGoogle();
      setUser(loggedUser);
      await checkUserClaims(loggedUser);
      return loggedUser;
    } catch (error: unknown) {
      handleAuthError(error);
      return null;
    }
  };

  const loginWithGithub = async (): Promise<User | null> => {
    setAuthError(null);
    try {
      const loggedUser = await fbLoginWithGithub();
      setUser(loggedUser);
      await checkUserClaims(loggedUser);
      return loggedUser;
    } catch (error: unknown) {
      handleAuthError(error);
      return null;
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<User | null> => {
    setAuthError(null);
    try {
      const loggedUser = await fbLoginWithEmail(email, pass);
      setUser(loggedUser);
      await checkUserClaims(loggedUser);
      return loggedUser;
    } catch (error: unknown) {
      handleAuthError(error);
      return null;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string): Promise<User | null> => {
    setAuthError(null);
    try {
      const loggedUser = await fbSignUpWithEmail(email, pass, name);
      setUser(loggedUser);
      await checkUserClaims(loggedUser);
      return loggedUser;
    } catch (error: unknown) {
      handleAuthError(error);
      return null;
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    setAuthError(null);
    try {
      await fbSendPasswordReset(email);
    } catch (error: unknown) {
      handleAuthError(error);
      throw error;
    }
  };

  const login = async (): Promise<User | null> => {
    return loginWithGoogle();
  };

  const loginWithLocalSession = (params?: LocalSessionParams) => {
    if (!import.meta.env.DEV) {
      logger.warn('Sandbox local sessions are disabled outside development.');
      return;
    }
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
      logger.warn("Failed to persist local session:", err);
    }

    setUser(mockUser);
    setHasSuperadminClaim(isAdmin);
    setAuthError(null);
  };

  const logout = async () => {
    try {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    } catch (e) { logger.error("Ignored error:", e); }
    
    try {
      await fbLogout();
    } catch (error) {
      logger.warn("Firebase signout notice:", error);
    }
    
    setUser(null);
    setHasSuperadminClaim(false);
    setTokenClaims({});
    setAuthError(null);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const isAdmin = hasSuperadminClaim;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin, 
      hasSuperadminClaim,
      tokenClaims,
      authError,
      showDomainModal,
      setShowDomainModal,
      login, 
      loginWithGoogle,
      loginWithGithub,
      loginWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      loginWithLocalSession,
      logout,
      clearAuthError,
      refreshClaims
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

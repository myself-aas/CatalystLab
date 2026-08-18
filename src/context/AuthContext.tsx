import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, loginWithGoogle, logout as fbLogout, type User } from '../lib/firebase';

export const SUPERADMIN_EMAILS = [
  'shuvo.1807016@bau.edu.bd',
  'shuvoasifahmed@gmail.com',
  'asifahmedshuvo.aas@gmail.com'
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  login: async () => {},
  logout: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Auth login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fbLogout();
    } catch (error) {
      console.error("Auth logout error:", error);
      throw error;
    }
  };

  // Strictly enforce superadmin access for specified emails only
  const userEmail = user?.email?.toLowerCase() || '';
  const isAdmin = Boolean(user && SUPERADMIN_EMAILS.includes(userEmail));

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

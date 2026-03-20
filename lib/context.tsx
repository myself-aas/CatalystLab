'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from './constants';

interface AppState {
  sessions: Session[];
  addSession: (session: Session) => void;
  deleteSession: (id: string) => void;
  geminiKey: string;
  setGeminiKey: (key: string) => void;
  coreKey: string;
  setCoreKey: (key: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nl_sessions');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [geminiKey, setGeminiKeyState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nl_gemini_key') || '';
    }
    return '';
  });
  const [coreKey, setCoreKeyState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nl_core_key') || '';
    }
    return '';
  });

  useEffect(() => {
    // No-op, just to satisfy dependency requirements if needed
  }, []);

  const addSession = (session: Session) => {
    const newSessions = [session, ...sessions];
    setSessions(newSessions);
    localStorage.setItem('nl_sessions', JSON.stringify(newSessions));
  };

  const deleteSession = (id: string) => {
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    localStorage.setItem('nl_sessions', JSON.stringify(newSessions));
  };

  const setGeminiKey = (key: string) => {
    setGeminiKeyState(key);
    localStorage.setItem('nl_gemini_key', key);
  };

  const setCoreKey = (key: string) => {
    setCoreKeyState(key);
    localStorage.setItem('nl_core_key', key);
  };

  return (
    <AppContext.Provider value={{
      sessions,
      addSession,
      deleteSession,
      geminiKey,
      setGeminiKey,
      coreKey,
      setCoreKey
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

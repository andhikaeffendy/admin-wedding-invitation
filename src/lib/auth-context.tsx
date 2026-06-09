"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AdminAccount } from './accounts';

interface AuthContextType {
  account: AdminAccount | null;
  isLoggedIn: boolean;
  login: (account: AdminAccount) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  account: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Restore session from localStorage
    const stored = localStorage.getItem('wedding-admin-account');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAccount(parsed);
        setIsLoggedIn(true);
      } catch {}
    }
  }, []);

  const login = (acc: AdminAccount) => {
    setAccount(acc);
    setIsLoggedIn(true);
    localStorage.setItem('wedding-admin-account', JSON.stringify({
      ...acc,
      lastLogin: new Date().toLocaleString('id-ID'),
    }));
  };

  const logout = () => {
    setAccount(null);
    setIsLoggedIn(false);
    localStorage.removeItem('wedding-admin-account');
  };

  return (
    <AuthContext.Provider value={{ account, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

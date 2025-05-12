
"use client";

import type { User } from '@/types';
import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email_provided: string, password_provided: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials for demonstration
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "adminpassword";
const USER_EMAIL = "user@example.com";
const USER_PASSWORD = "userpassword";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('streamverse-user', null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading user from storage
    const user = readUserFromStorage();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const readUserFromStorage = (): User | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const item = window.localStorage.getItem('streamverse-user');
      return item ? (JSON.parse(item) as User) : null;
    } catch (error) {
      console.warn('Error reading user from localStorage:', error);
      return null;
    }
  };


  const login = async (email_provided: string, password_provided: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    let user: User | null = null;

    if (email_provided === ADMIN_EMAIL && password_provided === ADMIN_PASSWORD) {
      user = { id: 'admin-123', email: ADMIN_EMAIL, role: 'admin', name: 'Admin User' };
    } else if (email_provided === USER_EMAIL && password_provided === USER_PASSWORD) {
      user = { id: 'user-456', email: USER_EMAIL, role: 'user', name: 'Regular User' };
    }

    setCurrentUser(user);
    setIsLoading(false);
    if (user) {
      router.push('/'); // Redirect to home after successful login
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    router.push('/login'); // Redirect to login after logout
  };
  
  const contextValue = useMemo(() => ({ currentUser, isLoading, login, logout }), [currentUser, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

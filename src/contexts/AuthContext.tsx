
"use client";

import type { User, InviteCodeConfig } from '@/types';
import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";


// Hardcoded credentials for demonstration
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "adminpassword";
const USER_EMAIL = "user@example.com";
const USER_PASSWORD = "userpassword";


interface AuthContextType {
  currentUser: User | null;
  users: User[];
  inviteCodes: InviteCodeConfig[];
  isLoading: boolean;
  login: (email_provided: string, password_provided: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email_provided: string, password_provided: string, inviteCode: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userId: string, updatedFields: Partial<User>) => void;
  createInviteCode: (code: string, description: string, maxUses: number) => Promise<{ success: boolean; error?: string }>;
  toggleInviteCodeStatus: (code: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  // --- Use 'prismmtv' prefix for local storage keys ---
  const [users, setUsers] = useLocalStorage<User[]>('prismmtv-users', [
     { id: 'admin-123', email: ADMIN_EMAIL, role: 'admin', name: 'Admin User', password: ADMIN_PASSWORD, inviteCodeUsed: 'ADMIN_DEFAULT_CODE', lastLogin: new Date(Date.now() - 86400000).toISOString(), lastWatchedVideoId: null },
     { id: 'user-456', email: USER_EMAIL, role: 'user', name: 'Regular User', password: USER_PASSWORD, inviteCodeUsed: 'USER_WELCOME_CODE', lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(), lastWatchedVideoId: 'movie-sim-1' },
  ]);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('prismmtv-current-user', null);
  const [inviteCodes, setInviteCodes] = useLocalStorage<InviteCodeConfig[]>('prismmtv-invite-codes', [
    // Initial default invite codes
    { code: 'ADMIN_DEFAULT_CODE', description: 'Default code for initial admin', maxUses: 1, currentUses: 1, createdAt: new Date().toISOString(), isEnabled: true },
    { code: 'USER_WELCOME_CODE', description: 'Default code for initial user', maxUses: 1, currentUses: 1, createdAt: new Date().toISOString(), isEnabled: true },
    { code: 'PRISMMTV_INVITE', description: 'General public invite', maxUses: 0, currentUses: 0, createdAt: new Date().toISOString(), isEnabled: true }, // 0 maxUses = infinite // Renamed PRISMMTV_INVITE
  ]);
  // -----------------------------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loggedInUser = readCurrentUserFromStorage();
    if (loggedInUser) {
       const userExists = users.some(u => u.id === loggedInUser.id);
       if (userExists) {
          setCurrentUser(loggedInUser);
       } else {
         setCurrentUser(null);
       }
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const readCurrentUserFromStorage = (): User | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const item = window.localStorage.getItem('prismmtv-current-user'); // Use correct key
      return item ? (JSON.parse(item) as User) : null;
    } catch (error) {
      console.warn('Error reading current user from localStorage:', error);
      return null;
    }
  };


  const login = async (email_provided: string, password_provided: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const userIndex = users.findIndex(u => u.email === email_provided && u.password === password_provided);

    if (userIndex !== -1) {
      const userToLogin = { ...users[userIndex], lastLogin: new Date().toISOString() };
      const updatedUsers = [...users];
      updatedUsers[userIndex] = userToLogin;
      setUsers(updatedUsers);
      setCurrentUser(userToLogin); // This uses the hook which writes to 'prismmtv-current-user'
      setIsLoading(false);
      router.push('/');
      toast({ title: "Login Successful", description: `Welcome back, ${userToLogin.name || userToLogin.email}!` });
      return true;
    } else {
      setCurrentUser(null);
      setIsLoading(false);
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid email or password." });
      return false;
    }
  };

  const register = async (name: string, email_provided: string, password_provided: string, inviteCodeValue: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const codeIndex = inviteCodes.findIndex(ic => ic.code === inviteCodeValue);

    if (codeIndex === -1) {
        setIsLoading(false);
        return { success: false, error: "Invalid invite code." };
    }

    const inviteConfig = inviteCodes[codeIndex];

    if (!inviteConfig.isEnabled) {
        setIsLoading(false);
        return { success: false, error: "This invite code is currently disabled." };
    }

    if (inviteConfig.maxUses !== 0 && inviteConfig.currentUses >= inviteConfig.maxUses) {
        setIsLoading(false);
        return { success: false, error: "This invite code has reached its maximum usage limit." };
    }

    if (users.some(u => u.email === email_provided)) {
        setIsLoading(false);
        return { success: false, error: "Email already registered." };
    }

    const newUser: User = {
        id: crypto.randomUUID(),
        email: email_provided,
        password: password_provided,
        role: 'user',
        name: name,
        inviteCodeUsed: inviteCodeValue,
        lastLogin: undefined,
        lastWatchedVideoId: null,
    };

    setUsers([...users, newUser]); // Uses hook writing to 'prismmtv-users'

    // Update invite code usage
    const updatedInviteCodes = [...inviteCodes];
    updatedInviteCodes[codeIndex] = { ...inviteConfig, currentUses: inviteConfig.currentUses + 1 };
    setInviteCodes(updatedInviteCodes); // Uses hook writing to 'prismmtv-invite-codes'

    setIsLoading(false);
    return { success: true };
  };

  const updateUser = (userId: string, updatedFields: Partial<User>) => {
    setUsers(prevUsers => { // Uses hook writing to 'prismmtv-users'
        const userIndex = prevUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) return prevUsers;

        const updatedUsers = [...prevUsers];
        const updatedUser = { ...updatedUsers[userIndex], ...updatedFields };
        updatedUsers[userIndex] = updatedUser;

        if (currentUser && currentUser.id === userId) {
            setCurrentUser(updatedUser); // Uses hook writing to 'prismmtv-current-user'
        }
        return updatedUsers;
    });
  };

  const createInviteCode = async (code: string, description: string, maxUses: number): Promise<{ success: boolean; error?: string }> => {
    if (inviteCodes.some(ic => ic.code === code)) {
      return { success: false, error: "This invite code already exists." };
    }
    if (!code.trim()) {
      return { success: false, error: "Invite code cannot be empty." };
    }

    const newInviteCode: InviteCodeConfig = {
      code,
      description,
      maxUses, // 0 for infinite
      currentUses: 0,
      createdAt: new Date().toISOString(),
      isEnabled: true,
    };
    setInviteCodes(prev => [...prev, newInviteCode]); // Uses hook writing to 'prismmtv-invite-codes'
    toast({ title: "Invite Code Created", description: `Code "${code}" has been added.` });
    return { success: true };
  };

  const toggleInviteCodeStatus = (code: string) => {
    setInviteCodes(prev => // Uses hook writing to 'prismmtv-invite-codes'
      prev.map(ic =>
        ic.code === code ? { ...ic, isEnabled: !ic.isEnabled } : ic
      )
    );
    const updatedCode = inviteCodes.find(ic => ic.code === code);
    toast({ title: `Code "${code}" ${updatedCode?.isEnabled ? "Disabled" : "Enabled" }` });
  };

  const logout = () => {
    setCurrentUser(null); // Uses hook writing to 'prismmtv-current-user'
    router.push('/login');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  const contextValue = useMemo(() => ({
      currentUser,
      users,
      inviteCodes,
      isLoading,
      login,
      logout,
      register,
      updateUser,
      createInviteCode,
      toggleInviteCodeStatus,
  }), [currentUser, users, inviteCodes, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

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


"use client";

import type { User } from '@/types';
import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';

// Hardcoded credentials for demonstration
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "adminpassword";
const USER_EMAIL = "user@example.com";
const USER_PASSWORD = "userpassword";

// Hardcoded valid invite codes for demonstration
const VALID_INVITE_CODES = ['STREAMVERSE_INVITE', 'ADMIN_CODE_XYZ']; // Add more codes as needed

interface AuthContextType {
  currentUser: User | null;
  users: User[]; // Expose the list of users
  isLoading: boolean;
  login: (email_provided: string, password_provided: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email_provided: string, password_provided: string, inviteCode: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userId: string, updatedFields: Partial<User>) => void; // Function to update user details
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useLocalStorage<User[]>('streamverse-users', [
     // Add initial demo users here if needed, or rely solely on registration
     { id: 'admin-123', email: ADMIN_EMAIL, role: 'admin', name: 'Admin User', password: ADMIN_PASSWORD, inviteCodeUsed: 'ADMIN_CODE_XYZ', lastLogin: new Date(Date.now() - 86400000).toISOString(), lastWatchedVideoId: null }, // Storing passwords like this is INSECURE for real apps
     { id: 'user-456', email: USER_EMAIL, role: 'user', name: 'Regular User', password: USER_PASSWORD, inviteCodeUsed: 'STREAMVERSE_INVITE', lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(), lastWatchedVideoId: 'movie-sim-1' }, // Storing passwords like this is INSECURE for real apps
  ]);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('streamverse-current-user', null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if a user is already logged in from previous session
    const loggedInUser = readCurrentUserFromStorage();
    if (loggedInUser) {
       // Optional: Verify if this user still exists in the main user list
       const userExists = users.some(u => u.id === loggedInUser.id);
       if (userExists) {
          setCurrentUser(loggedInUser);
       } else {
         // User might have been deleted or data cleared; log them out.
         setCurrentUser(null);
       }
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const readCurrentUserFromStorage = (): User | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const item = window.localStorage.getItem('streamverse-current-user');
      return item ? (JSON.parse(item) as User) : null;
    } catch (error) {
      console.warn('Error reading current user from localStorage:', error);
      return null;
    }
  };


  const login = async (email_provided: string, password_provided: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

    const userIndex = users.findIndex(u => u.email === email_provided && u.password === password_provided); // INSECURE password check

    if (userIndex !== -1) {
      const userToLogin = { ...users[userIndex], lastLogin: new Date().toISOString() };
      // Update the user in the main list
      const updatedUsers = [...users];
      updatedUsers[userIndex] = userToLogin;
      setUsers(updatedUsers);
      // Set the current user
      setCurrentUser(userToLogin);
      setIsLoading(false);
      router.push('/'); // Redirect to home after successful login
      return true;
    } else {
      setCurrentUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, email_provided: string, password_provided: string, inviteCode: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

    // 1. Validate Invite Code
    if (!VALID_INVITE_CODES.includes(inviteCode)) {
        setIsLoading(false);
        return { success: false, error: "Invalid invite code." };
    }

    // 2. Check if email already exists
    if (users.some(u => u.email === email_provided)) {
        setIsLoading(false);
        return { success: false, error: "Email already registered." };
    }

    // 3. Create new user (default role 'user')
    const newUser: User = {
        id: crypto.randomUUID(),
        email: email_provided,
        password: password_provided, // INSECURE - Store hashed passwords in a real app
        role: 'user', // Default role
        name: name,
        inviteCodeUsed: inviteCode, // Store the invite code used
        lastLogin: undefined, // No login yet
        lastWatchedVideoId: null,
    };

    // 4. Add user to the list
    setUsers([...users, newUser]);

    setIsLoading(false);
    // Optionally log the user in directly after registration, or redirect to login
    // setCurrentUser(newUser);
    // router.push('/');
    return { success: true };
  };

  const updateUser = (userId: string, updatedFields: Partial<User>) => {
    setUsers(prevUsers => {
        const userIndex = prevUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) return prevUsers; // User not found

        const updatedUsers = [...prevUsers];
        const updatedUser = { ...updatedUsers[userIndex], ...updatedFields };
        updatedUsers[userIndex] = updatedUser;

        // Also update currentUser if the modified user is the one logged in
        if (currentUser && currentUser.id === userId) {
            setCurrentUser(updatedUser);
        }

        return updatedUsers;
    });
  };


  const logout = () => {
    setCurrentUser(null);
    router.push('/login'); // Redirect to login after logout
  };

  // Memoize context value including the new users array and updateUser function
  const contextValue = useMemo(() => ({
      currentUser,
      users, // Expose users
      isLoading,
      login,
      logout,
      register,
      updateUser // Expose updater
  }), [currentUser, users, isLoading]); // Add users dependency

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

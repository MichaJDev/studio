
// src/app/login/page.tsx
"use client"; // Required for hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/forms/LoginForm';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { currentUser, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page if user is already logged in and auth state is loaded
    if (!isLoading && currentUser) {
      router.push('/');
    }
  }, [currentUser, isLoading, router]);

  // Show loading indicator while checking auth status or redirecting
  if (isLoading || (!isLoading && currentUser)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
         <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Render the login form only if the user is not logged in and auth state is loaded
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <LoginForm />
    </div>
  );
}

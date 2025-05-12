
// src/app/upload/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import FileUploadForm from '@/components/forms/FileUploadForm';
import { Loader2 } from 'lucide-react';

export default function UploadPage() {
  const { currentUser, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login?redirect=/upload');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <FileUploadForm />
    </div>
  );
}


// src/components/layout/MainLayout.tsx
"use client"; // Make it a client component to use usePathname

import type { ReactNode } from 'react';
import Header from './Header';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isWatchPage = pathname.startsWith('/watch/');

  return (
    <div className="flex min-h-screen flex-col">
      {!isWatchPage && <Header />}
      <main className={`flex-1 ${!isWatchPage ? 'container max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8' : ''}`}>
        {children}
      </main>
      {!isWatchPage && (
        <footer className="py-6 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} PrismmTv. All rights reserved. {/* Changed from StreamVerse */}
        </footer>
      )}
    </div>
  );
}

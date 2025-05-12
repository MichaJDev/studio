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
      {/* Removed container classes from main element */}
      <main className={`flex-1 ${!isWatchPage ? '' : ''}`}>
        {children}
      </main>
      {!isWatchPage && (
        <footer className="py-6 text-center text-muted-foreground text-sm border-t border-border/40 mt-12"> {/* Added border and margin */}
          © {new Date().getFullYear()} PrismmTv. All rights reserved. {/* Changed from StreamVerse */}
        </footer>
      )}
    </div>
  );
}

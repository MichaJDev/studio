// src/components/layout/MainLayout.tsx
"use client"; // Make it a client component to use hooks

import type { ReactNode } from 'react';
import Header from './Header';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext'; // Import auth context

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { currentUser, isLoading } = useAuthContext(); // Get user status

  const isWatchPage = pathname.startsWith('/watch/');
  // Determine if the landing page view should be active (unauthenticated user on root path)
  const isLandingView = !isLoading && !currentUser && pathname === '/';

  // Don't show header/footer on watch page OR on the landing page view
  const showHeaderFooter = !isWatchPage && !isLandingView;

  return (
    <div className="flex min-h-screen flex-col">
      {showHeaderFooter && <Header />}
      {/* Main content area: remove padding if it's the landing/watch view */}
      <main className={`flex-1 ${!showHeaderFooter ? '' : ''}`}>
        {children}
      </main>
      {showHeaderFooter && (
        <footer className="py-6 text-center text-muted-foreground text-sm border-t border-border/40 mt-12">
          © {new Date().getFullYear()} PrismmTv. All rights reserved.
        </footer>
      )}
    </div>
  );
}

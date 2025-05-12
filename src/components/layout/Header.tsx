// src/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import { Film, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home', icon: <Film className="mr-2 h-5 w-5" /> },
    { href: '/upload', label: 'Upload', icon: <Upload className="mr-2 h-5 w-5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Film className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold tracking-tight text-foreground">
            StreamVerse
          </span>
        </Link>
        <nav className="flex items-center space-x-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? 'default' : 'ghost'}
              size="sm"
              asChild
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary-foreground" : "text-muted-foreground" 
              )}
            >
              <Link href={link.href}>
                {/* {link.icon} */}
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}


// src/components/layout/Header.tsx
"use client";

import React, { useState } from 'react'; // Import useState
import Link from 'next/link';
import { Gem, LogIn, LogOut, UserCircle, ShieldCheck } from 'lucide-react'; // Changed Film to Gem
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AdminPanel from '@/components/admin/AdminPanel'; // Import AdminPanel

export default function Header() {
  const pathname = usePathname();
  const { currentUser, logout, isLoading } = useAuthContext();
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false); // State for modal

  const navLinks: { href: string; label: string; icon?: JSX.Element; requiresAuth: boolean }[] = [
    // { href: '/', label: 'Home', icon: <Film className="mr-2 h-5 w-5" />, requiresAuth: false }, // Removed Home
    // { href: '/upload', label: 'Upload', icon: <Upload className="mr-2 h-5 w-5" />, requiresAuth: true }, // Removed Upload
  ];

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return names[0].substring(0, 2);
  };

  // Hide header on watch page
  if (pathname.startsWith('/watch/')) {
    return null;
  }

  const handleOpenAdminPanel = () => {
    setIsAdminPanelOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Gem className="h-8 w-8 text-primary" /> {/* Changed from Film to Gem */}
            <span className="text-2xl font-bold tracking-tight text-foreground">
              PrismmTv {/* Changed from StreamVerse */}
            </span>
          </Link>
          <div className="flex items-center space-x-2">
            {navLinks.length > 0 && (
                 <nav className="flex items-center space-x-1">
                {navLinks.map((link) => (
                    (!link.requiresAuth || currentUser) && (
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
                    )
                ))}
                </nav>
            )}


            {isLoading ? (
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted"></div>
            ) : currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://avatar.vercel.sh/${currentUser.email}.png`} alt={currentUser.name || currentUser.email} />
                      <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.name || currentUser.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.email} ({currentUser.role})
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   {currentUser.role === 'admin' && (
                     <DropdownMenuItem onClick={handleOpenAdminPanel} className="cursor-pointer">
                       <ShieldCheck className="mr-2 h-4 w-4" />
                       Admin Panel
                     </DropdownMenuItem>
                   )}
                   {/* Add more items like Profile, Settings if needed */}
                   {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
                   <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      {/* Render AdminPanel Modal */}
      {currentUser?.role === 'admin' && (
        <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
      )}
    </>
  );
}


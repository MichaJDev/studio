
// src/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import { Film, Upload, LogIn, LogOut, UserCircle } from 'lucide-react';
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

export default function Header() {
  const pathname = usePathname();
  const { currentUser, logout, isLoading } = useAuthContext();

  const navLinks = [
    { href: '/', label: 'Home', icon: <Film className="mr-2 h-5 w-5" />, requiresAuth: false },
    { href: '/upload', label: 'Upload', icon: <Upload className="mr-2 h-5 w-5" />, requiresAuth: true },
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Film className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold tracking-tight text-foreground">
            StreamVerse
          </span>
        </Link>
        <div className="flex items-center space-x-2">
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
                {/* Add more items like Profile, Settings if needed */}
                {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
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
  );
}

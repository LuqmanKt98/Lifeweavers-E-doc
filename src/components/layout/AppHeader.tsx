
// src/components/layout/AppHeader.tsx
"use client";

import type { User } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, UserCircle, Settings, Moon, Sun, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from "next-themes";
import Logo from '@/components/Logo'; // Import the new Logo component

interface AppHeaderProps {
  user: User;
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  pageTitle: string;
}

export default function AppHeader({ user, toggleSidebar, sidebarOpen, pageTitle }: AppHeaderProps) {
  const { logout } = useAuth();
  const { setTheme, theme } = useTheme();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2 min-w-0"> {/* Added min-w-0 for better truncation behavior */}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-1 md:hidden flex-shrink-0">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
         <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-1 hidden md:inline-flex flex-shrink-0">
          <Menu className="h-6 w-6" />
        </Button>
        <Link href="/dashboard" className="flex items-center flex-shrink-0 mr-2">
           <Logo iconOnly width={32} height={32} className="h-8 w-auto" />
        </Link>
        <h1 className="text-xl font-semibold text-foreground truncate"> {/* Removed hidden sm:block */}
          {pageTitle}
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0"> {/* flex-shrink-0 to prevent this from being squeezed */}
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://picsum.photos/seed/${user.id}/40/40`} alt={user.name} data-ai-hint="person portrait" />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

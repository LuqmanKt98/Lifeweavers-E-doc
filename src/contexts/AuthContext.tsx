
// src/contexts/AuthContext.tsx
"use client";

import type { User, AuthContextType } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MOCK_ALL_USERS_DATABASE } from '@/lib/mockDatabase';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // Actual logged-in user
  const [impersonatingUser, setImpersonatingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('lifeweaver_user');
    const storedImpersonatingUser = localStorage.getItem('lifeweaver_impersonating_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (storedImpersonatingUser && parsedUser.role === 'Super Admin') {
        setImpersonatingUser(JSON.parse(storedImpersonatingUser));
      }
    }
    setLoading(false);
  }, []);

  const currentUser = impersonatingUser || user;
  const isImpersonating = !!impersonatingUser;

  useEffect(() => {
    // If not loading, not authenticated, and not on login page, redirect to login
    if (!loading && !currentUser && pathname !== '/login') {
      router.push('/login');
    } 
    // If authenticated and on login page, redirect to dashboard
    else if (!loading && currentUser && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [currentUser, loading, router, pathname]);

  const login = async (email: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const foundUser = MOCK_ALL_USERS_DATABASE.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('lifeweaver_user', JSON.stringify(foundUser));
      // Clear any previous impersonation on new login
      setImpersonatingUser(null);
      localStorage.removeItem('lifeweaver_impersonating_user');
      router.push('/dashboard');
    } else {
      setLoading(false);
      throw new Error("Invalid credentials or user not found.");
    }
    setLoading(false);
  };
  
  const startImpersonation = async (targetUser: User) => {
    if (user?.role !== 'Super Admin' || user.id === targetUser.id) {
      toast({ title: "Impersonation Denied", description: "Cannot impersonate this user.", variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setImpersonatingUser(targetUser);
    localStorage.setItem('lifeweaver_impersonating_user', JSON.stringify(targetUser));
    toast({ title: "Impersonation Started", description: `You are now viewing as ${targetUser.name}.`});
    router.push('/dashboard'); // Navigate to dashboard as the impersonated user
    setLoading(false);
  };

  const stopImpersonation = async () => {
    if (!impersonatingUser) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    const originalUserName = impersonatingUser.name;
    setImpersonatingUser(null);
    localStorage.removeItem('lifeweaver_impersonating_user');
    toast({ title: "Impersonation Ended", description: `Stopped impersonating ${originalUserName}. Resumed as ${user?.name}.`});
    router.push('/dashboard'); // Or user management page: router.push('/admin/users');
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    setImpersonatingUser(null);
    localStorage.removeItem('lifeweaver_user');
    localStorage.removeItem('lifeweaver_impersonating_user');
    router.push('/login');
    setLoading(false);
  };

  // Initial loading state management
  if (loading && !pathname.startsWith('/login')) {
    return <div className="flex h-screen items-center justify-center bg-background text-foreground">Loading application...</div>;
  }
  
  // If on login page and not yet authenticated (user object is null), render children (login form)
  if (pathname === '/login' && !user) {
    return (
      <AuthContext.Provider value={{ user, currentUser, loading, isImpersonating, login, logout, startImpersonation, stopImpersonation }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  // While loading and not on login page, show loading
  if (loading) {
     return <div className="flex h-screen items-center justify-center bg-background text-foreground">Loading application...</div>;
  }

  // If not loading, not authenticated (currentUser is null), and not on login page, effectively means redirect is happening or should happen
  if (!currentUser && pathname !== '/login') {
    return null; // Let useEffect handle redirect
  }
  
  return (
    <AuthContext.Provider value={{ user, currentUser, loading, isImpersonating, login, logout, startImpersonation, stopImpersonation }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// src/contexts/AuthContext.tsx
"use client";

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>; // Simplified login, role removed as it's derived
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users - in a real app, this would come from Firebase Auth or another backend
const MOCK_USERS: Record<string, User> = {
  'superadmin@lifeweaver.com': { id: 'user_superadmin', email: 'superadmin@lifeweaver.com', name: 'Dr. Super Admin', role: 'Super Admin', vocation: 'Lead Therapist' },
  'admin@lifeweaver.com': { id: 'user_admin', email: 'admin@lifeweaver.com', name: 'Alex Admin', role: 'Admin', vocation: 'Clinic Manager' },
  'clinician@lifeweaver.com': { id: 'user_clinician', email: 'clinician@lifeweaver.com', name: 'Casey Clinician', role: 'Clinician', vocation: 'Physiotherapist' },
  'clinician2@lifeweaver.com': { id: 'user_clinician2', email: 'clinician2@lifeweaver.com', name: 'Jamie Therapist', role: 'Clinician', vocation: 'Occupational Therapist' },
  // 'user_new1' and other specific clinicians used for team assignment are not listed here for direct login
  // but will be available in MOCK_ALL_CLINICIANS_FOR_SELECTION on relevant pages.
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking auth status
    const storedUser = localStorage.getItem('lifeweaver_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    } else if (!loading && user && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [user, loading, router, pathname]);

  const login = async (email: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const foundUser = Object.values(MOCK_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('lifeweaver_user', JSON.stringify(foundUser));
      router.push('/dashboard');
    } else {
      // For scaffolding, allow any email to log in as a default clinician if not found
      const defaultClinicianUser: User = {
        id: `user_${Date.now()}`,
        email: email,
        name: email.split('@')[0], // Basic name from email prefix
        role: 'Clinician',
        vocation: 'Therapist' // Default vocation
      };
      setUser(defaultClinicianUser);
      localStorage.setItem('lifeweaver_user', JSON.stringify(defaultClinicianUser));
      router.push('/dashboard');
      // In a real app, you would throw an error here or handle unknown users appropriately
      // For example: toast({ title: "Login Failed", description: "User not found.", variant: "destructive" });
    }
    setLoading(false);
  };
  

  const logout = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem('lifeweaver_user');
    router.push('/login');
    setLoading(false);
  };

  if (loading && !pathname.startsWith('/login')) {
     // Basic loading state to prevent flicker, could be a full-page spinner
    return <div className="flex h-screen items-center justify-center">Loading application...</div>;
  }
  
  // Allow access to login page even when loading or no user
  if (pathname === '/login' && !user) {
    return (
      <AuthContext.Provider value={{ user, loading, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  // If still loading but not on login, show loading
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading application...</div>;
  }

  // If not loading, and no user, and not on login page (should be redirected by useEffect, but as a safeguard)
  if (!user && pathname !== '/login') {
    return null; // Or a redirect component, though useEffect handles redirection
  }


  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {user || pathname === '/login' ? children : null}
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

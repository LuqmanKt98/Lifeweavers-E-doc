// src/contexts/AuthContext.tsx
"use client";

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MOCK_ALL_USERS_DATABASE } from '@/lib/mockDatabase'; // Import the centralized user database

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>; 
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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
    await new Promise(resolve => setTimeout(resolve, 500));
    const foundUser = MOCK_ALL_USERS_DATABASE.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('lifeweaver_user', JSON.stringify(foundUser));
      router.push('/dashboard');
    } else {
      const defaultClinicianUser: User = {
        id: `user_${Date.now()}`,
        email: email,
        name: email.split('@')[0], 
        role: 'Clinician',
        vocation: 'Therapist'
      };
      setUser(defaultClinicianUser);
      localStorage.setItem('lifeweaver_user', JSON.stringify(defaultClinicianUser));
      // Add this new dynamic user to the MOCK_ALL_USERS_DATABASE for this session for consistency if needed elsewhere
      // Note: This in-memory update won't persist across full page reloads if MOCK_ALL_USERS_DATABASE is re-initialized from scratch.
      const existingDynamicUserIndex = MOCK_ALL_USERS_DATABASE.findIndex(u => u.email === email);
      if (existingDynamicUserIndex === -1) {
        MOCK_ALL_USERS_DATABASE.push(defaultClinicianUser);
      } else {
         // If a dynamic user with this email somehow exists but wasn't matched (e.g. case sensitivity if mock data isn't lowercased), update it.
         MOCK_ALL_USERS_DATABASE[existingDynamicUserIndex] = defaultClinicianUser;
      }
      router.push('/dashboard');
    }
    setLoading(false);
  };
  

  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem('lifeweaver_user');
    router.push('/login');
    setLoading(false);
  };

  if (loading && !pathname.startsWith('/login')) {
    return <div className="flex h-screen items-center justify-center">Loading application...</div>;
  }
  
  if (pathname === '/login' && !user) {
    return (
      <AuthContext.Provider value={{ user, loading, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading application...</div>;
  }

  if (!user && pathname !== '/login') {
    return null; 
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

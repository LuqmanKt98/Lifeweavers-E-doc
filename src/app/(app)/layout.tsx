// src/app/(app)/layout.tsx
"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { Client } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock client data
const MOCK_CLIENTS: Client[] = [
  { id: 'client-1', name: 'John Doe', dateAdded: new Date(2023, 0, 15).toISOString() },
  { id: 'client-2', name: 'Jane Smith', dateAdded: new Date(2023, 2, 10).toISOString() },
  { id: 'client-3', name: 'Alice Johnson', dateAdded: new Date(2022, 11, 1).toISOString() },
  { id: 'client-4', name: 'Bob Williams', dateAdded: new Date(2023, 5, 20).toISOString() },
  { id: 'client-5', name: 'Charlie Brown', dateAdded: new Date(2023, 8, 5).toISOString() },
  { id: 'client-6', name: 'Diana Prince', dateAdded: new Date(2023, 1, 22).toISOString() },
];


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
    // In a real app, fetch clients based on user role/permissions
    setClients(MOCK_CLIENTS);
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-foreground">Loading dashboard...</p>
      </div>
    );
  }
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-secondary/50">
      <AppSidebar clients={clients} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        <AppHeader user={user} toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="p-4 md:p-6 lg:p-8">
             {children}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}

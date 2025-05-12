// src/app/(app)/layout.tsx
"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import type { Client, SpecialNotification } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import SpecialNotificationBanner from '@/components/layout/SpecialNotificationBanner';

// Mock client data
const MOCK_CLIENTS: Client[] = [
  { id: 'client-1', name: 'John Doe', dateAdded: new Date(2023, 0, 15).toISOString() },
  { id: 'client-2', name: 'Jane Smith', dateAdded: new Date(2023, 2, 10).toISOString() },
  { id: 'client-3', name: 'Alice Johnson', dateAdded: new Date(2022, 11, 1).toISOString() },
  { id: 'client-4', name: 'Bob Williams', dateAdded: new Date(2023, 5, 20).toISOString() },
  { id: 'client-5', name: 'Charlie Brown', dateAdded: new Date(2023, 8, 5).toISOString() },
  { id: 'client-6', name: 'Diana Prince', dateAdded: new Date(2023, 1, 22).toISOString() },
];

const MOCK_SPECIAL_NOTIFICATIONS_DATA: SpecialNotification[] = [
  {
    id: 'promo-banner-1',
    title: '🚀 New Feature Alert!',
    message: 'Explore our new AI-powered note summarization. Supercharge your productivity!',
    type: 'promo',
    link: '#', // Placeholder link
  },
  {
    id: 'maintenance-banner-1',
    title: 'System Maintenance Scheduled',
    message: 'LWV CLINIC E-DOC will undergo maintenance on Sunday, July 28th, from 2 AM to 3 AM UTC. The service might be temporarily unavailable.',
    type: 'warning',
  },
  {
    id: 'critical-update-banner-1',
    title: 'Critical Security Update Applied',
    message: 'A critical security update has been applied. Please log out and log back in to ensure all changes take effect.',
    type: 'critical',
  },
  {
    id: 'info-banner-1',
    title: 'Tip of the Day',
    message: 'Did you know you can use keyboard shortcuts to navigate faster? Press Ctrl+B (or Cmd+B) to toggle the sidebar.',
    type: 'info',
  },
];


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [clients, setClients] = useState<Client[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop
  const [activeSpecialNotifications, setActiveSpecialNotifications] = useState<SpecialNotification[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
    // In a real app, fetch clients based on user role/permissions
    setClients(MOCK_CLIENTS);

    // Initialize active special notifications, potentially checking localStorage for dismissed ones
    const initiallyActive = MOCK_SPECIAL_NOTIFICATIONS_DATA.filter(notification => {
      // Example: Check if not dismissed by user previously from localStorage
      if (typeof window !== 'undefined') {
        const dismissed = localStorage.getItem(`dismissed_special_notification_${notification.id}`);
        return !dismissed;
      }
      return true; 
    });
    setActiveSpecialNotifications(initiallyActive);

  }, [user, loading, router]);

  const getPageTitle = (currentPathname: string): string => {
    if (currentPathname === '/dashboard') return 'Dashboard';
    if (currentPathname.startsWith('/clients/')) {
      // To get "Client Name - Session Notes" we'd need client data here.
      // For now, let's keep it generic or reflect the page's main function.
      // The client detail page already shows client name prominently.
      return 'Client Session Notes'; 
    }
    if (currentPathname === '/admin/users') return 'User Management';
    if (currentPathname === '/admin/cases') return 'Cases Management';
    if (currentPathname === '/notifications') return 'Notifications';
    if (currentPathname === '/messages') return 'Messages';
    // Default title if no match
    return 'LWV CLINIC E-DOC';
  };

  const pageTitle = getPageTitle(pathname);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-foreground">Loading dashboard...</p>
      </div>
    );
  }
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleDismissSpecialNotification = (id: string) => {
    setActiveSpecialNotifications(prev => prev.filter(n => n.id !== id));
    // Persist dismissal to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dismissed_special_notification_${id}`, 'true');
    }
  };

  return (
    <div className="flex h-screen bg-secondary/50">
      <AppSidebar clients={clients} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        <AppHeader user={user} toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="p-4 md:p-6 lg:p-8">
             {children}
            </div>
          </ScrollArea>
        </main>
         {activeSpecialNotifications.length > 0 && (
          <div className="p-4 md:p-6 lg:p-8 pt-0 mt-auto"> {/* Ensures banner is at bottom of main content column before scrollbar */}
            <SpecialNotificationBanner
              notifications={activeSpecialNotifications}
              onDismiss={handleDismissSpecialNotification}
            />
          </div>
        )}
      </div>
    </div>
  );
}

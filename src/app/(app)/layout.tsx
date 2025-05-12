// src/app/(app)/layout.tsx
"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import type { SpecialNotification, SessionNote } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import SpecialNotificationBanner from '@/components/layout/SpecialNotificationBanner';
import EventCalendar from '@/components/shared/EventCalendar';
import { MOCK_CLIENTS_DB, MOCK_SESSIONS_DB } from '@/lib/mockDatabase'; 

// Mock data for special notifications
const MOCK_SPECIAL_NOTIFICATIONS_DATA: SpecialNotification[] = [
  {
    id: 'promo-banner-1',
    title: '🚀 New Feature Alert!',
    message: 'Explore our new AI-powered note summarization. Supercharge your productivity!',
    type: 'promo',
    link: '#', 
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSpecialNotifications, setActiveSpecialNotifications] = useState<SpecialNotification[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }

    const initiallyActive = MOCK_SPECIAL_NOTIFICATIONS_DATA.filter(notification => {
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
      const clientId = currentPathname.split('/')[2];
      const client = MOCK_CLIENTS_DB[clientId]; 
      return client ? `${client.name} - Notes` : 'Client Session Notes'; 
    }
    if (currentPathname === '/admin/users') return 'User Management';
    if (currentPathname === '/admin/cases') return 'Cases Management';
    if (currentPathname === '/notifications') return 'Notifications';
    if (currentPathname === '/messages') return 'Messages';
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
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dismissed_special_notification_${id}`, 'true');
    }
  };

  // Prepare sessions for EventCalendar based on user role
  const MOCK_ALL_SESSIONS_ARRAY: SessionNote[] = Object.values(MOCK_SESSIONS_DB).flat();
  const allProcessedSessions = MOCK_ALL_SESSIONS_ARRAY.map(s => ({...s, attachments: s.attachments || []}));

  let sessionsForCalendarView: SessionNote[];
  if (user.role === 'Admin' || user.role === 'Super Admin') {
    sessionsForCalendarView = allProcessedSessions;
  } else if (user.role === 'Clinician') {
    sessionsForCalendarView = allProcessedSessions.filter(session => session.attendingClinicianId === user.id);
  } else {
    sessionsForCalendarView = []; // Default to empty if role doesn't match
  }

  return (
    <div className="flex h-screen bg-secondary/50">
      <AppSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        <AppHeader user={user} toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="p-4 md:p-6 lg:p-8 space-y-6">
             <EventCalendar sessions={sessionsForCalendarView} />
             {children}
            </div>
          </ScrollArea>
        </main>
         {activeSpecialNotifications.length > 0 && (
          <div className="p-4 md:p-6 lg:p-8 pt-0 mt-auto">
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

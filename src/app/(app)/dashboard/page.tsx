
// src/app/(app)/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react'; // Added useState, useEffect
import { useAuth } from '@/contexts/AuthContext';
import ClinicianDashboard from '@/components/dashboards/ClinicianDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Added Button
import type { Client, SessionNote, User } from '@/lib/types';
import { Lightbulb, RefreshCw, Loader2, CalendarIcon } from 'lucide-react'; // Added RefreshCw, Loader2, CalendarIcon
import { MOCK_CLIENTS_DB, MOCK_SESSIONS_DB, MOCK_ALL_USERS_DATABASE } from '@/lib/mockDatabase';
import EventCalendar from '@/components/shared/EventCalendar';
import { syncGoogleCalendar } from '@/ai/flows/sync-google-calendar-flow'; // Added import for the new flow
import { useToast } from '@/hooks/use-toast'; // Added useToast

// Convert MOCK_CLIENTS_DB (object) to array for dashboard use
const MOCK_CLIENTS_ARRAY: Client[] = Object.values(MOCK_CLIENTS_DB);

// Convert MOCK_SESSIONS_DB (object of arrays) to a flat array of all sessions
const MOCK_ALL_SESSIONS_ARRAY: SessionNote[] = Object.values(MOCK_SESSIONS_DB).flat();
const ALL_PROCESSED_SESSIONS_FOR_CALENDAR = MOCK_ALL_SESSIONS_ARRAY.map(s => ({...s, attachments: s.attachments || []}));


// Use MOCK_ALL_USERS_DATABASE for team information
const MOCK_TEAM_ARRAY: User[] = MOCK_ALL_USERS_DATABASE;


export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast(); // Initialize toast
  const [sessionsForCalendarView, setSessionsForCalendarView] = useState<SessionNote[]>([]);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);


  useEffect(() => {
    if (user) {
      let initialSessions: SessionNote[];
      if (user.role === 'Admin' || user.role === 'Super Admin') {
        initialSessions = ALL_PROCESSED_SESSIONS_FOR_CALENDAR;
      } else if (user.role === 'Clinician') {
        initialSessions = ALL_PROCESSED_SESSIONS_FOR_CALENDAR.filter(session => session.attendingClinicianId === user.id);
      } else {
        initialSessions = [];
      }
      setSessionsForCalendarView(initialSessions);
    }
  }, [user]);


  if (!user) {
    return <p>Loading user data...</p>; // Or a spinner
  }
  
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  // Process recent sessions for Admin/SuperAdmin dashboards
  const sortedRecentSessions = MOCK_ALL_SESSIONS_ARRAY
    .map(s => ({...s, attachments: s.attachments || []}))
    .slice()
    .sort((a,b) => new Date(b.dateOfSession).getTime() - new Date(a.dateOfSession).getTime());
  
  const handleSyncCalendar = async () => {
    if (!user) return;
    setIsSyncingCalendar(true);
    toast({
      title: "Calendar Sync Started (Mock)",
      description: "Attempting to fetch events from Google Calendar...",
    });
    try {
      const result = await syncGoogleCalendar({ userId: user.id });
      // For this mock, we'll replace existing sessions with the new ones.
      // A real implementation might merge or de-duplicate.
      
      // Filter original calendar sessions based on role, then add new events
      let baseSessions: SessionNote[];
      if (user.role === 'Admin' || user.role === 'Super Admin') {
        baseSessions = ALL_PROCESSED_SESSIONS_FOR_CALENDAR;
      } else if (user.role === 'Clinician') {
        baseSessions = ALL_PROCESSED_SESSIONS_FOR_CALENDAR.filter(session => session.attendingClinicianId === user.id);
      } else {
        baseSessions = [];
      }
      // Filter out any potential duplicates from baseSessions that might be in result.events by ID
      const newEventIds = new Set(result.events.map(e => e.id));
      const uniqueBaseSessions = baseSessions.filter(s => !newEventIds.has(s.id));

      setSessionsForCalendarView([...uniqueBaseSessions, ...result.events]);
      toast({
        title: "Calendar Synced (Mock)",
        description: `${result.events.length} new mock event(s) loaded.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error syncing calendar (mock):", error);
      toast({
        title: "Calendar Sync Failed (Mock)",
        description: (error as Error).message || "Could not fetch calendar events.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingCalendar(false);
    }
  };


  const renderDashboard = () => {
    switch (user.role) {
      case 'Clinician':
        const clinicianClients = MOCK_CLIENTS_ARRAY.filter(client => 
          client.teamMemberIds?.includes(user.id)
        );
        return <ClinicianDashboard user={user} clients={clinicianClients} team={MOCK_TEAM_ARRAY} />;
      case 'Admin':
        return <AdminDashboard user={user} recentSessions={sortedRecentSessions} clients={MOCK_CLIENTS_ARRAY} team={MOCK_TEAM_ARRAY} />;
      case 'Super Admin':
        return <SuperAdminDashboard user={user} recentSessions={sortedRecentSessions} clients={MOCK_CLIENTS_ARRAY} team={MOCK_TEAM_ARRAY} />;
      default:
        return <p>Unknown user role.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
         <CardTitle className="flex items-center gap-2 text-xl font-semibold text-primary">
            <CalendarIcon className="h-6 w-6" /> Appointments
          </CardTitle>
          {(user.role === 'Admin' || user.role === 'Super Admin') && (
            <Button onClick={handleSyncCalendar} disabled={isSyncingCalendar} variant="outline" size="sm">
              {isSyncingCalendar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              {isSyncingCalendar ? 'Syncing...' : 'Sync Google Calendar (Mock)'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
           <EventCalendar sessions={sessionsForCalendarView} />
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            {getWelcomeMessage()}, {user.name}!
          </CardTitle>
          <CardDescription className="text-lg text-foreground/80">
            Here's what's happening in LWV CLINIC E-DOC today.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm text-foreground/70">
            <Lightbulb className="h-5 w-5 text-accent-foreground" />
            <span>Quick Tip: Use the sidebar to navigate to your clients or manage users.</span>
        </CardContent>
      </Card>
      {renderDashboard()}
    </div>
  );
}


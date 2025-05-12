// src/app/(app)/dashboard/page.tsx
"use client";

import { useAuth } from '@/contexts/AuthContext';
import ClinicianDashboard from '@/components/dashboards/ClinicianDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Client, SessionNote, User } from '@/lib/types';
import { Lightbulb } from 'lucide-react';
import { MOCK_CLIENTS_DB, MOCK_SESSIONS_DB, MOCK_ALL_USERS_DATABASE } from '@/lib/mockDatabase';

// Convert MOCK_CLIENTS_DB (object) to array for dashboard use
const MOCK_CLIENTS_ARRAY: Client[] = Object.values(MOCK_CLIENTS_DB);

// Convert MOCK_SESSIONS_DB (object of arrays) to a flat array of all sessions
const MOCK_ALL_SESSIONS_ARRAY: SessionNote[] = Object.values(MOCK_SESSIONS_DB).flat();

// Use MOCK_ALL_USERS_DATABASE for team information
const MOCK_TEAM_ARRAY: User[] = MOCK_ALL_USERS_DATABASE;


export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <p>Loading user data...</p>; // Or a spinner
  }
  
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  // Use the array versions of mock data
  const sortedRecentSessions = MOCK_ALL_SESSIONS_ARRAY.map(s => ({...s, attachments: s.attachments || []})).slice().sort((a,b) => new Date(b.dateOfSession).getTime() - new Date(a.dateOfSession).getTime());
  const allDashboardSessions = MOCK_ALL_SESSIONS_ARRAY.map(s => ({...s, attachments: s.attachments || []}));


  const renderDashboard = () => {
    switch (user.role) {
      case 'Clinician':
        const clinicianClients = MOCK_CLIENTS_ARRAY.filter(client => 
          client.teamMemberIds?.includes(user.id)
        );
        const clinicianSessions = allDashboardSessions.filter(session => session.attendingClinicianId === user.id);
        return <ClinicianDashboard user={user} clients={clinicianClients} team={MOCK_TEAM_ARRAY} sessions={clinicianSessions} />;
      case 'Admin':
        return <AdminDashboard user={user} recentSessions={sortedRecentSessions} allSessions={allDashboardSessions} clients={MOCK_CLIENTS_ARRAY} team={MOCK_TEAM_ARRAY} />;
      case 'Super Admin':
        return <SuperAdminDashboard user={user} recentSessions={sortedRecentSessions} allSessions={allDashboardSessions} clients={MOCK_CLIENTS_ARRAY} team={MOCK_TEAM_ARRAY} />;
      default:
        return <p>Unknown user role.</p>;
    }
  };

  return (
    <div className="space-y-6">
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

// src/app/(app)/dashboard/page.tsx
"use client";

import { useAuth } from '@/contexts/AuthContext';
import ClinicianDashboard from '@/components/dashboards/ClinicianDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Client, SessionNote, User } from '@/lib/types';
import { Lightbulb } from 'lucide-react';

// Mock data - In a real app, this would be fetched
const MOCK_CLIENTS: Client[] = [
  { id: 'client-1', name: 'John Doe', dateAdded: new Date(2023, 0, 15).toISOString(), teamMemberIds: ['user_clinician'] },
  { id: 'client-2', name: 'Jane Smith', dateAdded: new Date(2023, 2, 10).toISOString(), teamMemberIds: ['user_clinician2', 'user_clinician'] },
  { id: 'client-3', name: 'Alice Johnson', dateAdded: new Date(2022, 11, 1).toISOString(), teamMemberIds: ['user_clinician'] },
  { id: 'client-4', name: 'Bob Williams', dateAdded: new Date(2023, 5, 20).toISOString(), teamMemberIds: [] },
  { id: 'client-5', name: 'Charlie Brown', dateAdded: new Date(2023, 8, 5).toISOString(), teamMemberIds: ['user_clinician2'] },
];

const MOCK_SESSIONS: SessionNote[] = [
  { id: 'sess-1', clientId: 'client-1', sessionNumber: 3, dateOfSession: new Date(2023,8,10).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: "Physiotherapist", content: 'Patient reported improvement in mobility.', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sess-2', clientId: 'client-2', sessionNumber: 5, dateOfSession: new Date(2023,8,11).toISOString(), attendingClinicianId: 'user_clinician2', attendingClinicianName: 'Jamie Therapist', attendingClinicianVocation: "Occupational Therapist", content: 'Discussed coping strategies for anxiety.', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sess-3', clientId: 'client-1', sessionNumber: 4, dateOfSession: new Date(2023,8,17).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: "Physiotherapist", content: 'Continued with range of motion exercises.', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sess-4', clientId: 'client-3', sessionNumber: 1, dateOfSession: new Date(2023,9,5).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: "Physiotherapist", content: 'Initial assessment for Alice.', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sess-5', clientId: 'client-5', sessionNumber: 2, dateOfSession: new Date(2023,9,12).toISOString(), attendingClinicianId: 'user_clinician2', attendingClinicianName: 'Jamie Therapist', attendingClinicianVocation: "Occupational Therapist", content: 'Follow up with Charlie Brown.', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const MOCK_TEAM: User[] = [
    { id: 'user_clinician', email: 'clinician@lifeweaver.com', name: 'Casey Clinician', role: 'Clinician', vocation: 'Physiotherapist' },
    { id: 'user_clinician2', email: 'clinician2@lifeweaver.com', name: 'Jamie Therapist', role: 'Clinician', vocation: 'Occupational Therapist' },
    { id: 'user_admin', email: 'admin@lifeweaver.com', name: 'Alex Admin', role: 'Admin', vocation: 'Clinic Manager' },
];

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

  const sortedRecentSessions = MOCK_SESSIONS.map(s => ({...s, attachments: s.attachments || []})).slice().sort((a,b) => new Date(b.dateOfSession).getTime() - new Date(a.dateOfSession).getTime());
  const allDashboardSessions = MOCK_SESSIONS.map(s => ({...s, attachments: s.attachments || []}));


  const renderDashboard = () => {
    switch (user.role) {
      case 'Clinician':
        const clinicianClients = MOCK_CLIENTS.filter(client => 
          client.teamMemberIds?.includes(user.id)
        );
        const clinicianSessions = allDashboardSessions.filter(session => session.attendingClinicianId === user.id);
        return <ClinicianDashboard user={user} clients={clinicianClients} team={MOCK_TEAM} sessions={clinicianSessions} />;
      case 'Admin':
        return <AdminDashboard user={user} recentSessions={sortedRecentSessions} allSessions={allDashboardSessions} clients={MOCK_CLIENTS} team={MOCK_TEAM} />;
      case 'Super Admin':
        return <SuperAdminDashboard user={user} recentSessions={sortedRecentSessions} allSessions={allDashboardSessions} clients={MOCK_CLIENTS} team={MOCK_TEAM} />;
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

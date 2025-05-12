// src/app/(app)/clients/[clientId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Client, SessionNote, User } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import SessionFeed from '@/components/sessions/SessionFeed';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';


// Mock data - In a real app, this would be fetched
const MOCK_CLIENTS_DB: Record<string, Client> = {
  'client-1': { id: 'client-1', name: 'John Doe', dateAdded: new Date(2023, 0, 15).toISOString() },
  'client-2': { id: 'client-2', name: 'Jane Smith', dateAdded: new Date(2023, 2, 10).toISOString() },
  'client-3': { id: 'client-3', name: 'Alice Johnson', dateAdded: new Date(2022, 11, 1).toISOString() },
  'client-4': { id: 'client-4', name: 'Bob Williams', dateAdded: new Date(2023, 5, 20).toISOString() },
  'client-5': { id: 'client-5', name: 'Charlie Brown', dateAdded: new Date(2023, 8, 5).toISOString() },
  'client-6': { id: 'client-6', name: 'Diana Prince', dateAdded: new Date(2023, 1, 22).toISOString() },
};

const MOCK_SESSIONS_DB: Record<string, SessionNote[]> = {
  'client-1': [
    { id: 'sess-1-1', clientId: 'client-1', sessionNumber: 1, dateOfSession: new Date(2023, 7, 1).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: 'Initial assessment. Patient presents with lower back pain.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-1-2', clientId: 'client-1', sessionNumber: 2, dateOfSession: new Date(2023, 7, 8).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: 'Follow-up session. Introduced light exercises. Pain reported as 5/10.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-1-3', clientId: 'client-1', sessionNumber: 3, dateOfSession: new Date(2023,8,10).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: 'Patient reported improvement in mobility. Pain 3/10.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-1-4', clientId: 'client-1', sessionNumber: 4, dateOfSession: new Date(2023,8,17).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: 'Continued with range of motion exercises. Patient progressing well.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  'client-2': [
    { id: 'sess-2-1', clientId: 'client-2', sessionNumber: 1, dateOfSession: new Date(2023, 7, 5).toISOString(), attendingClinicianId: 'user_clinician2', attendingClinicianName: 'Jamie Therapist', attendingClinicianVocation: 'Occupational Therapist', content: 'First session. Discussed goals and challenges.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-2-2', clientId: 'client-2', sessionNumber: 2, dateOfSession: new Date(2023,8,11).toISOString(), attendingClinicianId: 'user_clinician2', attendingClinicianName: 'Jamie Therapist', attendingClinicianVocation: 'Occupational Therapist', content: 'Discussed coping strategies for workplace stress. Introduced mindfulness techniques.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  // Add more mock sessions for other clients if needed
};


export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const { user, loading: authLoading } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [sessions, setSessions] = useState<SessionNote[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (clientId && user) {
      setDataLoading(true);
      // Simulate API call
      setTimeout(() => {
        const foundClient = MOCK_CLIENTS_DB[clientId];
        const clientSessions = MOCK_SESSIONS_DB[clientId] || [];
        setClient(foundClient || null);
        setSessions(clientSessions.sort((a, b) => new Date(b.dateOfSession).getTime() - new Date(a.dateOfSession).getTime()));
        setDataLoading(false);
      }, 500);
    }
  }, [clientId, user]);
  
  const handleAddSession = (newSession: SessionNote) => {
    setSessions(prevSessions => [newSession, ...prevSessions].sort((a, b) => new Date(b.dateOfSession).getTime() - new Date(a.dateOfSession).getTime()));
  };

  if (authLoading || dataLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle /> Client Not Found
          </CardTitle>
        </CardHeader>
        <CardDescription className="p-6 text-destructive-foreground">
          The client with ID "{clientId}" could not be found. Please check the ID or select another client.
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
                <UserIcon className="h-8 w-8" /> {client.name}
              </CardTitle>
              <CardDescription className="text-md text-muted-foreground mt-1">
                Client since {formatDistanceToNow(new Date(client.dateAdded), { addSuffix: true })}.
                Total Sessions: {sessions.length}
              </CardDescription>
            </div>
            {/* Add client-specific actions here if needed, e.g., Edit Client Details */}
          </div>
        </CardHeader>
      </Card>
      <SessionFeed 
        clientId={client.id} 
        clientName={client.name} 
        sessions={sessions} 
        currentUser={user!}
        onSessionAdded={handleAddSession}
      />
    </div>
  );
}

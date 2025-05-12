// src/app/(app)/clients/[clientId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Client, SessionNote, User, Attachment } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import SessionFeed from '@/components/sessions/SessionFeed';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, User as UserIcon, Users, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';


// Mock data - In a real app, this would be fetched
const MOCK_CLIENTS_DB: Record<string, Client> = {
  'client-1': { id: 'client-1', name: 'John Doe', dateAdded: new Date(2023, 0, 15).toISOString(), teamMemberIds: ['user_clinician'] },
  'client-2': { id: 'client-2', name: 'Jane Smith', dateAdded: new Date(2023, 2, 10).toISOString(), teamMemberIds: ['user_clinician2', 'user_clinician'] },
  'client-3': { id: 'client-3', name: 'Alice Johnson', dateAdded: new Date(2022, 11, 1).toISOString(), teamMemberIds: [] },
  'client-4': { id: 'client-4', name: 'Bob Williams', dateAdded: new Date(2023, 5, 20).toISOString(), teamMemberIds: ['user_clinician'] },
  'client-5': { id: 'client-5', name: 'Charlie Brown', dateAdded: new Date(2023, 8, 5).toISOString(), teamMemberIds: ['user_new1'] },
  'client-6': { id: 'client-6', name: 'Diana Prince', dateAdded: new Date(2023, 1, 22).toISOString(), teamMemberIds: ['user_clinician', 'user_clinician2', 'user_new1'] },
};

const MOCK_SESSIONS_DB: Record<string, SessionNote[]> = {
  'client-1': [
    { id: 'sess-1-1', clientId: 'client-1', sessionNumber: 1, dateOfSession: new Date(2023, 7, 1).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: 'Initial assessment. Patient presents with lower back pain.', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-1-2', clientId: 'client-1', sessionNumber: 2, dateOfSession: new Date(2023, 7, 8).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: 'Follow-up session. Introduced light exercises. Pain reported as 5/10.', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-1-3', clientId: 'client-1', sessionNumber: 3, dateOfSession: new Date(2023,8,10).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: 'Patient reported improvement in mobility. Pain 3/10.', attachments: [
        { id: 'att-1-3-1', name: 'Lumbar_MRI_Scan.pdf', mimeType: 'application/pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf' }
    ], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-1-4', clientId: 'client-1', sessionNumber: 4, dateOfSession: new Date(2023,8,17).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: 'Continued with range of motion exercises. Patient progressing well.', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  'client-2': [
    { id: 'sess-2-1', clientId: 'client-2', sessionNumber: 1, dateOfSession: new Date(2023, 7, 5).toISOString(), attendingClinicianId: 'user_clinician2', attendingClinicianName: 'Jamie Therapist', attendingClinicianVocation: 'Occupational Therapist', content: 'First session. Discussed goals and challenges.', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-2-2', clientId: 'client-2', sessionNumber: 2, dateOfSession: new Date(2023,8,11).toISOString(), attendingClinicianId: 'user_clinician2', attendingClinicianName: 'Jamie Therapist', attendingClinicianVocation: 'Occupational Therapist', content: 'Discussed coping strategies for workplace stress. Introduced mindfulness techniques.', attachments: [
        { id: 'att-2-2-1', name: 'Mindfulness_Guide.pdf', mimeType: 'application/pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf'},
        { id: 'att-2-2-2', name: 'Workplace_Ergonomics.jpg', mimeType: 'image/jpeg', url: 'https://picsum.photos/seed/ergonomics/600/400', previewUrl: 'https://picsum.photos/seed/ergonomics/600/400', fileType: 'image' }
    ], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
};

// Mock list of all users who are clinicians for selection
const MOCK_ALL_CLINICIANS_FOR_SELECTION: User[] = [
  { id: 'user_clinician', email: 'clinician@lifeweaver.com', name: 'Casey Clinician', role: 'Clinician', vocation: 'Physiotherapist' },
  { id: 'user_clinician2', email: 'clinician2@lifeweaver.com', name: 'Jamie Therapist', role: 'Clinician', vocation: 'Occupational Therapist' },
  { id: 'user_new1', email: 'new.user1@example.com', name: 'Taylor New', role: 'Clinician', vocation: 'Speech Therapist' },
];


export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [sessions, setSessions] = useState<SessionNote[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedClinicianToAdd, setSelectedClinicianToAdd] = useState<string>('');

  useEffect(() => {
    if (clientId && user) {
      setDataLoading(true);
      // Simulate fetching data
      setTimeout(() => {
        const foundClient = MOCK_CLIENTS_DB[clientId];
        const clientSessions = (MOCK_SESSIONS_DB[clientId] || []).map(s => ({...s, attachments: s.attachments || []})); // Ensure attachments array exists
        
        setClient(foundClient || null);
        setSessions(clientSessions.sort((a, b) => new Date(b.dateOfSession).getTime() - new Date(a.dateOfSession).getTime()));
        setDataLoading(false);
      }, 500);
    }
  }, [clientId, user]);
  
  const handleAddSession = (newSessionData: Omit<SessionNote, 'id' | 'sessionNumber' | 'createdAt' | 'updatedAt'>) => {
    const newSession: SessionNote = {
        ...newSessionData,
        id: `sess-${clientId}-${Date.now()}`,
        sessionNumber: (MOCK_SESSIONS_DB[clientId]?.length || 0) + 1,
        attachments: newSessionData.attachments || [], // Ensure attachments is an array
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    setSessions(prevSessions => [newSession, ...prevSessions].sort((a, b) => new Date(b.dateOfSession).getTime() - new Date(a.dateOfSession).getTime()));
    
    if (MOCK_SESSIONS_DB[clientId]) {
      MOCK_SESSIONS_DB[clientId] = [newSession, ...MOCK_SESSIONS_DB[clientId]];
    } else {
      MOCK_SESSIONS_DB[clientId] = [newSession];
    }
     // Sort the DB entry as well
    MOCK_SESSIONS_DB[clientId].sort((a, b) => new Date(b.dateOfSession).getTime() - new Date(a.dateOfSession).getTime());
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  const handleAddClinicianToTeam = () => {
    if (!client || !selectedClinicianToAdd) return;
    if (client.teamMemberIds?.includes(selectedClinicianToAdd)) {
        toast({ title: "Clinician already on team", description: `${MOCK_ALL_CLINICIANS_FOR_SELECTION.find(c=>c.id === selectedClinicianToAdd)?.name} is already on this team.`, variant: "default" });
        return;
    }
    const updatedClient = {
      ...client,
      teamMemberIds: [...(client.teamMemberIds || []), selectedClinicianToAdd],
    };
    setClient(updatedClient);
    MOCK_CLIENTS_DB[client.id] = updatedClient; // Update mock DB
    toast({ title: "Clinician Added", description: `${MOCK_ALL_CLINICIANS_FOR_SELECTION.find(c=>c.id === selectedClinicianToAdd)?.name} has been added to Team ${client.name}.`, variant: "default" });
    setSelectedClinicianToAdd('');
  };

  const handleRemoveClinicianFromTeam = (clinicianIdToRemove: string) => {
    if (!client) return;
    const clinicianName = MOCK_ALL_CLINICIANS_FOR_SELECTION.find(c => c.id === clinicianIdToRemove)?.name || 'The clinician';
    const updatedClient = {
      ...client,
      teamMemberIds: (client.teamMemberIds || []).filter(id => id !== clinicianIdToRemove),
    };
    setClient(updatedClient);
    MOCK_CLIENTS_DB[client.id] = updatedClient; // Update mock DB
    toast({ title: "Clinician Removed", description: `${clinicianName} has been removed from Team ${client.name}.`, variant: "default" });
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

  const canManageTeam = user && (user.role === 'Admin' || user.role === 'Super Admin');
  const isTeamMember = user && user.role === 'Clinician' && client.teamMemberIds?.includes(user.id);
  const canModifyNotes = canManageTeam || isTeamMember;

  const availableCliniciansToAdd = MOCK_ALL_CLINICIANS_FOR_SELECTION.filter(
    c => !client.teamMemberIds?.includes(c.id)
  );

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
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary"/>
            Team {client.name}
          </CardTitle>
          <CardDescription>Clinicians assigned to this client.</CardDescription>
        </CardHeader>
        <CardContent>
          {client.teamMemberIds && client.teamMemberIds.length > 0 ? (
            <ul className="space-y-3">
              {client.teamMemberIds.map(memberId => {
                const member = MOCK_ALL_CLINICIANS_FOR_SELECTION.find(u => u.id === memberId) || MOCK_CLIENTS_DB[memberId] ; 
                if (!member) return null;
                return (
                  <li key={memberId} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://picsum.photos/seed/${member.id}/36/36`} alt={member.name} data-ai-hint="clinician photo"/>
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.vocation || member.role}</p>
                      </div>
                    </div>
                    {canManageTeam && (
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveClinicianFromTeam(memberId)} title={`Remove ${member.name} from team`}>
                        <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground">No clinicians assigned to this team yet.</p>
          )}
          {canManageTeam && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-md font-semibold mb-3 text-foreground/90">Add Clinician to Team</h4>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Select value={selectedClinicianToAdd} onValueChange={setSelectedClinicianToAdd}>
                  <SelectTrigger className="w-full sm:flex-1">
                    <SelectValue placeholder="Select a clinician to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCliniciansToAdd.length > 0 ? (
                      availableCliniciansToAdd.map(clinician => (
                        <SelectItem key={clinician.id} value={clinician.id}>
                          {clinician.name} ({clinician.vocation || 'Clinician'})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-center text-muted-foreground">All clinicians are already on this team or no clinicians available.</div>
                    )}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddClinicianToTeam} disabled={!selectedClinicianToAdd || availableCliniciansToAdd.length === 0} className="w-full sm:w-auto">
                  Add to Team
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {canModifyNotes ? (
        <SessionFeed 
          clientId={client.id} 
          clientName={client.name} 
          sessions={sessions} 
          currentUser={user!}
          onSessionAdded={handleAddSession}
          canModifyNotes={canModifyNotes}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle /> Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">You are not a member of Team {client.name} and do not have permission to view or edit session notes for this client. Please contact an administrator if you believe this is an error.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

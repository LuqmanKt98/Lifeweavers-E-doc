
// src/app/(app)/clients/[clientId]/page.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type { Client, SessionNote, User, Attachment, ToDoTask, ProgressReviewReport } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import SessionFeed from '@/components/sessions/SessionFeed';
import ToDoList from '@/components/todo/ToDoList';
import ProgressReportModal from '@/components/reports/ProgressReportModal'; // Import the new modal
import { generateProgressReport } from '@/ai/flows/generate-progress-report'; // Import AI flow
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, User as UserIconProp, Users, Trash2, ListChecks, FileCog, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow, addDays, startOfDay, isPast } from 'date-fns';
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
  'client-5': { id: 'client-5', name: 'Charlie Brown', dateAdded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), teamMemberIds: ['user_new1'] }, // Added recently for todo testing
  'client-6': { id: 'client-6', name: 'Diana Prince', dateAdded: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), teamMemberIds: ['user_clinician', 'user_clinician2', 'user_new1'] }, // Added >30 days ago for todo testing
};

const MOCK_SESSIONS_DB: Record<string, SessionNote[]> = {
  'client-1': [
    { id: 'sess-1-1', clientId: 'client-1', sessionNumber: 1, dateOfSession: new Date(2023, 7, 1).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: '<p>Initial assessment. Patient presents with lower back pain, radiating to the left leg. ROM limited in lumbar flexion and extension.</p><p>Objective: Decrease pain, improve ROM, and educate on self-management.</p>', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-1-2', clientId: 'client-1', sessionNumber: 2, dateOfSession: new Date(2023, 7, 8).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: '<p>Follow-up session. Introduced light exercises: pelvic tilts, knee-to-chest stretches. Pain reported as 5/10 on VAS, down from 7/10.</p><p>Plan: Continue with current exercises, monitor pain levels.</p>', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-1-3', clientId: 'client-1', sessionNumber: 3, dateOfSession: new Date(2023,8,10).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: '<p>Patient reported improvement in mobility. Pain 3/10. Able to perform exercises with less discomfort.</p><p>Discussed importance of posture during daily activities. Attached MRI scan for review.</p>', attachments: [
        { id: 'att-1-3-1', name: 'Lumbar_MRI_Scan.pdf', mimeType: 'application/pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf' }
    ], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-1-4', clientId: 'client-1', sessionNumber: 4, dateOfSession: new Date(2023,8,17).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: '<p>Continued with range of motion exercises. Patient progressing well. Lumbar flexion improved by 15 degrees. Pain now 2/10 at rest.</p><p>Introduced core strengthening exercises.</p>', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  'client-2': [
    { id: 'sess-2-1', clientId: 'client-2', sessionNumber: 1, dateOfSession: new Date(2023, 7, 5).toISOString(), attendingClinicianId: 'user_clinician2', attendingClinicianName: 'Jamie Therapist', attendingClinicianVocation: 'Occupational Therapist', content: '<p>First session. Discussed goals: improve daily task management and reduce workplace stress.</p><p>Patient reports feeling overwhelmed with current workload.</p>', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-2-2', clientId: 'client-2', sessionNumber: 2, dateOfSession: new Date(2023,8,11).toISOString(), attendingClinicianId: 'user_clinician2', attendingClinicianName: 'Jamie Therapist', attendingClinicianVocation: 'Occupational Therapist', content: '<p>Discussed coping strategies for workplace stress. Introduced mindfulness techniques (body scan, mindful breathing).</p><p>Patient receptive and found initial practice calming. Provided resources on mindfulness and workplace ergonomics.</p>', attachments: [
        { id: 'att-2-2-1', name: 'Mindfulness_Guide.pdf', mimeType: 'application/pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf'},
        { id: 'att-2-2-2', name: 'Workplace_Ergonomics.jpg', mimeType: 'image/jpeg', url: 'https://picsum.photos/seed/ergonomics/600/400', previewUrl: 'https://picsum.photos/seed/ergonomics/600/400', fileType: 'image' }
    ], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
};

const MOCK_ALL_CLINICIANS_FOR_SELECTION: User[] = [
  { id: 'user_clinician', email: 'clinician@lifeweaver.com', name: 'Casey Clinician', role: 'Clinician', vocation: 'Physiotherapist' },
  { id: 'user_clinician2', email: 'clinician2@lifeweaver.com', name: 'Jamie Therapist', role: 'Clinician', vocation: 'Occupational Therapist' },
  { id: 'user_new1', email: 'new.user1@example.com', name: 'Taylor New', role: 'Clinician', vocation: 'Speech Therapist' },
];

// Mock DB for ToDo Tasks
let MOCK_TODO_TASKS_DB: Record<string, ToDoTask[]> = {
    'client-1': [
        { id: 'todo-1-1', clientId: 'client-1', description: 'Follow up on home exercise plan adherence.', isDone: false, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), addedByUserId: 'user_clinician', addedByUserName: 'Casey Clinician', assignedToUserIds: ['user_clinician'], assignedToUserNames: ['Casey Clinician'], dueDate: format(addDays(new Date(), 5), 'yyyy-MM-dd') },
        { id: 'todo-1-2', clientId: 'client-1', description: 'Schedule next appointment.', isDone: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), addedByUserId: 'user_admin', addedByUserName: 'Alex Admin', assignedToUserIds: ['user_admin'], assignedToUserNames: ['Alex Admin'], completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), completedByUserId: 'user_admin', completedByUserName: 'Alex Admin' },
    ],
    'client-6': [ // Client added >30 days ago
        { 
            id: 'todo-6-sys-1', clientId: 'client-6', 
            description: 'Conduct 1st Progress Review (30 days post-intake)', 
            isDone: true, 
            createdAt: MOCK_CLIENTS_DB['client-6'].dateAdded, 
            addedByUserId: 'system', addedByUserName: 'System', 
            assignedToUserIds: ['user_clinician'], 
            assignedToUserNames: ['Casey Clinician'],
            dueDate: format(addDays(new Date(MOCK_CLIENTS_DB['client-6'].dateAdded), 30), 'yyyy-MM-dd'),
            isSystemGenerated: true,
            completedAt: format(addDays(new Date(MOCK_CLIENTS_DB['client-6'].dateAdded), 28), 'yyyy-MM-dd'), 
            completedByUserId: 'user_clinician',
            completedByUserName: 'Casey Clinician',
        }
    ]
};


export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [sessions, setSessions] = useState<SessionNote[]>([]);
  const [todoTasks, setTodoTasks] = useState<ToDoTask[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedClinicianToAdd, setSelectedClinicianToAdd] = useState<string>('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ProgressReviewReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const canManageTeam = user && (user.role === 'Admin' || user.role === 'Super Admin');
  const isTeamMember = user && client && user.role === 'Clinician' && client.teamMemberIds?.includes(user.id);
  const canModifyNotesAndTasks = canManageTeam || isTeamMember;
  const canGenerateReport = canModifyNotesAndTasks; // Same permissions for report generation
  const canDeleteSystemGeneratedTasks = user?.role === 'Super Admin';


  const synchronizePresetTasks = useCallback((currentClient: Client, existingTasks: ToDoTask[]): ToDoTask[] => {
    if (!user) return existingTasks;
    let updatedTasks = [...existingTasks];
    let changesMade = false;

    const clientDateAdded = new Date(currentClient.dateAdded);
    
    const getFirstTeamMember = (): Pick<User, 'id' | 'name'> | undefined => {
        if (currentClient.teamMemberIds && currentClient.teamMemberIds.length > 0) {
            const firstMemberId = currentClient.teamMemberIds[0];
            return MOCK_ALL_CLINICIANS_FOR_SELECTION.find(c => c.id === firstMemberId);
        }
        return undefined;
    };


    // 1. 30-Day Progress Review
    const thirtyDayReviewDesc = "Conduct 1st Progress Review (30 days post-intake)";
    let thirtyDayReview = updatedTasks.find(task => task.description === thirtyDayReviewDesc && task.isSystemGenerated);
    if (!thirtyDayReview) {
      const dueDate30 = format(addDays(startOfDay(clientDateAdded), 30), 'yyyy-MM-dd');
      const firstTeamMember = getFirstTeamMember();
      thirtyDayReview = {
        id: `sys-${currentClient.id}-30day-${Date.now()}`,
        clientId: currentClient.id,
        description: thirtyDayReviewDesc,
        isDone: false,
        createdAt: new Date().toISOString(),
        addedByUserId: 'system',
        addedByUserName: 'System',
        assignedToUserIds: firstTeamMember ? [firstTeamMember.id] : [],
        assignedToUserNames: firstTeamMember ? [firstTeamMember.name] : [],
        dueDate: dueDate30,
        isSystemGenerated: true,
      };
      updatedTasks.push(thirtyDayReview);
      changesMade = true;
      const assigneeText = firstTeamMember ? `Assigned to ${firstTeamMember.name}.` : 'Not assigned (no team members).';
      toast({ title: "System Task Added", description: `"${thirtyDayReviewDesc}" scheduled. ${assigneeText}`, variant: "default" });
    }

    // 2. 60-Day Follow-up Progress Review (if 30-day is done or significantly past due)
    if (thirtyDayReview && (thirtyDayReview.isDone || (thirtyDayReview.dueDate && isPast(addDays(new Date(thirtyDayReview.dueDate), 1))))) { 
        const sixtyDayFollowUpDesc = "Conduct Follow-up Progress Review (60 days after 1st)";
        const sixtyDayFollowUpExpectedDueDate = thirtyDayReview.dueDate ? addDays(startOfDay(new Date(thirtyDayReview.dueDate)), 60) : addDays(startOfDay(clientDateAdded), 30 + 60);
        
        const existingSixtyDayReview = updatedTasks.find(task => 
            task.description === sixtyDayFollowUpDesc && 
            task.isSystemGenerated &&
            task.dueDate === format(sixtyDayFollowUpExpectedDueDate, 'yyyy-MM-dd')
        );

        if (!existingSixtyDayReview) {
            const firstTeamMember = getFirstTeamMember();
            const newSixtyDayReview: ToDoTask = {
                id: `sys-${currentClient.id}-60day-${Date.now()}`,
                clientId: currentClient.id,
                description: sixtyDayFollowUpDesc,
                isDone: false,
                createdAt: new Date().toISOString(),
                addedByUserId: 'system',
                addedByUserName: 'System',
                assignedToUserIds: firstTeamMember ? [firstTeamMember.id] : [],
                assignedToUserNames: firstTeamMember ? [firstTeamMember.name] : [],
                dueDate: format(sixtyDayFollowUpExpectedDueDate, 'yyyy-MM-dd'),
                isSystemGenerated: true,
            };
            updatedTasks.push(newSixtyDayReview);
            changesMade = true;
            const assigneeText = firstTeamMember ? `Assigned to ${firstTeamMember.name}.` : 'Not assigned (no team members).';
            toast({ title: "System Task Added", description: `"${sixtyDayFollowUpDesc}" scheduled. ${assigneeText}`, variant: "default" });
        }
    }
    
    if (changesMade) {
        MOCK_TODO_TASKS_DB[currentClient.id] = [...updatedTasks];
    }
    return updatedTasks;
  }, [user, toast]);


  useEffect(() => {
    if (clientId && user) {
      setDataLoading(true);
      // Simulate fetching data
      setTimeout(() => {
        const foundClient = MOCK_CLIENTS_DB[clientId];
        const clientSessions = (MOCK_SESSIONS_DB[clientId] || []).map(s => ({...s, attachments: s.attachments || []}));
        let clientTasks = MOCK_TODO_TASKS_DB[clientId] || [];
        
        if (foundClient) {
            clientTasks = synchronizePresetTasks(foundClient, clientTasks);
        }
        
        setClient(foundClient || null);
        setSessions(clientSessions.sort((a, b) => new Date(b.dateOfSession).getTime() - new Date(a.dateOfSession).getTime()));
        setTodoTasks(clientTasks);
        setDataLoading(false);
      }, 500);
    }
  }, [clientId, user, synchronizePresetTasks]);
  
  const handleAddSession = (newSessionData: Omit<SessionNote, 'id' | 'sessionNumber' | 'createdAt' | 'updatedAt'>) => {
    const newSession: SessionNote = {
        ...newSessionData,
        id: `sess-${clientId}-${Date.now()}`,
        sessionNumber: (MOCK_SESSIONS_DB[clientId]?.length || 0) + 1,
        attachments: newSessionData.attachments || [], 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    setSessions(prevSessions => [newSession, ...prevSessions].sort((a, b) => new Date(b.dateOfSession).getTime() - new Date(a.dateOfSession).getTime()));
    
    if (MOCK_SESSIONS_DB[clientId]) {
      MOCK_SESSIONS_DB[clientId] = [newSession, ...MOCK_SESSIONS_DB[clientId]];
    } else {
      MOCK_SESSIONS_DB[clientId] = [newSession];
    }
    MOCK_SESSIONS_DB[clientId].sort((a, b) => new Date(b.dateOfSession).getTime() - new Date(a.dateOfSession).getTime());
  };

  const handleAddToDoTask = (description: string, dueDate?: string, assignedToUserIdsInput?: string[]) => {
    if (!user || !client) return;
    
    const assignedToUserIds = assignedToUserIdsInput || [];
    if (assignedToUserIds.length === 0) { // Should be caught by ToDoList form validation, but double check
        toast({ title: "Assignee Required", description: "A task must be assigned to at least one team member.", variant: "destructive"});
        return;
    }

    const assignedToUserNames = assignedToUserIds.map(id => {
        const assignee = MOCK_ALL_CLINICIANS_FOR_SELECTION.find(c => c.id === id);
        return assignee?.name || 'Unknown User';
    });

    const newTask: ToDoTask = {
      id: `todo-${client.id}-${Date.now()}`,
      clientId: client.id,
      description,
      isDone: false,
      createdAt: new Date().toISOString(),
      addedByUserId: user.id,
      addedByUserName: user.name,
      assignedToUserIds: assignedToUserIds,
      assignedToUserNames: assignedToUserNames,
      dueDate: dueDate ? format(startOfDay(new Date(dueDate)), 'yyyy-MM-dd') : undefined,
      isSystemGenerated: false,
    };
    const updatedTasks = [...todoTasks, newTask];
    setTodoTasks(updatedTasks);
    MOCK_TODO_TASKS_DB[client.id] = updatedTasks;
    const assigneeText = assignedToUserNames.length > 0 ? `Assigned to ${assignedToUserNames.join(', ')}.` : 'Unassigned.';
    toast({ title: "Task Added", description: `"${description}" has been added. ${assigneeText}` });
  };

  const handleToggleToDoTask = (taskId: string) => {
    if (!user || !client) return;
    const updatedTasks = todoTasks.map(task => {
      if (task.id === taskId) {
        const isNowDone = !task.isDone;
        return {
          ...task,
          isDone: isNowDone,
          completedAt: isNowDone ? new Date().toISOString() : undefined,
          completedByUserId: isNowDone ? user.id : undefined,
          completedByUserName: isNowDone ? user.name : undefined,
        };
      }
      return task;
    });
    setTodoTasks(updatedTasks);
    MOCK_TODO_TASKS_DB[client.id] = updatedTasks;
    const targetTask = updatedTasks.find(t => t.id === taskId);
    toast({ title: `Task ${targetTask?.isDone ? 'Completed' : 'Marked Pending'}`, description: `"${targetTask?.description}" status updated.` });

    if (targetTask?.isSystemGenerated && targetTask.isDone && client) {
        const newTaskList = synchronizePresetTasks(client, updatedTasks);
        setTodoTasks(newTaskList);
    }
  };
  
  const handleRemoveToDoTask = (taskId: string) => {
    if (!client) return;
    const taskToRemove = todoTasks.find(task => task.id === taskId);
    if (!taskToRemove) return;

    if (taskToRemove.isSystemGenerated && !canDeleteSystemGeneratedTasks) {
        toast({ title: "Deletion Denied", description: "System-generated tasks cannot be deleted by your role.", variant: "destructive"});
        return;
    }

    const updatedTasks = todoTasks.filter(task => task.id !== taskId);
    setTodoTasks(updatedTasks);
    MOCK_TODO_TASKS_DB[client.id] = updatedTasks;
    toast({ title: "Task Removed", description: `"${taskToRemove.description}" has been removed.` });
  };

  const handleGenerateProgressReport = async () => {
    if (!client || !user) {
      toast({ title: "Error", description: "Client or user data not available.", variant: "destructive" });
      return;
    }
    if (sessions.length === 0) {
      toast({ title: "No Session Notes", description: "Cannot generate a report without any session notes for this client.", variant: "default" });
      return;
    }

    setIsGeneratingReport(true);
    setGeneratedReport(null); // Clear previous report
    setIsReportModalOpen(true); // Open modal to show loading state

    try {
      // Format session notes for the AI
      const sessionNotesText = sessions
        .map(s => `Date: ${format(new Date(s.dateOfSession), 'yyyy-MM-dd')}\nClinician: ${s.attendingClinicianName}\nContent: ${s.content.replace(/<[^>]+>/g, ' ')}\n---`)
        .join('\n\n');
      
      const aiInput = {
        clientName: client.name,
        sessionNotesText: sessionNotesText,
      };

      const result = await generateProgressReport(aiInput);

      const newReport: ProgressReviewReport = {
        id: `report-${client.id}-${Date.now()}`,
        clientId: client.id,
        clientName: client.name,
        generatedAt: new Date().toISOString(),
        generatedByUserId: user.id,
        generatedByUserName: user.name,
        reportHtmlContent: result.reportHtmlContent,
      };
      setGeneratedReport(newReport);
      toast({ title: "Progress Report Generated", description: "The AI has drafted the progress report.", variant: "default" });

    } catch (error) {
      console.error("Error generating progress report:", error);
      toast({ title: "Report Generation Failed", description: (error as Error).message || "Could not generate the report. Please try again.", variant: "destructive" });
      setIsReportModalOpen(false); // Close modal on hard failure
    } finally {
      setIsGeneratingReport(false);
    }
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
    MOCK_CLIENTS_DB[client.id] = updatedClient; 
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
    MOCK_CLIENTS_DB[client.id] = updatedClient; 
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

  const availableCliniciansToAdd = MOCK_ALL_CLINICIANS_FOR_SELECTION.filter(
    c => !client.teamMemberIds?.includes(c.id)
  );

  const teamMembersForAssignment = MOCK_ALL_CLINICIANS_FOR_SELECTION.filter(
    c => client.teamMemberIds?.includes(c.id)
  ).map(c => ({ id: c.id, name: c.name }));


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
                <UserIconProp className="h-8 w-8" /> {client.name}
              </CardTitle>
              <CardDescription className="text-md text-muted-foreground mt-1">
                Client since {formatDistanceToNow(new Date(client.dateAdded), { addSuffix: true })}.
                Total Sessions: {sessions.length}.
                Pending Tasks: {todoTasks.filter(t => !t.isDone).length}.
              </CardDescription>
            </div>
             {canGenerateReport && (
                <Button onClick={handleGenerateProgressReport} disabled={isGeneratingReport || sessions.length === 0} variant="outline">
                {isGeneratingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCog className="mr-2 h-4 w-4" />}
                {isGeneratingReport ? 'Generating...' : 'Generate Progress Report'}
                </Button>
            )}
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
      
      {user && canModifyNotesAndTasks && client && (
         <ToDoList
            clientId={client.id}
            tasks={todoTasks}
            currentUser={user}
            onAddTask={handleAddToDoTask}
            onToggleTask={handleToggleToDoTask}
            onRemoveTask={handleRemoveToDoTask}
            canModify={canModifyNotesAndTasks}
            canDeleteSystemGenerated={canDeleteSystemGeneratedTasks}
            assignableTeamMembers={teamMembersForAssignment}
          />
      )}


      {canModifyNotesAndTasks ? (
        <SessionFeed 
          clientId={client.id} 
          clientName={client.name} 
          sessions={sessions} 
          currentUser={user!}
          onSessionAdded={handleAddSession}
          canModifyNotes={canModifyNotesAndTasks}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle /> Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">You are not a member of Team {client.name} and do not have permission to view or edit session notes or tasks for this client. Please contact an administrator if you believe this is an error.</p>
          </CardContent>
        </Card>
      )}

      <ProgressReportModal
        report={generatedReport}
        client={client}
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        isGenerating={isGeneratingReport}
      />
    </div>
  );
}


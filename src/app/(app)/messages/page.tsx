
// src/app/(app)/messages/page.tsx
"use client";

import { useState, useEffect } from 'react';
import type { MessageThread, Message, User } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import MessageThreadList from '@/components/messages/MessageThreadList';
import MessageView from '@/components/messages/MessageView';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquareText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// MOCK DATA - In a real app, this would come from a backend/database
const MOCK_USERS_FOR_MESSAGING: Pick<User, 'id' | 'name' | 'email' | 'vocation' | 'role'>[] = [
  { id: 'user_superadmin', email: 'superadmin@lifeweaver.com', name: 'Dr. Super Admin', role: 'Super Admin', vocation: 'Lead Therapist' },
  { id: 'user_admin', email: 'admin@lifeweaver.com', name: 'Alex Admin', role: 'Admin', vocation: 'Clinic Manager' },
  { id: 'user_clinician', email: 'clinician@lifeweaver.com', name: 'Casey Clinician', role: 'Clinician', vocation: 'Physiotherapist' },
  { id: 'user_clinician2', email: 'clinician2@lifeweaver.com', name: 'Jamie Therapist', role: 'Clinician', vocation: 'Occupational Therapist' },
  { id: 'user_new1', email: 'new.user1@example.com', name: 'Taylor New', role: 'Clinician', vocation: 'Speech Therapist' },
];

const MOCK_CLIENTS_FOR_TEAMS = [
    { id: 'client-1', name: 'John Doe', teamMemberIds: ['user_clinician', 'user_admin'] }, // Admin also on team for testing
    { id: 'client-2', name: 'Jane Smith', teamMemberIds: ['user_clinician2', 'user_clinician'] },
    { id: 'client-6', name: 'Diana Prince', teamMemberIds: ['user_clinician', 'user_clinician2', 'user_new1'] },
];


let MOCK_MESSAGE_THREADS_DATA: MessageThread[] = [
  { 
    id: 'thread-dm-1', type: 'dm', participantIds: ['user_current_placeholder', 'user_clinician'], 
    name: 'Casey Clinician', lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), 
    lastMessageSnippet: 'Sure, I can help with that report.', unreadCount: 0, 
    avatarUrl: 'https://picsum.photos/seed/user_clinician/40/40', avatarFallback: 'CC'
  },
  { 
    id: 'thread-team-1', type: 'team_chat', clientTeamId: 'client-1', participantIds: ['user_current_placeholder', 'user_clinician', 'user_admin'], 
    name: 'Team John Doe', lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), 
    lastMessageSnippet: 'Meeting rescheduled to 3 PM.', unreadCount: 2, 
    avatarUrl: `https://picsum.photos/seed/client-1/40/40`, avatarFallback: 'JD'
  },
  { 
    id: 'thread-dm-2', type: 'dm', participantIds: ['user_current_placeholder', 'user_admin'], 
    name: 'Alex Admin', lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), 
    lastMessageSnippet: 'Okay, sounds good!', unreadCount: 0,
    avatarUrl: 'https://picsum.photos/seed/user_admin/40/40', avatarFallback: 'AA'
  },
  { 
    id: 'thread-team-2', type: 'team_chat', clientTeamId: 'client-2', participantIds: ['user_current_placeholder', 'user_clinician2', 'user_clinician'], 
    name: 'Team Jane Smith', lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), 
    lastMessageSnippet: 'Anyone available for a quick sync?', unreadCount: 1,
    avatarUrl: `https://picsum.photos/seed/client-2/40/40`, avatarFallback: 'JS'
  },
];

let MOCK_MESSAGES_DATA: Record<string, Message[]> = {
  'thread-dm-1': [
    { id: 'msg-dm1-1', threadId: 'thread-dm-1', senderId: 'user_clinician', senderName: 'Casey Clinician', content: 'Hey! Do you have the latest report for Mr. Doe?', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_clinician/32/32', senderAvatarFallback: 'CC' },
    { id: 'msg-dm1-2', threadId: 'thread-dm-1', senderId: 'user_current_placeholder', senderName: 'Me', content: 'Yes, I do. I\'ll send it over.', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_current_placeholder/32/32', senderAvatarFallback: 'ME' },
    { id: 'msg-dm1-3', threadId: 'thread-dm-1', senderId: 'user_clinician', senderName: 'Casey Clinician', content: 'Sure, I can help with that report.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_clinician/32/32', senderAvatarFallback: 'CC' },
  ],
  'thread-team-1': [
    { id: 'msg-team1-1', threadId: 'thread-team-1', senderId: 'user_admin', senderName: 'Alex Admin', content: 'Hi team, the client meeting for John Doe has been moved from 2 PM to 3 PM tomorrow.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_admin/32/32', senderAvatarFallback: 'AA' },
    { id: 'msg-team1-2', threadId: 'thread-team-1', senderId: 'user_clinician', senderName: 'Casey Clinician', content: 'Meeting rescheduled to 3 PM.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_clinician/32/32', senderAvatarFallback: 'CC' },
  ],
  'thread-dm-2': [
    { id: 'msg-dm2-1', threadId: 'thread-dm-2', senderId: 'user_current_placeholder', senderName: 'Me', content: 'Hi Alex, can we discuss the new user onboarding process?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_current_placeholder/32/32', senderAvatarFallback: 'ME' },
    { id: 'msg-dm2-2', threadId: 'thread-dm-2', senderId: 'user_admin', senderName: 'Alex Admin', content: 'Okay, sounds good!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_admin/32/32', senderAvatarFallback: 'AA' },
  ],
   'thread-team-2': [
    { id: 'msg-team2-1', threadId: 'thread-team-2', senderId: 'user_clinician2', senderName: 'Jamie Therapist', content: 'Anyone available for a quick sync on Jane Smith\'s progress?', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_clinician2/32/32', senderAvatarFallback: 'JT' },
  ],
};


export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Helper to get initials
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };
  
  useEffect(() => {
    if (user) {
      // Replace placeholder ID with actual current user ID
      const currentUserId = user.id;
      const userAvatarUrl = `https://picsum.photos/seed/${user.id}/32/32`;
      const userAvatarFallback = getInitials(user.name);

      MOCK_MESSAGE_THREADS_DATA = MOCK_MESSAGE_THREADS_DATA.map(thread => ({
        ...thread,
        participantIds: thread.participantIds.map(id => id === 'user_current_placeholder' ? currentUserId : id),
        // Update DM thread names and avatars if current user is a participant
        ...(thread.type === 'dm' && thread.participantIds.includes(currentUserId) && {
            name: MOCK_USERS_FOR_MESSAGING.find(u => u.id !== currentUserId && thread.participantIds.includes(u.id))?.name || "Direct Message",
            avatarUrl: MOCK_USERS_FOR_MESSAGING.find(u => u.id !== currentUserId && thread.participantIds.includes(u.id)) ? `https://picsum.photos/seed/${MOCK_USERS_FOR_MESSAGING.find(u => u.id !== currentUserId && thread.participantIds.includes(u.id))?.id}/40/40` : undefined,
            avatarFallback: getInitials(MOCK_USERS_FOR_MESSAGING.find(u => u.id !== currentUserId && thread.participantIds.includes(u.id))?.name)
        })
      })).filter(thread => thread.participantIds.includes(currentUserId)); // Filter threads for current user

      MOCK_MESSAGES_DATA = Object.fromEntries(
        Object.entries(MOCK_MESSAGES_DATA).map(([threadId, msgs]) => [
          threadId,
          msgs.map(msg => ({
            ...msg,
            senderId: msg.senderId === 'user_current_placeholder' ? currentUserId : msg.senderId,
            senderName: msg.senderId === 'user_current_placeholder' ? user.name : msg.senderName,
            senderAvatarUrl: msg.senderId === 'user_current_placeholder' ? userAvatarUrl : msg.senderAvatarUrl,
            senderAvatarFallback: msg.senderId === 'user_current_placeholder' ? userAvatarFallback : msg.senderAvatarFallback,
          }))
        ])
      );
      setThreads(MOCK_MESSAGE_THREADS_DATA);
    }
  }, [user]);

  useEffect(() => {
    if (selectedThreadId && user) {
      setLoadingMessages(true);
      // Simulate fetching messages for the selected thread
      setTimeout(() => {
        const threadMessages = MOCK_MESSAGES_DATA[selectedThreadId] || [];
        setMessages(threadMessages.map(msg => ({...msg, isOwnMessage: msg.senderId === user.id})));
        
        // Mark thread as read (mock)
        setThreads(prevThreads => prevThreads.map(t => t.id === selectedThreadId ? {...t, unreadCount: 0} : t));
        setLoadingMessages(false);
      }, 300);
    } else {
      setMessages([]);
    }
  }, [selectedThreadId, user]);

  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
  };

  const handleSendMessage = (threadId: string, content: string) => {
    if (!user) return;

    const newMessage: Message = {
      id: `msg-${threadId}-${Date.now()}`,
      threadId,
      senderId: user.id,
      senderName: user.name,
      senderAvatarUrl: `https://picsum.photos/seed/${user.id}/32/32`,
      senderAvatarFallback: getInitials(user.name),
      content,
      timestamp: new Date().toISOString(),
      isOwnMessage: true,
    };

    // Update mock data (in a real app, send to backend)
    MOCK_MESSAGES_DATA[threadId] = [...(MOCK_MESSAGES_DATA[threadId] || []), newMessage];
    setMessages(prev => [...prev, newMessage]);

    setThreads(prevThreads => 
        prevThreads.map(t => 
            t.id === threadId 
            ? { ...t, lastMessageSnippet: content, lastMessageTimestamp: newMessage.timestamp } 
            : t
        ).sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime())
    );
    toast({ title: "Message Sent!"});
  };
  
  const handleStartNewDm = () => {
    // This would typically open a modal to select a user to DM.
    // For mock purposes, let's try to create a DM with the first user in MOCK_USERS_FOR_MESSAGING who is not the current user
    // and for whom a DM doesn't already exist.
    if (!user) return;

    const otherUsers = MOCK_USERS_FOR_MESSAGING.filter(u => u.id !== user.id);
    let targetUser: Pick<User, 'id' | 'name' | 'email'> | undefined = undefined;

    for (const potentialTarget of otherUsers) {
        const existingDm = threads.find(t => 
            t.type === 'dm' && 
            t.participantIds.includes(user.id) && 
            t.participantIds.includes(potentialTarget.id)
        );
        if (!existingDm) {
            targetUser = potentialTarget;
            break;
        }
    }

    if (!targetUser) {
        toast({ title: "Cannot Start New DM", description: "You already have DMs with all available mock users or no other users found.", variant: "default" });
        return;
    }
    
    const newThreadId = `thread-dm-${Date.now()}`;
    const newDmThread: MessageThread = {
      id: newThreadId,
      type: 'dm',
      participantIds: [user.id, targetUser.id],
      name: targetUser.name,
      avatarUrl: `https://picsum.photos/seed/${targetUser.id}/40/40`,
      avatarFallback: getInitials(targetUser.name),
      lastMessageTimestamp: new Date().toISOString(),
      lastMessageSnippet: 'New conversation started.',
      unreadCount: 0,
    };

    MOCK_MESSAGE_THREADS_DATA = [newDmThread, ...MOCK_MESSAGE_THREADS_DATA];
    MOCK_MESSAGES_DATA[newThreadId] = [{
        id: `msg-init-${Date.now()}`,
        threadId: newThreadId,
        senderId: user.id, // Or a system message
        senderName: 'System',
        content: `You started a conversation with ${targetUser.name}.`,
        timestamp: new Date().toISOString(),
    }];
    setThreads(prev => [newDmThread, ...prev]);
    setSelectedThreadId(newThreadId);
    toast({ title: "New DM Started", description: `You can now chat with ${targetUser.name}.` });
  };

  if (!user) {
    return <p>Loading messages...</p>;
  }
  
  const selectedThreadDetails = threads.find(t => t.id === selectedThreadId);

  return (
    <div className="h-[calc(100vh-var(--header-height,4rem))] flex flex-col"> {/* Adjust height based on actual header height */}
        <Card className="mb-0 flex-shrink-0 rounded-none border-x-0 border-t-0 sm:rounded-lg sm:border sm:m-0 sm:mb-6">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                    <MessageSquareText className="h-7 w-7" /> Messages
                </CardTitle>
                <CardDescription>
                    Communicate with your team and colleagues directly.
                </CardDescription>
            </CardHeader>
        </Card>
        <div className="flex-1 flex overflow-hidden min-h-0"> {/* Ensure this container allows children to scroll */}
            <div className="w-full sm:w-1/3 md:w-1/4 max-w-xs sm:max-w-sm lg:max-w-md h-full"> {/* Fixed width for thread list */}
                <MessageThreadList
                    threads={threads}
                    selectedThreadId={selectedThreadId}
                    onSelectThread={handleSelectThread}
                    onStartNewDm={handleStartNewDm}
                    currentUserId={user.id}
                />
            </div>
            <div className="flex-1 h-full"> {/* flex-1 for message view to take remaining space */}
                 <MessageView
                    thread={selectedThreadDetails || null}
                    messages={messages}
                    currentUser={user}
                    onSendMessage={handleSendMessage}
                    isLoading={loadingMessages}
                />
            </div>
        </div>
    </div>
  );
}

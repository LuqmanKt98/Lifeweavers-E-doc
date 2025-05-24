
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
import { 
  MOCK_ALL_USERS_DATABASE, 
  MOCK_CLIENTS_DB, 
  MOCK_MESSAGE_THREADS_DATA, 
  MOCK_MESSAGES_DATA,
  doUsersShareAnyClient 
} from '@/lib/mockDatabase';


export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };
  
  useEffect(() => {
    if (user) {
      const currentUserId = user.id;
      const userAvatarUrl = `https://picsum.photos/seed/${user.id}/32/32`;
      const userAvatarFallback = getInitials(user.name);

      let processedThreads = MOCK_MESSAGE_THREADS_DATA.map(thread => ({
        ...thread,
        participantIds: thread.participantIds.map(id => id === 'user_current_placeholder' ? currentUserId : id),
        ...(thread.type === 'dm' && thread.participantIds.includes(currentUserId) && {
            name: MOCK_ALL_USERS_DATABASE.find(u => u.id !== currentUserId && thread.participantIds.includes(u.id))?.name || "Direct Message",
            avatarUrl: MOCK_ALL_USERS_DATABASE.find(u => u.id !== currentUserId && thread.participantIds.includes(u.id)) ? `https://picsum.photos/seed/${MOCK_ALL_USERS_DATABASE.find(u => u.id !== currentUserId && thread.participantIds.includes(u.id))?.id}/40/40` : undefined,
            avatarFallback: getInitials(MOCK_ALL_USERS_DATABASE.find(u => u.id !== currentUserId && thread.participantIds.includes(u.id))?.name)
        }),
         ...(thread.type === 'team_chat' && thread.clientTeamId && MOCK_CLIENTS_DB[thread.clientTeamId] && {
            name: `Team ${MOCK_CLIENTS_DB[thread.clientTeamId].name}`,
            avatarUrl: `https://picsum.photos/seed/${thread.clientTeamId}/40/40`,
            avatarFallback: getInitials(MOCK_CLIENTS_DB[thread.clientTeamId].name)
        })
      })).filter(thread => thread.participantIds.includes(currentUserId));

      // Apply clinician DM filtering
      if (user.role === 'Clinician') {
        processedThreads = processedThreads.filter(thread => {
          if (thread.type === 'dm') {
            const otherParticipantId = thread.participantIds.find(id => id !== user.id);
            if (!otherParticipantId) return false; // Should not happen in a valid DM
            const otherParticipantUser = MOCK_ALL_USERS_DATABASE.find(u => u.id === otherParticipantId);
            if (otherParticipantUser?.role === 'Clinician') {
              return doUsersShareAnyClient(user.id, otherParticipantId, MOCK_CLIENTS_DB);
            }
          }
          return true; // Allow team chats and DMs with non-clinicians (Admins/SuperAdmins)
        });
      }
      setThreads(processedThreads);

      // Process messages data similarly (no filtering needed here based on new rules)
      let userMessages = Object.fromEntries(
        Object.entries(MOCK_MESSAGES_DATA).map(([threadId, msgs]) => [
          threadId,
          msgs.map(msg => ({
            ...msg,
            senderId: msg.senderId === 'user_current_placeholder' ? currentUserId : msg.senderId,
            senderName: msg.senderName === 'user_current_placeholder' ? user.name : msg.senderName,
            senderAvatarUrl: msg.senderId === 'user_current_placeholder' ? userAvatarUrl : msg.senderAvatarUrl,
            senderAvatarFallback: msg.senderId === 'user_current_placeholder' ? userAvatarFallback : msg.senderAvatarFallback,
          }))
        ])
      );
    }
  }, [user]);

  useEffect(() => {
    if (selectedThreadId && user) {
      setLoadingMessages(true);
      setTimeout(() => {
        const threadMessages = MOCK_MESSAGES_DATA[selectedThreadId] || [];
        setMessages(threadMessages.map(msg => ({...msg, isOwnMessage: msg.senderId === user.id})));
        
        setThreads(prevThreads => prevThreads.map(t => t.id === selectedThreadId ? {...t, unreadCount: 0} : t));
        const globalThreadIndex = MOCK_MESSAGE_THREADS_DATA.findIndex(t => t.id === selectedThreadId);
        if (globalThreadIndex !== -1) {
            MOCK_MESSAGE_THREADS_DATA[globalThreadIndex].unreadCount = 0;
        }
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

    if (!MOCK_MESSAGES_DATA[threadId]) {
      MOCK_MESSAGES_DATA[threadId] = [];
    }
    MOCK_MESSAGES_DATA[threadId].push(newMessage);
    setMessages(prev => [...prev, newMessage]);

    const updatedThreads = threads.map(t => 
            t.id === threadId 
            ? { ...t, lastMessageSnippet: content, lastMessageTimestamp: newMessage.timestamp } 
            : t
        ).sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    setThreads(updatedThreads);

    const globalThreadIndex = MOCK_MESSAGE_THREADS_DATA.findIndex(t => t.id === threadId);
    if (globalThreadIndex !== -1) {
        MOCK_MESSAGE_THREADS_DATA[globalThreadIndex].lastMessageSnippet = content;
        MOCK_MESSAGE_THREADS_DATA[globalThreadIndex].lastMessageTimestamp = newMessage.timestamp;
        MOCK_MESSAGE_THREADS_DATA.sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    }
    toast({ title: "Message Sent!"});
  };
  
  const handleStartNewDm = () => {
    if (!user) return;

    let potentialTargets = MOCK_ALL_USERS_DATABASE.filter(u => u.id !== user.id);

    if (user.role === 'Clinician') {
      potentialTargets = potentialTargets.filter(targetUser => {
        if (targetUser.role === 'Admin' || targetUser.role === 'Super Admin') {
          return true; // Clinicians can always DM Admins/SuperAdmins
        }
        if (targetUser.role === 'Clinician') {
          return doUsersShareAnyClient(user.id, targetUser.id, MOCK_CLIENTS_DB);
        }
        return false; // Should not happen if roles are correctly defined
      });
    }
    
    let targetUser: User | undefined = undefined;
    for (const potentialTarget of potentialTargets) {
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
        toast({ title: "Cannot Start New DM", description: "You already have DMs with all available/eligible users or no eligible users found.", variant: "default" });
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

    MOCK_MESSAGE_THREADS_DATA.unshift(newDmThread);
    MOCK_MESSAGES_DATA[newThreadId] = [{
        id: `msg-init-${Date.now()}`,
        threadId: newThreadId,
        senderId: user.id, 
        senderName: 'System',
        content: `You started a conversation with ${targetUser.name}.`,
        timestamp: new Date().toISOString(),
    }];
    setThreads(prev => [newDmThread, ...prev].sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()));
    setSelectedThreadId(newThreadId);
    toast({ title: "New DM Started", description: `You can now chat with ${targetUser.name}.` });
  };

  if (!user) {
    return <p>Loading messages...</p>;
  }
  
  const selectedThreadDetails = threads.find(t => t.id === selectedThreadId);

  return (
    <div className="h-[calc(100vh-var(--header-height,4rem))] flex flex-col">
        <Card className="mb-0 flex-shrink-0 rounded-none border-x-0 border-t-0 sm:rounded-lg sm:border sm:m-0 sm:mb-6">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                    <MessageSquareText className="h-7 w-7" /> Messages
                </CardTitle>
                <CardDescription>
                    Communicate with your team and colleagues directly. Clinicians can DM other clinicians only if they share a client.
                </CardDescription>
            </CardHeader>
        </Card>
        <div className="flex-1 flex overflow-hidden min-h-0">
            <div className="w-full sm:w-1/3 md:w-1/4 max-w-xs sm:max-w-sm lg:max-w-md h-full">
                <MessageThreadList
                    threads={threads}
                    selectedThreadId={selectedThreadId}
                    onSelectThread={handleSelectThread}
                    onStartNewDm={handleStartNewDm}
                    currentUserId={user.id}
                />
            </div>
            <div className="flex-1 h-full">
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


// src/components/messages/MessageView.tsx
"use client";

import type { Message, MessageThread, User } from '@/lib/types';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, User as UserIcon, MessageSquareDashed, Info } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '../ui/button'; // Assuming Button is in ui

interface MessageViewProps {
  thread: MessageThread | null;
  messages: Message[];
  currentUser: User;
  onSendMessage: (threadId: string, content: string) => void;
  isLoading?: boolean;
}

export default function MessageView({ thread, messages, currentUser, onSendMessage, isLoading }: MessageViewProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);
  
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <MessageSquareDashed className="h-16 w-16 text-muted-foreground animate-pulse" />
        <p className="mt-4 text-muted-foreground">Loading messages...</p>
      </div>
    );
  }
  
  if (!thread) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <MessageSquareDashed className="h-16 w-16 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Select a chat to start messaging</p>
        <p className="text-sm text-muted-foreground">or start a new conversation.</p>
      </div>
    );
  }
  
  const threadName = thread.name || (thread.type === 'dm' ? "Direct Message" : "Team Chat");
  const fallbackInitials = thread.avatarFallback || getInitials(threadName);


  return (
    <div className="flex-1 flex flex-col bg-background h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-card">
        <Avatar className="h-10 w-10">
           {thread.avatarUrl ? (
            <AvatarImage src={thread.avatarUrl} alt={threadName} data-ai-hint={thread.type === 'dm' ? 'person' : 'team icon'}/>
          ) : (
             thread.type === 'dm' ? <UserIcon className="h-full w-full p-2 text-muted-foreground" /> : <Users className="h-full w-full p-2 text-muted-foreground" />
          )}
          <AvatarFallback>{fallbackInitials}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-md font-semibold text-foreground">{threadName}</h2>
          {thread.type === 'team_chat' && (
            <p className="text-xs text-muted-foreground">
              {thread.participantIds.length} member{thread.participantIds.length === 1 ? '' : 's'}
            </p>
          )}
           {thread.type === 'dm' && (
            <p className="text-xs text-muted-foreground">Direct Message</p>
          )}
        </div>
        <div className="ml-auto">
            <Button variant="ghost" size="icon" title="Chat Info (not implemented)">
                <Info className="h-5 w-5 text-muted-foreground" />
            </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" viewportRef={viewportRef} ref={scrollAreaRef}>
        <div className="space-y-1">
          {messages.map(msg => (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              isOwnMessage={msg.senderId === currentUser.id}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <MessageInput 
        onSendMessage={(content) => onSendMessage(thread.id, content)}
        disabled={!thread}
      />
    </div>
  );
}

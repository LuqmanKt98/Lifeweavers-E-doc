
// src/components/messages/MessageThreadListItem.tsx
"use client";

import type { MessageThread } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Users, User as UserIcon } from 'lucide-react';

interface MessageThreadListItemProps {
  thread: MessageThread;
  isSelected: boolean;
  currentUserId: string; 
  onSelectThread: (threadId: string) => void;
}

export default function MessageThreadListItem({ thread, isSelected, onSelectThread, currentUserId }: MessageThreadListItemProps) {
  
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  const threadName = thread.name || (thread.type === 'dm' ? "Direct Message" : "Team Chat");
  const fallbackInitials = thread.avatarFallback || getInitials(threadName);
  const lastMessageTime = thread.lastMessageTimestamp 
    ? formatDistanceToNow(new Date(thread.lastMessageTimestamp), { addSuffix: true, includeSeconds: true })
    : '';

  return (
    <button
      onClick={() => onSelectThread(thread.id)}
      className={cn(
        "w-full text-left p-3 flex items-center gap-3 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected ? "bg-primary/10 text-primary-foreground" : "hover:bg-accent/50",
        thread.unreadCount > 0 && !isSelected && "bg-accent/20"
      )}
      aria-current={isSelected ? "page" : undefined}
    >
      <Avatar className="h-10 w-10">
        {thread.avatarUrl ? (
          <AvatarImage src={thread.avatarUrl} alt={threadName} data-ai-hint={thread.type === 'dm' ? 'person' : 'team icon'} />
        ) : (
          thread.type === 'dm' ? <UserIcon className="h-full w-full p-2 text-muted-foreground" /> : <Users className="h-full w-full p-2 text-muted-foreground" />
        )}
        <AvatarFallback>{fallbackInitials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className={cn("text-sm font-semibold truncate", isSelected ? "text-primary" : "text-foreground")}>{threadName}</h3>
          {thread.unreadCount > 0 && (
            <Badge variant={isSelected ? "secondary" : "default"} className="text-xs h-5 px-1.5">
              {thread.unreadCount}
            </Badge>
          )}
        </div>
        <p className={cn("text-xs truncate", isSelected ? "text-primary/80" : "text-muted-foreground")}>
          {thread.lastMessageSnippet || (thread.type === 'dm' ? 'No messages yet' : 'Start the conversation!')}
        </p>
      </div>
      <time className={cn("text-xs self-start pt-1", isSelected ? "text-primary/70" : "text-muted-foreground")}>
        {lastMessageTime.replace("about ", "")}
      </time>
    </button>
  );
}

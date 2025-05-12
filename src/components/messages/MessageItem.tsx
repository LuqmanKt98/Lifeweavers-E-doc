
// src/components/messages/MessageItem.tsx
"use client";

import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function MessageItem({ message, isOwnMessage }: MessageItemProps) {
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  return (
    <div className={cn("flex gap-3 py-2", isOwnMessage ? "justify-end" : "justify-start")}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 self-end">
          <AvatarImage src={message.senderAvatarUrl} alt={message.senderName} data-ai-hint="person avatar" />
          <AvatarFallback>{message.senderAvatarFallback || getInitials(message.senderName)}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-xl px-4 py-2.5 shadow-sm",
          isOwnMessage
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-secondary text-secondary-foreground rounded-bl-none"
        )}
      >
        {!isOwnMessage && (
          <p className="text-xs font-medium mb-0.5 opacity-80">{message.senderName}</p>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <time className={cn("text-xs mt-1 block", isOwnMessage ? "text-primary-foreground/70 text-right" : "text-muted-foreground/80 text-left")}>
          {format(new Date(message.timestamp), 'p')}
        </time>
      </div>
      {isOwnMessage && (
         <Avatar className="h-8 w-8 self-end">
           <AvatarImage src={message.senderAvatarUrl} alt={message.senderName} data-ai-hint="person avatar" />
           <AvatarFallback>{message.senderAvatarFallback || getInitials(message.senderName)}</AvatarFallback>
         </Avatar>
      )}
    </div>
  );
}

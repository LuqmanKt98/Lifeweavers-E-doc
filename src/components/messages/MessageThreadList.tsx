
// src/components/messages/MessageThreadList.tsx
"use client";

import type { MessageThread } from '@/lib/types';
import MessageThreadListItem from './MessageThreadListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, MessageSquarePlus } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

interface MessageThreadListProps {
  threads: MessageThread[];
  selectedThreadId: string | null;
  currentUserId: string;
  onSelectThread: (threadId: string) => void;
  onStartNewDm: () => void;
}

export default function MessageThreadList({ threads, selectedThreadId, onSelectThread, onStartNewDm, currentUserId }: MessageThreadListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredThreads = threads.filter(thread => 
    thread.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.lastMessageSnippet?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());

  return (
    <div className="h-full flex flex-col border-r bg-card">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-semibold text-primary">Chats</h2>
           <Button variant="ghost" size="icon" onClick={onStartNewDm} title="Start new DM">
             <MessageSquarePlus className="h-5 w-5" />
           </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search chats..." 
            className="pl-9 bg-secondary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {filteredThreads.length > 0 ? (
          <div className="p-2 space-y-1">
            {filteredThreads.map(thread => (
              <MessageThreadListItem
                key={thread.id}
                thread={thread}
                isSelected={thread.id === selectedThreadId}
                onSelectThread={onSelectThread}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm">
              {searchTerm ? "No chats match your search." : "No chats yet."}
            </p>
            {!searchTerm && <Button variant="link" onClick={onStartNewDm} className="mt-2">Start a new conversation</Button>}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

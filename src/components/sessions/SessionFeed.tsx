// src/components/sessions/SessionFeed.tsx
"use client";

import type { SessionNote, User } from '@/lib/types';
import SessionCard from './SessionCard';
import SessionEditor from './SessionEditor';
import { useState }  from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface SessionFeedProps {
  clientId: string;
  clientName: string;
  sessions: SessionNote[];
  currentUser: User;
  onSessionAdded: (newSession: SessionNote) => void;
}

export default function SessionFeed({ clientId, clientName, sessions, currentUser, onSessionAdded }: SessionFeedProps) {
  const [showEditor, setShowEditor] = useState(false);
  
  const handleSaveSession = (newSessionData: Omit<SessionNote, 'id' | 'sessionNumber' | 'createdAt' | 'updatedAt'>) => {
    // In a real app, this would be an API call.
    // For mock, we generate an ID and update locally.
    const newSession: SessionNote = {
      ...newSessionData,
      id: `sess-${clientId}-${Date.now()}`,
      sessionNumber: sessions.length + 1, // Simplified session numbering
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSessionAdded(newSession);
    setShowEditor(false); // Hide editor after saving
  };


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-foreground">Session History for {clientName}</h2>
        <Button onClick={() => setShowEditor(!showEditor)} variant="default">
          <PlusCircle className="mr-2 h-5 w-5" />
          {showEditor ? 'Cancel New Session' : 'Add New Session'}
        </Button>
      </div>

      {showEditor && (
        <SessionEditor
          clientId={clientId}
          currentUser={currentUser}
          onSave={handleSaveSession}
          onCancel={() => setShowEditor(false)}
          existingSessionsCount={sessions.length}
        />
      )}

      {sessions.length > 0 ? (
        <div className="space-y-6">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        !showEditor && (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-lg">No session notes found for this client yet.</p>
            <p className="text-sm text-muted-foreground">Click "Add New Session" to get started.</p>
          </div>
        )
      )}
    </div>
  );
}

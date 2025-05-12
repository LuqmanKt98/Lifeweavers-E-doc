// src/components/sessions/SessionCard.tsx
"use client";

import type { SessionNote } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { CalendarDays, UserCircle, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionCardProps {
  session: SessionNote;
}

export default function SessionCard({ session }: SessionCardProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  // Basic function to strip HTML for a preview. In a real app, use a library or more robust method.
  const createPreview = (htmlContent: string, length: number = 200) => {
    const textContent = htmlContent.replace(/<[^>]*>/g, ' ');
    if (textContent.length <= length) return textContent.trim();
    return textContent.substring(0, length).trim() + '...';
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300" id={`session-${session.id}`}>
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-xl font-semibold text-primary">
            Session {session.sessionNumber}
          </CardTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>{format(new Date(session.dateOfSession), 'PPP')}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://picsum.photos/seed/${session.attendingClinicianId}/32/32`} alt={session.attendingClinicianName} data-ai-hint="professional person"/>
            <AvatarFallback>{getInitials(session.attendingClinicianName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{session.attendingClinicianName}</p>
            <p className="text-xs">{session.attendingClinicianVocation || 'Clinician'}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-6">
        {/* In a real app, this would render HTML content safely. For now, just text. */}
        {/* For a true rich text display, you'd use dangerouslySetInnerHTML or a React HTML parser */}
        <div 
          className="prose prose-sm max-w-none text-foreground" 
          dangerouslySetInnerHTML={{ __html: session.content || "<p>No content for this session.</p>" }} 
        />
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Last updated: {format(new Date(session.updatedAt), 'Pp')}
        </p>
        {/* Add edit/delete buttons based on user permissions here */}
        <Button variant="outline" size="sm">
            <Edit3 className="mr-2 h-4 w-4" /> Edit Session
        </Button>
      </CardFooter>
    </Card>
  );
}

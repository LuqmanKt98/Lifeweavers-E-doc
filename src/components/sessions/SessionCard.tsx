// src/components/sessions/SessionCard.tsx
"use client";

import { useState } from 'react';
import type { SessionNote, Attachment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { CalendarDays, Edit3, Paperclip, Eye, FileText, Image as ImageIcon, Video, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilePreviewModal from '@/components/shared/FilePreviewModal'; // Import the new modal

interface SessionCardProps {
  session: SessionNote;
  canModifyNotes: boolean;
}

export default function SessionCard({ session, canModifyNotes }: SessionCardProps) {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  const handlePreviewAttachment = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setIsPreviewModalOpen(true);
  };

  const getFileIcon = (fileType: Attachment['fileType']) => {
    switch(fileType) {
      case 'image': return <ImageIcon className="h-4 w-4 text-muted-foreground" />;
      case 'pdf': return <FileText className="h-4 w-4 text-muted-foreground" />; // Or a PDF specific icon
      case 'video': return <Video className="h-4 w-4 text-muted-foreground" />;
      case 'document':
      case 'spreadsheet':
      case 'presentation':
        return <FileArchive className="h-4 w-4 text-muted-foreground" />; // Generic doc icon
      default: return <Paperclip className="h-4 w-4 text-muted-foreground" />;
    }
  };


  return (
    <>
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
          <div 
            className="prose prose-sm max-w-none text-foreground" 
            dangerouslySetInnerHTML={{ __html: session.content || "<p>No textual content for this session.</p>" }} 
          />
          {session.attachments && session.attachments.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-md font-semibold mb-3 text-foreground/90 flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-primary" /> Attached Files
              </h4>
              <ul className="space-y-2">
                {session.attachments.map((att) => (
                  <li key={att.id} className="flex items-center justify-between p-2 bg-secondary/20 hover:bg-secondary/40 rounded-md transition-colors">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      {getFileIcon(att.fileType)}
                      <span>{att.name}</span>
                      <span className="text-xs text-muted-foreground">({att.fileType})</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handlePreviewAttachment(att)}>
                      <Eye className="mr-2 h-4 w-4" /> Preview
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
           {( !session.content || session.content === '<p>No content for this session.</p>') && (!session.attachments || session.attachments.length === 0) && (
             <p className="text-muted-foreground italic">No content or attachments for this session.</p>
           )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Last updated: {format(new Date(session.updatedAt), 'Pp')}
          </p>
          {canModifyNotes && (
            <Button variant="outline" size="sm" disabled> {/* Edit functionality to be implemented */}
                <Edit3 className="mr-2 h-4 w-4" /> Edit Session
            </Button>
          )}
        </CardFooter>
      </Card>

      {selectedAttachment && (
        <FilePreviewModal
          attachment={selectedAttachment}
          isOpen={isPreviewModalOpen}
          onOpenChange={setIsPreviewModalOpen}
        />
      )}
    </>
  );
}

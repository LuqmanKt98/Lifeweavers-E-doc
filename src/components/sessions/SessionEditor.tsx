// src/components/sessions/SessionEditor.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import type { User, SessionNote } from '@/lib/types';
import { expandShorthand } from '@/ai/flows/expand-shorthand';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, Save, Ban } from 'lucide-react';
import { format } from 'date-fns';

interface SessionEditorProps {
  clientId: string;
  currentUser: User;
  onSave: (sessionData: Omit<SessionNote, 'id' | 'sessionNumber' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  existingSessionsCount: number;
  initialData?: Partial<SessionNote>; // For editing existing notes
}

export default function SessionEditor({
  clientId,
  currentUser,
  onSave,
  onCancel,
  existingSessionsCount,
  initialData,
}: SessionEditorProps) {
  const [dateOfSession, setDateOfSession] = useState(initialData?.dateOfSession ? format(new Date(initialData.dateOfSession), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
  const [content, setContent] = useState(initialData?.content || '');
  const [isExpanding, setIsExpanding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleExpandShorthand = async () => {
    if (!content.trim()) {
      toast({ title: "Shorthand is empty", description: "Please type some notes to expand.", variant: "default" });
      return;
    }
    setIsExpanding(true);
    try {
      const result = await expandShorthand({ shorthandText: content });
      setContent(result.expandedText);
      toast({ title: "Shorthand Expanded", description: "Your notes have been expanded.", variant: "default" });
    } catch (error) {
      console.error("Error expanding shorthand:", error);
      toast({ title: "Expansion Failed", description: "Could not expand shorthand. Please try again.", variant: "destructive" });
    } finally {
      setIsExpanding(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({ title: "Content Missing", description: "Session notes cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    
    const sessionData: Omit<SessionNote, 'id' | 'sessionNumber' | 'createdAt' | 'updatedAt'> = {
      clientId,
      dateOfSession: new Date(dateOfSession).toISOString(),
      attendingClinicianId: currentUser.id,
      attendingClinicianName: currentUser.name,
      attendingClinicianVocation: currentUser.vocation,
      content, // This would be HTML if using a rich text editor
    };

    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onSave(sessionData);
      toast({ title: "Session Saved", description: `Session ${initialData ? 'updated' : 'added'} successfully.`, variant: "default" });
    } catch (error) {
      console.error("Error saving session:", error);
      toast({ title: "Save Failed", description: "Could not save session. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const sessionTitle = initialData 
    ? `Edit Session ${initialData.sessionNumber}` 
    : `New Session (Session ${existingSessionsCount + 1})`;

  return (
    <Card className="shadow-xl border-primary/20 bg-gradient-to-br from-card to-secondary/10">
      <CardHeader>
        <CardTitle className="text-xl text-primary">{sessionTitle}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfSession">Date of Session</Label>
              <Input
                id="dateOfSession"
                type="date"
                value={dateOfSession}
                onChange={(e) => setDateOfSession(e.target.value)}
                required
                className="bg-background"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="attendingClinician">Attending Clinician</Label>
              <Input
                id="attendingClinician"
                type="text"
                value={`${currentUser.name} (${currentUser.vocation || currentUser.role})`}
                disabled
                className="bg-muted/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Session Notes</Label>
            <Textarea
              id="content"
              placeholder="Enter session notes here. You can use shorthand and expand it..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="min-h-[200px] bg-background text-base"
              required
            />
             <p className="text-xs text-muted-foreground">Supports basic spell-checking. Use the button below to expand shorthand.</p>
          </div>
          
          <Button
            type="button"
            onClick={handleExpandShorthand}
            disabled={isExpanding || !content.trim()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {isExpanding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Expand Shorthand
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            <Ban className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" disabled={isSaving || isExpanding}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {initialData ? 'Update Session' : 'Save Session'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

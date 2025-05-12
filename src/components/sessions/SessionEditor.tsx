// src/components/sessions/SessionEditor.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import type { User, SessionNote, Attachment } from '@/lib/types';
// import { expandShorthand } from '@/ai/flows/expand-shorthand'; // Removed as per rich text editor integration
import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea'; // Replaced with RichTextEditor
import RichTextEditor from '@/components/shared/RichTextEditor'; // Import RichTextEditor
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Ban, Paperclip, Trash2, FileText } from 'lucide-react'; // Wand2 removed
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SessionEditorProps {
  clientId: string;
  currentUser: User;
  onSave: (sessionData: Omit<SessionNote, 'id' | 'sessionNumber' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  existingSessionsCount: number;
  initialData?: Partial<SessionNote>; // For editing existing notes
}

const MOCK_FILE_TEMPLATES: Omit<Attachment, 'id' | 'url'>[] = [
  { name: "Progress Report Q3.pdf", mimeType: "application/pdf", fileType: "pdf" },
  { name: "Client Intake Form.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileType: "document" },
  { name: "Exercise Plan.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileType: "spreadsheet" },
  { name: "Posture Analysis.jpg", mimeType: "image/jpeg", fileType: "image" },
  { name: "Range of Motion.mp4", mimeType: "video/mp4", fileType: "video" },
  { name: "Presentation Summary.pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", fileType: "presentation" },
];


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
  const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments || []);
  // const [isExpanding, setIsExpanding] = useState(false); // Removed as AI shorthand expander is removed
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMockFileIndex, setSelectedMockFileIndex] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setDateOfSession(format(new Date(initialData.dateOfSession || Date.now()), "yyyy-MM-dd"));
      setContent(initialData.content || '');
      setAttachments(initialData.attachments || []);
    }
  }, [initialData]);

  // const handleExpandShorthand = async () => { // Removed
  //   if (!content.trim()) {
  //     toast({ title: "Shorthand is empty", description: "Please type some notes to expand.", variant: "default" });
  //     return;
  //   }
  //   setIsExpanding(true);
  //   try {
  //     const result = await expandShorthand({ shorthandText: content });
  //     setContent(result.expandedText);
  //     toast({ title: "Shorthand Expanded", description: "Your notes have been expanded.", variant: "default" });
  //   } catch (error) {
  //     console.error("Error expanding shorthand:", error);
  //     toast({ title: "Expansion Failed", description: "Could not expand shorthand. Please try again.", variant: "destructive" });
  //   } finally {
  //     setIsExpanding(false);
  //   }
  // };

  const handleAddAttachment = () => {
    if (selectedMockFileIndex === "") {
        toast({ title: "No File Selected", description: "Please select a mock file type to add.", variant: "default" });
        return;
    }
    const fileTemplate = MOCK_FILE_TEMPLATES[parseInt(selectedMockFileIndex)];
    if (!fileTemplate) return;

    const newAttachment: Attachment = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: fileTemplate.name,
      mimeType: fileTemplate.mimeType,
      url: `https://picsum.photos/seed/${Date.now()}/600/400`, 
      previewUrl: fileTemplate.fileType === 'image' ? `https://picsum.photos/seed/${Date.now()}/600/400` : undefined,
      fileType: fileTemplate.fileType,
    };
    setAttachments(prev => [...prev, newAttachment]);
    setSelectedMockFileIndex(""); 
    toast({ title: "Mock File Attached", description: `${newAttachment.name} added.`, variant: "default" });
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    toast({ title: "Attachment Removed", variant: "default" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0) {
      toast({ title: "Content Missing", description: "Session notes or attachments cannot both be empty.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    
    const sessionData: Omit<SessionNote, 'id' | 'sessionNumber' | 'createdAt' | 'updatedAt'> = {
      clientId,
      dateOfSession: new Date(dateOfSession).toISOString(),
      attendingClinicianId: currentUser.id,
      attendingClinicianName: currentUser.name,
      attendingClinicianVocation: currentUser.vocation,
      content,
      attachments,
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
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
        <CardDescription>
          Use the rich text editor below for formatting session notes. 
          File attachments are currently mocked. Full Google Drive integration would be a backend feature.
        </CardDescription>
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
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Enter session notes here..."
            />
             {/* <p className="text-xs text-muted-foreground">Use the button below to expand shorthand. For rich text, you can manually type HTML tags (e.g., &lt;b&gt;bold&lt;/b&gt;, &lt;ul&gt;&lt;li&gt;item&lt;/li&gt;&lt;/ul&gt;).</p> */}
          </div>
          
          {/* AI Shorthand Button Removed
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
          */}

          <div className="space-y-4">
            <Label>Attachments</Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Select value={selectedMockFileIndex} onValueChange={setSelectedMockFileIndex}>
                <SelectTrigger className="flex-1 bg-background">
                  <SelectValue placeholder="Select a mock file type to add" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_FILE_TEMPLATES.map((file, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {file.name} ({file.fileType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddAttachment} variant="outline" className="w-full sm:w-auto">
                <Paperclip className="mr-2 h-4 w-4" /> Attach Mock File
              </Button>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-2 mt-2 p-3 border rounded-md bg-secondary/30">
                <h4 className="text-sm font-medium text-foreground">Attached Files:</h4>
                <ul className="space-y-1">
                  {attachments.map((att) => (
                    <li key={att.id} className="flex items-center justify-between text-sm p-2 bg-background rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{att.name} ({att.fileType})</span>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAttachment(att.id)} title="Remove attachment">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            <Ban className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" disabled={isSaving /*|| isExpanding*/}>
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

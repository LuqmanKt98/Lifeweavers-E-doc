
// src/components/notifications/CreateNotificationDialog.tsx
"use client";

import { useState, type FormEvent } from 'react';
import type { Notification, NotificationType } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, X, Send } from 'lucide-react';

interface CreateNotificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNotificationAdded: (newNotification: Notification) => void;
}

const availableNotificationTypes: NotificationType[] = ['admin_broadcast', 'system_update', 'team_alert'];

export default function CreateNotificationDialog({ isOpen, onOpenChange, onNotificationAdded }: CreateNotificationDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NotificationType>('admin_broadcast');
  const [relatedLink, setRelatedLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setTitle('');
    setContent('');
    setType('admin_broadcast');
    setRelatedLink('');
    setIsSaving(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in Title and Content for the notification.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));

    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      content,
      type,
      timestamp: new Date().toISOString(),
      read: false, // New notifications are unread
      relatedLink: relatedLink.trim() || undefined,
      // recipientUserIds: For 'admin_broadcast', recipientUserIds is typically undefined, meaning it goes to all.
      // If a more targeted notification system is needed, this dialog would need a user selection mechanism.
    };

    onNotificationAdded(newNotification);
    toast({
      title: "Notification Created",
      description: `"${title}" has been broadcasted.`,
    });
    resetForm();
    onOpenChange(false); // Close dialog on success
    setIsSaving(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm(); // Reset form when dialog is closed
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" /> Create New Notification / Broadcast
          </DialogTitle>
          <DialogDescription>
            Compose a new notification to be sent to users. 'Admin Broadcast' type is generally for all users.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notif-title">Title</Label>
              <Input
                id="notif-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Important Update"
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notif-content">Content</Label>
              <Textarea
                id="notif-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Details about the notification..."
                rows={4}
                required
                disabled={isSaving}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="notif-type">Type</Label>
              <Select 
                value={type} 
                onValueChange={(value) => setType(value as NotificationType)}
                disabled={isSaving}
              >
                <SelectTrigger id="notif-type">
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  {availableNotificationTypes.map(t => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notif-relatedLink">Related Link (Optional)</Label>
              <Input
                id="notif-relatedLink"
                type="url"
                value={relatedLink}
                onChange={(e) => setRelatedLink(e.target.value)}
                placeholder="https://example.com/relevant-page"
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSaving}>
                 <X className="mr-2 h-4 w-4" />Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isSaving ? 'Sending...' : 'Send Notification'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

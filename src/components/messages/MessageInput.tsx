
// src/components/messages/MessageInput.tsx
"use client";

import { useState, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Paperclip } from 'lucide-react'; // Optional: Paperclip for attachments

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSendMessage(content.trim());
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t p-3 bg-background">
      {/* Optional: Attachment button 
      <Button variant="ghost" size="icon" type="button" disabled={disabled} title="Attach file (not implemented)">
        <Paperclip className="h-5 w-5" />
      </Button>
      */}
      <Textarea
        placeholder="Type your message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={1}
        className="flex-1 resize-none min-h-[40px] max-h-[120px] bg-secondary/50 focus-visible:ring-primary"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        disabled={disabled}
      />
      <Button type="submit" size="icon" disabled={!content.trim() || disabled} title="Send Message">
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}

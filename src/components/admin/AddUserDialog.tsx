
// src/components/admin/AddUserDialog.tsx
"use client";

import { useState, type FormEvent } from 'react';
import type { User, UserRole } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, X } from 'lucide-react';

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: (newUser: User) => void;
}

const availableRoles: Exclude<UserRole, 'Super Admin'>[] = ['Admin', 'Clinician'];

export default function AddUserDialog({ isOpen, onOpenChange, onUserAdded }: AddUserDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [vocation, setVocation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('');
    setVocation('');
    setIsSaving(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) {
      toast({
        title: "Missing Information",
        description: "Please fill in Name, Email, and Role.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));

    const newUser: User = {
      id: `user_new_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // More unique mock ID
      name,
      email,
      role: role as UserRole, // Cast as role is validated
      vocation: role === 'Clinician' ? vocation : undefined,
    };

    onUserAdded(newUser);
    toast({
      title: "User Added Successfully",
      description: `${name} has been added. A mock invitation email was sent to ${email}.`,
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" /> Add New User
          </DialogTitle>
          <DialogDescription>
            Enter the details for the new user. They will receive a mock email invitation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Full Name"
                required
                disabled={isSaving}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                className="col-span-3"
                placeholder="user@example.com"
                required
                disabled={isSaving}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select 
                value={role} 
                onValueChange={(value) => setRole(value as UserRole)}
                disabled={isSaving}
                required
              >
                <SelectTrigger className="col-span-3" id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {role === 'Clinician' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vocation" className="text-right">
                  Vocation
                </Label>
                <Input
                  id="vocation"
                  value={vocation}
                  onChange={(e) => setVocation(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Physiotherapist"
                  disabled={isSaving}
                />
              </div>
            )}
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
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {isSaving ? 'Adding User...' : 'Add User & Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

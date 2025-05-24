
// src/app/(app)/admin/users/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/types';
import { ShieldAlert, UserCog, Edit, Trash2, UserPlus, UserCheck, Eye } from 'lucide-react'; // Added UserCheck, Eye
import { MOCK_ALL_USERS_DATABASE } from '@/lib/mockDatabase';
import AddUserDialog from '@/components/admin/AddUserDialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function UserManagementPage() {
  const { currentUser, startImpersonation, isImpersonating, user: originalUser } = useAuth(); // Use currentUser for permissions
  const { toast } = useToast();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>(MOCK_ALL_USERS_DATABASE);

  useEffect(() => {
    setDisplayedUsers([...MOCK_ALL_USERS_DATABASE].sort((a,b) => a.name.localeCompare(b.name)));
  }, []); 

  if (!currentUser || (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin')) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-6 w-6" /> Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">
            You do not have permission to access this page.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  const handleUserAdded = (newUser: User) => {
    MOCK_ALL_USERS_DATABASE.push(newUser);
    setDisplayedUsers([...MOCK_ALL_USERS_DATABASE].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleRemoveUser = (userIdToRemove: string) => {
    const userToRemove = MOCK_ALL_USERS_DATABASE.find(u => u.id === userIdToRemove);
    if (!userToRemove) return;

    if (userToRemove.id === currentUser?.id) {
      toast({ title: "Action Denied", description: "You cannot remove yourself.", variant: "destructive" });
      return;
    }
    if (userToRemove.id === originalUser?.id && isImpersonating) {
       toast({ title: "Action Denied", description: "You cannot remove your original Super Admin account while impersonating.", variant: "destructive" });
      return;
    }
    if (userToRemove.role === 'Super Admin' && MOCK_ALL_USERS_DATABASE.filter(u => u.role === 'Super Admin').length <=1) {
       toast({ title: "Action Denied", description: "Cannot remove the only Super Admin.", variant: "destructive" });
      return;
    }
    
    const indexToRemove = MOCK_ALL_USERS_DATABASE.findIndex(u => u.id === userIdToRemove);
    if (indexToRemove > -1) {
        MOCK_ALL_USERS_DATABASE.splice(indexToRemove, 1);
        setDisplayedUsers([...MOCK_ALL_USERS_DATABASE].sort((a,b) => a.name.localeCompare(b.name)));
        toast({title: "User Removed", description: `${userToRemove.name} has been removed from the system.`});
    }
  }

  const handleImpersonate = async (userToImpersonate: User) => {
    if (currentUser?.role === 'Super Admin' && currentUser.id !== userToImpersonate.id) {
      await startImpersonation(userToImpersonate);
    } else {
      toast({ title: "Impersonation Failed", description: "You cannot impersonate this user or yourself.", variant: "destructive"});
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl font-bold">User Management</CardTitle>
            <CardDescription>
              View, add, edit, or remove users from the system. Super Admins can also impersonate users.
            </CardDescription>
          </div>
          {currentUser.role === 'Super Admin' && (
             <Button onClick={() => setIsAddUserDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" /> Add New User
             </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Vocation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedUsers.map((u) => (
                <TableRow key={u.id} className={cn(isImpersonating && originalUser?.id === u.id && "bg-yellow-100 dark:bg-yellow-800/30")}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://picsum.photos/seed/${u.id}/36/36`} alt={u.name} data-ai-hint="user avatar"/>
                        <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{u.name}</span>
                        {isImpersonating && originalUser?.id === u.id && <span className="text-xs text-yellow-600 dark:text-yellow-400">(Your Original Account)</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.vocation || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {currentUser.role === 'Super Admin' && u.id !== currentUser.id && u.id !== originalUser?.id && (
                      <Button variant="outline" size="sm" onClick={() => handleImpersonate(u)} title={`Impersonate ${u.name}`}>
                        <Eye className="mr-1 h-4 w-4" /> Impersonate
                      </Button>
                    )}
                     {isImpersonating && currentUser.id === u.id && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-black">
                           <UserCheck className="mr-1 h-3 w-3" /> Currently Impersonating
                        </span>
                    )}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Edit User (Not Implemented)" 
                        disabled={
                            currentUser.role !== 'Super Admin' || // Only SuperAdmins can edit
                            (u.role === 'Super Admin' && u.id !== currentUser.id && u.id !== originalUser?.id) // SA can edit other SAs unless it's their original account during impersonation
                        }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Remove User" 
                        className="text-destructive hover:text-destructive/80" 
                        disabled={
                            currentUser.role !== 'Super Admin' || 
                            u.id === currentUser.id || // Cannot remove self (current active identity)
                            u.id === originalUser?.id || // Cannot remove original SA account
                            (u.role === 'Super Admin' && MOCK_ALL_USERS_DATABASE.filter(usr => usr.role === 'Super Admin').length <= 1)
                        }
                        onClick={() => handleRemoveUser(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t pt-4">
            <p className="text-sm text-muted-foreground">Total users: {displayedUsers.length}</p>
        </CardFooter>
      </Card>
      {currentUser.role === 'Admin' && !isImpersonating && ( // Show this message only if the actual logged-in user is Admin
        <p className="text-sm text-muted-foreground">
            As an Admin, you can view users. Super Admins can add, edit, remove, and impersonate users.
        </p>
      )}

      <AddUserDialog
        isOpen={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
}

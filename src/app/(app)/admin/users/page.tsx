
// src/app/(app)/admin/users/page.tsx
"use client";

import { useState, useEffect } from 'react'; // Added useState and useEffect
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/types';
import { ShieldAlert, UserCog, Edit, Trash2, UserPlus } from 'lucide-react'; // Added UserPlus
import { MOCK_ALL_USERS_DATABASE } from '@/lib/mockDatabase';
import AddUserDialog from '@/components/admin/AddUserDialog'; // Import the new dialog
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function UserManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast(); // Initialize toast
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  // Use state for users to ensure list updates upon adding a new user
  const [displayedUsers, setDisplayedUsers] = useState<User[]>(MOCK_ALL_USERS_DATABASE);

  // Effect to update displayedUsers if MOCK_ALL_USERS_DATABASE changes externally (though not expected in this mock setup)
  useEffect(() => {
    setDisplayedUsers([...MOCK_ALL_USERS_DATABASE].sort((a,b) => a.name.localeCompare(b.name)));
  }, []); // Re-sort MOCK_ALL_USERS_DATABASE if it's ever modified elsewhere

  if (!user || (user.role !== 'Super Admin' && user.role !== 'Admin')) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-6 w-6" />
            Access Denied
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
    // Directly mutate the mock database for this simulation
    MOCK_ALL_USERS_DATABASE.push(newUser);
    // Update the local state to trigger re-render
    setDisplayedUsers([...MOCK_ALL_USERS_DATABASE].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleRemoveUser = (userIdToRemove: string) => {
    const userToRemove = MOCK_ALL_USERS_DATABASE.find(u => u.id === userIdToRemove);
    if (!userToRemove) return;

    // Prevent removing self or other Super Admins (especially if only one exists)
    if (userToRemove.id === user?.id) {
      toast({ title: "Action Denied", description: "You cannot remove yourself.", variant: "destructive" });
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl font-bold">User Management</CardTitle>
            <CardDescription>
              View, add, edit, or remove users from the system.
            </CardDescription>
          </div>
          {user.role === 'Super Admin' && (
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
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://picsum.photos/seed/${u.id}/36/36`} alt={u.name} data-ai-hint="user avatar"/>
                        <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.vocation || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Edit User (Not Implemented)" disabled={user.role !== 'Super Admin' && u.role === 'Super Admin'}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Remove User" 
                        className="text-destructive hover:text-destructive/80" 
                        disabled={
                            user.role !== 'Super Admin' || // Only SuperAdmins can remove
                            u.id === user.id || // Cannot remove self
                            (u.role === 'Super Admin' && MOCK_ALL_USERS_DATABASE.filter(usr => usr.role === 'Super Admin').length <= 1) // Cannot remove the last SuperAdmin
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
      {user.role === 'Admin' && (
        <p className="text-sm text-muted-foreground">
            As an Admin, you can view users. Super Admins can add, edit, and remove users.
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

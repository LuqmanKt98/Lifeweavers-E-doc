// src/app/(app)/admin/users/page.tsx
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/types';
import { ShieldAlert, UserCog, Edit, Trash2 } from 'lucide-react';
import { MOCK_ALL_USERS_DATABASE } from '@/lib/mockDatabase';

export default function UserManagementPage() {
  const { user } = useAuth();

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">User Management</CardTitle>
            <CardDescription>
              View, add, edit, or remove users from the system.
            </CardDescription>
          </div>
          {user.role === 'Super Admin' && (
             <Button>
                <UserCog className="mr-2 h-4 w-4" /> Add New User
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
              {MOCK_ALL_USERS_DATABASE.map((u) => (
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
                    <Button variant="ghost" size="icon" title="Edit User" disabled={user.role !== 'Super Admin' && u.role === 'Super Admin'}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Remove User" className="text-destructive hover:text-destructive/80" disabled={user.role !== 'Super Admin' || u.id === user.id || u.role === 'Super Admin'}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {user.role === 'Admin' && (
        <p className="text-sm text-muted-foreground">
            As an Admin, you can view users. Super Admins can add, edit, and remove users.
        </p>
      )}
    </div>
  );
}

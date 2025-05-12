// src/components/dashboards/SuperAdminDashboard.tsx
"use client";

import type { User, SessionNote, Client } from '@/lib/types';
import AdminDashboard from './AdminDashboard'; // Super Admin can see everything Admin sees
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldCheck, UserCog, MessagesSquare, ListChecks } from 'lucide-react'; // Corrected UsersCog to UserCog

interface SuperAdminDashboardProps {
  user: User;
  recentSessions: SessionNote[];
  allSessions: SessionNote[];
  clients: Client[];
  team: User[];
}

export default function SuperAdminDashboard({ user, recentSessions, allSessions, clients, team }: SuperAdminDashboardProps) {
  return (
    <div className="space-y-6">
      <Card className="border-accent bg-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent-foreground/80">
            <ShieldCheck className="h-6 w-6" />
            Super Admin Panel
          </CardTitle>
          <CardDescription className="text-accent-foreground/70">
            You have full access to system data and administrative functions.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" /> User Management
            </CardTitle>
            <CardDescription>
              Add, edit, or remove users and manage their roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default">
              <Link href="/admin/users">
                 Manage All Users
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessagesSquare className="h-5 w-5 text-primary" /> Message Oversight
            </CardTitle>
            <CardDescription>
              Access your messages. Full cross-user message management is a backend-dependent feature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default">
              <Link href="/messages">
                Open Messages
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2"> {/* Spans two columns on medium screens and above */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" /> Notification Control Center
            </CardTitle>
            <CardDescription>
              Review, edit, or delete all system notifications, including broadcasts and system-generated alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default">
              <Link href="/notifications">
                Manage Notifications
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Inherit Admin Dashboard sections */}
      <AdminDashboard user={user} recentSessions={recentSessions} allSessions={allSessions} clients={clients} team={team} />
    </div>
  );
}


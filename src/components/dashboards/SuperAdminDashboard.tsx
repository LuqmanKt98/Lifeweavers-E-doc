// src/components/dashboards/SuperAdminDashboard.tsx
"use client";

import type { User, SessionNote, Client } from '@/lib/types';
import AdminDashboard from './AdminDashboard'; // Super Admin can see everything Admin sees
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldCheck, Users2 } from 'lucide-react';

interface SuperAdminDashboardProps {
  user: User;
  recentSessions: SessionNote[];
  clients: Client[];
  team: User[];
}

export default function SuperAdminDashboard({ user, recentSessions, clients, team }: SuperAdminDashboardProps) {
  // Super Admin has all Admin capabilities, plus user management and potentially more.
  return (
    <div className="space-y-6">
      <Card className="border-accent bg-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent-foreground/80">
            <ShieldCheck className="h-6 w-6" />
            Super Admin Panel
          </CardTitle>
          <CardDescription className="text-accent-foreground/70">
            You have full access to the system, including user management and all client data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="border-accent text-accent-foreground hover:bg-accent/30">
            <Link href="/admin/users">
              <Users2 className="mr-2 h-4 w-4" /> Manage Users
            </Link>
          </Button>
          {/* Add other super admin specific actions here */}
        </CardContent>
      </Card>
      
      {/* Inherit Admin Dashboard sections */}
      <AdminDashboard user={user} recentSessions={recentSessions} clients={clients} team={team} />
    </div>
  );
}

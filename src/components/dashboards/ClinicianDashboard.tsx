// src/components/dashboards/ClinicianDashboard.tsx
"use client";

import type { User, Client, SessionNote } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
// EventCalendar import removed

interface ClinicianDashboardProps {
  user: User;
  clients: Client[];
  team: User[];
  // sessions prop removed
}

export default function ClinicianDashboard({ user, clients, team }: ClinicianDashboardProps) {
  const last5Clients = clients.slice(0, 5);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* EventCalendar rendering removed from here */}

      <Card className="lg:col-span-2 md:col-span-2"> {/* Adjusted span */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Your Recent Clients
          </CardTitle>
          <CardDescription>Quick access to your recently managed clients.</CardDescription>
        </CardHeader>
        <CardContent>
          {last5Clients.length > 0 ? (
            <ul className="space-y-4">
              {last5Clients.map((client) => (
                <li key={client.id} className="flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/60 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://picsum.photos/seed/${client.id}/40/40`} alt={client.name} data-ai-hint="person avatar" />
                      <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{client.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        Client since: {formatDistanceToNow(new Date(client.dateAdded), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/clients/${client.id}`}>View Notes <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No clients assigned or recently accessed.</p>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-1"> {/* Adjusted span */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Team Details
          </CardTitle>
          <CardDescription>Your colleagues at LWV CLINIC E-DOC.</CardDescription>
        </CardHeader>
        <CardContent>
          {team.filter(member => member.id !== user.id).length > 0 ? (
             <ul className="space-y-3">
              {team.filter(member => member.id !== user.id).slice(0,5).map((member) => ( // Show up to 5 team members
                <li key={member.id} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-md">
                  <Avatar className="h-9 w-9">
                     <AvatarImage src={`https://picsum.photos/seed/${member.id}/36/36`} alt={member.name} data-ai-hint="professional team" />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.vocation || member.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Team information is not available at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

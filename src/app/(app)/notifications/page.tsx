
// src/app/(app)/notifications/page.tsx
"use client";

import { useState, useEffect } from 'react';
import type { Notification, User } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import NotificationItem from '@/components/notifications/NotificationItem';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellRing, PlusCircle, ListFilter, Archive, CheckCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

// Mock notifications data
const MOCK_NOTIFICATIONS_DATA: Notification[] = [
  { id: 'notif-1', type: 'admin_broadcast', title: 'System Maintenance Scheduled', content: 'Lifeweaver Notes will be undergoing scheduled maintenance on Sunday at 2 AM for approximately 1 hour.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: false },
  { id: 'notif-2', type: 'team_alert', title: 'New Client "Alice Johnson" Assigned', content: 'You have been added to the team for client Alice Johnson. Please review their profile.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true, recipientUserIds: ['user_clinician'], relatedLink: '/clients/client-3' },
  { id: 'notif-3', type: 'system_update', title: 'Session Note Updated', content: 'Casey Clinician updated a session note for John Doe.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: false, recipientUserIds: ['user_admin'], relatedLink: '/clients/client-1' },
  { id: 'notif-4', type: 'admin_broadcast', title: 'Welcome to Lifeweaver Notes!', content: 'We are excited to have you on board. Explore the features and let us know if you have any questions.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), read: true },
  { id: 'notif-5', type: 'team_alert', title: 'Client "Bob Williams" Progress Review', content: 'A progress review meeting for Bob Williams is scheduled for next Tuesday. Please prepare your notes.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), read: false, recipientUserIds: ['user_clinician', 'user_clinician2'], relatedLink: '/clients/client-4' },
];


export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    // Simulate fetching notifications for the current user
    if (user) {
      const userNotifications = MOCK_NOTIFICATIONS_DATA.filter(n => {
        if (n.type === 'admin_broadcast') return true; // Broadcasts are for everyone
        return n.recipientUserIds?.includes(user.id) || !n.recipientUserIds; // Or targeted to user, or no specific recipient (implies for relevant users)
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(userNotifications);
    }
  }, [user]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    toast({ title: "Notification marked as read."});
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: "All notifications marked as read."});
  };

  const handleArchiveNotification = (id: string) => {
    // In a real app, this would likely call an API to archive
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({ title: "Notification archived." });
  };

  const filteredNotifications = notifications.filter(n => filter === 'all' || (filter === 'unread' && !n.read));
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return <p>Loading notifications...</p>;
  }

  const canBroadcast = user.role === 'Admin' || user.role === 'Super Admin';

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <BellRing className="h-7 w-7" /> Notifications
            </CardTitle>
            <CardDescription>
              Stay updated with important alerts and announcements. {unreadCount > 0 ? `You have ${unreadCount} unread notifications.` : 'No new notifications.'}
            </CardDescription>
          </div>
          {canBroadcast && (
            <Button variant="default">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Broadcast
            </Button>
          )}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread')} className="w-full sm:w-auto">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={handleMarkAllAsRead} disabled={unreadCount === 0} className="flex-1 sm:flex-none">
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark All Read
                    </Button>
                    {/* Optional: Button to manage archived notifications, or filter for archived, etc. */}
                    {/* <Button variant="outline" className="flex-1 sm:flex-none">
                        <Archive className="mr-2 h-4 w-4" /> View Archived
                    </Button> */}
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map(notification => (
                <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkAsRead={handleMarkAsRead}
                    onArchive={handleArchiveNotification} // Pass archive handler
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                {filter === 'unread' ? 'No unread notifications.' : 'No notifications here.'}
              </p>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' ? 'You are all caught up!' : 'Check back later for new updates.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


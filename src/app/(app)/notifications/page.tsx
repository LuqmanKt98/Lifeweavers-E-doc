
// src/app/(app)/notifications/page.tsx
"use client";

import { useState, useEffect } from 'react';
import type { Notification, User } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import NotificationItem from '@/components/notifications/NotificationItem';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellRing, PlusCircle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { MOCK_NOTIFICATIONS_DATA } from '@/lib/mockDatabase';


export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const isSuperAdminView = user?.role === 'Super Admin';

  useEffect(() => {
    if (user) {
      let userNotifications;
      if (isSuperAdminView) {
        userNotifications = MOCK_NOTIFICATIONS_DATA.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } else {
        userNotifications = MOCK_NOTIFICATIONS_DATA.filter(n => {
          if (n.type === 'admin_broadcast') return true;
          return n.recipientUserIds?.includes(user.id) || !n.recipientUserIds;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
      setNotifications(userNotifications);
    }
  }, [user, isSuperAdminView]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const mockIndex = MOCK_NOTIFICATIONS_DATA.findIndex(n => n.id === id);
    if (mockIndex !== -1) MOCK_NOTIFICATIONS_DATA[mockIndex].read = true;
    toast({ title: "Notification marked as read."});
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    MOCK_NOTIFICATIONS_DATA.forEach(n => {
        if (isSuperAdminView || n.type === 'admin_broadcast' || n.recipientUserIds?.includes(user!.id) || !n.recipientUserIds) {
            n.read = true;
        }
    });
    toast({ title: "All relevant notifications marked as read."});
  };

  const handleArchiveNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const mockIndex = MOCK_NOTIFICATIONS_DATA.findIndex(n => n.id === id);
    if (mockIndex !== -1) {
        MOCK_NOTIFICATIONS_DATA.splice(mockIndex, 1);
    }
    toast({ title: isSuperAdminView ? "Notification Deleted" : "Notification Archived" });
  };

  const handleEditNotification = (id: string) => {
    const notificationToEdit = MOCK_NOTIFICATIONS_DATA.find(n => n.id === id);
    toast({ 
        title: "Edit Action (Mock)", 
        description: `Super Admin would edit notification: "${notificationToEdit?.title || id}". (Not implemented)`, 
        variant: "default" 
    });
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
              <BellRing className="h-7 w-7" /> 
              {isSuperAdminView ? 'Manage All Notifications' : 'Notifications'}
            </CardTitle>
            <CardDescription>
              {isSuperAdminView 
                ? `Review, edit, or delete all system notifications. Total: ${notifications.length}.`
                : `Stay updated with important alerts and announcements. ${unreadCount > 0 ? `You have ${unreadCount} unread notifications.` : 'No new notifications.'}`
              }
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
                        <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
                        <TabsTrigger value="unread">
                            {isSuperAdminView ? `Unread Globally (${unreadCount})` : `Unread (${unreadCount})`}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex gap-2 w-full sm:w-auto">
                    {!isSuperAdminView && (
                        <Button variant="outline" onClick={handleMarkAllAsRead} disabled={unreadCount === 0} className="flex-1 sm:flex-none">
                            <CheckCircle className="mr-2 h-4 w-4" /> Mark All Read
                        </Button>
                    )}
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
                    onArchive={handleArchiveNotification}
                    isSuperAdminView={isSuperAdminView}
                    onEdit={isSuperAdminView ? handleEditNotification : undefined}
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

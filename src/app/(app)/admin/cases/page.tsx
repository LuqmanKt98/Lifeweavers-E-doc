// src/app/(app)/admin/cases/page.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, FolderSync, Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function CasesManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<{ success: boolean; timestamp: string | null }>({ success: false, timestamp: null });

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
            You do not have permission to access this page. Only Admins and Super Admins can manage cases and data synchronization.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSyncData = async () => {
    setIsSyncing(true);
    toast({
      title: "Synchronization Started",
      description: "Attempting to sync client data from Google Drive... (Mock Operation)",
      variant: "default",
    });

    // Simulate API call / long process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate success or failure randomly for mock purposes
    const syncSuccess = Math.random() > 0.3; // 70% chance of success

    if (syncSuccess) {
      setLastSyncStatus({ success: true, timestamp: new Date().toISOString() });
      toast({
        title: "Synchronization Successful",
        description: "Client data, session notes, and attachments have been updated from Google Drive. (Mock Operation)",
        variant: "default",
        className: "bg-green-500/10 border-green-500 text-green-700 dark:bg-green-500/20 dark:text-green-400",
      });
    } else {
      setLastSyncStatus({ success: false, timestamp: new Date().toISOString() });
      toast({
        title: "Synchronization Failed",
        description: "Could not complete data synchronization from Google Drive. Please try again later. (Mock Error)",
        variant: "destructive",
      });
    }
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <FolderSync className="h-7 w-7" />
            Cases Management & Drive Sync
          </CardTitle>
          <CardDescription>
            Manage client cases and synchronize data from Google Drive.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Google Drive Synchronization</CardTitle>
          <CardDescription>
            Update client information, session notes, and attachments from linked Google Drive folders.
            This process runs automatically daily, or you can trigger a manual sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center p-3 rounded-md bg-accent/20 border border-accent/50">
            <Info className="h-5 w-5 text-accent-foreground mr-3 flex-shrink-0" />
            <p className="text-sm text-accent-foreground">
              <strong>Mock Feature:</strong> This is a demonstration of Google Drive synchronization. No actual data is transferred or modified. All operations are simulated.
            </p>
          </div>
          <Button onClick={handleSyncData} disabled={isSyncing} className="w-full sm:w-auto">
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FolderSync className="mr-2 h-4 w-4" />
            )}
            {isSyncing ? 'Syncing Data...' : 'Sync Client Data from Google Drive'}
          </Button>
        </CardContent>
        <CardFooter className="border-t pt-4">
          {lastSyncStatus.timestamp ? (
            <div className={`flex items-center gap-2 text-sm ${lastSyncStatus.success ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
              {lastSyncStatus.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span>
                Last sync attempt: {format(new Date(lastSyncStatus.timestamp), 'PPPp')} - Status: {lastSyncStatus.success ? 'Successful' : 'Failed'}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No synchronization attempts yet in this session.</p>
          )}
        </CardFooter>
      </Card>
      
      {/* Future sections for case management could be added here, e.g.: */}
      {/*
      <Card>
        <CardHeader><CardTitle>Case Archival</CardTitle></CardHeader>
        <CardContent><p>Manage client case archival status.</p></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Data Export</CardTitle></CardHeader>
        <CardContent><p>Tools for exporting case data for compliance or transfer.</p></CardContent>
      </Card>
      */}
    </div>
  );
}

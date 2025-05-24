
// src/app/(app)/admin/resources/[resourceId]/edit/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ResourceEditorForm from '@/components/admin/resources/ResourceEditorForm';
import { useAuth } from '@/contexts/AuthContext';
import type { Resource } from '@/lib/types';
import { MOCK_RESOURCES_DB } from '@/lib/mockDatabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function EditResourcePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const resourceId = params.resourceId as string;
  const { toast } = useToast();

  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resourceId) {
      setIsLoading(true);
      const foundResource = MOCK_RESOURCES_DB.find(res => res.id === resourceId);
      if (foundResource) {
        setResource(foundResource);
      } else {
        setError("Resource not found.");
      }
      setIsLoading(false);
    }
  }, [resourceId]);

  if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Super Admin')) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-6 w-6" /> Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">
            You do not have permission to edit resources.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSaveResource = (resourceData: Omit<Resource, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt' | 'slug' | 'viewCount'>) => {
    if (!resource || !currentUser) return;

    const resourceIndex = MOCK_RESOURCES_DB.findIndex(res => res.id === resource.id);
    if (resourceIndex === -1) {
      toast({ title: "Error", description: "Resource not found for update.", variant: "destructive" });
      return;
    }

    const updatedResource: Resource = {
      ...MOCK_RESOURCES_DB[resourceIndex],
      ...resourceData,
      slug: resourceData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      updatedAt: new Date().toISOString(),
      publishedAt: resourceData.isPublished && !MOCK_RESOURCES_DB[resourceIndex].publishedAt 
                     ? new Date().toISOString() 
                     : (resourceData.isPublished ? MOCK_RESOURCES_DB[resourceIndex].publishedAt : undefined),
    };
     if (!resourceData.isPublished) {
        updatedResource.publishedAt = undefined;
    }


    MOCK_RESOURCES_DB[resourceIndex] = updatedResource;
    toast({
      title: "Resource Updated",
      description: `"${updatedResource.title}" has been successfully updated.`,
    });
    router.push(`/resources/${updatedResource.id}`);
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-1/2 mb-6" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <div className="flex justify-end gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" /> {error || "Could Not Load Resource"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">
            The resource you are trying to edit could not be found or loaded.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-primary">Edit Resource</h1>
      <ResourceEditorForm 
        initialData={resource} 
        onSave={handleSaveResource} 
        onCancel={() => router.push(`/resources/${resource.id}`)} 
        currentUser={currentUser}
      />
    </div>
  );
}

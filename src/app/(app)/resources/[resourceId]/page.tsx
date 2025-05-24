
// src/app/(app)/resources/[resourceId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Resource } from '@/lib/types';
import { MOCK_RESOURCES_DB } from '@/lib/mockDatabase';
import ResourceDisplay from '@/components/resources/ResourceDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ResourcePage() {
  const params = useParams();
  const resourceId = params.resourceId as string;
  const router = useRouter();

  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (resourceId) {
      setIsLoading(true);
      // Simulate fetching resource
      setTimeout(() => {
        const foundResource = MOCK_RESOURCES_DB.find(
          (res) => (res.id === resourceId || res.slug === resourceId) && res.isPublished
        );
        if (foundResource) {
          setResource(foundResource);
        } else {
          setResource(null); 
        }
        setIsLoading(false);
      }, 300);
    }
  }, [resourceId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="space-y-2 mt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-40 w-full mt-4" />
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
        <div className="text-center py-10">
            <h1 className="text-2xl font-bold text-destructive">Resource Not Found</h1>
            <p className="text-muted-foreground mt-2">The requested resource could not be found or is not published.</p>
            <Button onClick={() => router.push('/resources')} variant="outline" className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resources
            </Button>
        </div>
    );
  }

  return (
    <div>
        <Button onClick={() => router.back()} variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <ResourceDisplay resource={resource} />
    </div>
  );
}

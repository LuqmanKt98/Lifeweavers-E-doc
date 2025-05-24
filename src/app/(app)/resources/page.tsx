
// src/app/(app)/resources/page.tsx
"use client";

import { useState, useEffect } from 'react';
import type { Resource } from '@/lib/types';
import { MOCK_RESOURCES_DB } from '@/lib/mockDatabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Package, Search, AlertCircle, PlusCircle, Edit3 } from 'lucide-react';
import ResourceListItem from '@/components/resources/ResourceListItem';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';


export default function ResourcesPage() {
  const { user } = useAuth(); 
  const [searchTerm, setSearchTerm] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching resources
    setTimeout(() => {
      const relevantResources = user && (user.role === 'Admin' || user.role === 'Super Admin')
        ? MOCK_RESOURCES_DB // Admins see all
        : MOCK_RESOURCES_DB.filter(resource => resource.isPublished); // Others see only published
      
      setResources(
        relevantResources.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
      );
      setIsLoading(false);
    }, 300);
  }, [user]);

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    resource.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.resourceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageResources = user && (user.role === 'Admin' || user.role === 'Super Admin');

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <Package className="h-7 w-7" /> Resources
              </CardTitle>
              <CardDescription>
                {canManageResources ? "Manage and browse resources." : "Discover useful documents, links, tools, and guides shared by the team." }
              </CardDescription>
            </div>
            {canManageResources && (
                <Button asChild variant="default">
                    <Link href="/admin/resources/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Resource
                    </Link>
                </Button>
            )}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search resources by title, keyword, type, or author..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-4">Loading resources...</p>
          ) : filteredResources.length > 0 ? (
            <div className="space-y-4">
              {filteredResources.map(resource => (
                <ResourceListItem key={resource.id} resource={resource} currentUser={user}/>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <AlertCircle className="mx-auto h-12 w-12 mb-3"/>
              <p className="text-lg font-medium">
                {searchTerm ? "No resources match your search." : "No resources found."}
              </p>
              <p className="text-sm">
                {searchTerm ? "Try different keywords or check back later." : (canManageResources ? "Add a new resource to get started." : "The resource library is currently empty or no resources are published.")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

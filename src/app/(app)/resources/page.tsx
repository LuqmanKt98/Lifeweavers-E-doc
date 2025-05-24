
// src/app/(app)/resources/page.tsx
"use client";

import { useState, useEffect } from 'react';
import type { Resource } from '@/lib/types';
import { MOCK_RESOURCES_DB } from '@/lib/mockDatabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Package, Search, AlertCircle } from 'lucide-react';
import ResourceListItem from '@/components/resources/ResourceListItem';
import { useAuth } from '@/contexts/AuthContext';

export default function ResourcesPage() {
  const { user } = useAuth(); // Currently unused, but good for future RBAC on resources
  const [searchTerm, setSearchTerm] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching resources
    setTimeout(() => {
      const publishedResources = MOCK_RESOURCES_DB
        .filter(resource => resource.isPublished)
        .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
      setResources(publishedResources);
      setIsLoading(false);
    }, 300);
  }, []);

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    resource.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.resourceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Package className="h-7 w-7" /> Resources
          </CardTitle>
          <CardDescription>
            Discover useful documents, links, tools, and guides shared by the team.
          </CardDescription>
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
                <ResourceListItem key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <AlertCircle className="mx-auto h-12 w-12 mb-3"/>
              <p className="text-lg font-medium">
                {searchTerm ? "No resources match your search." : "No resources found."}
              </p>
              <p className="text-sm">
                {searchTerm ? "Try different keywords or check back later." : "The resource library is currently empty or no resources are published."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

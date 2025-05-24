
// src/app/(app)/admin/knowledge-base/new/page.tsx
"use client";

import ArticleEditorForm from '@/components/admin/knowledge-base/ArticleEditorForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { KnowledgeBaseArticle } from '@/lib/types';
import { MOCK_KNOWLEDGE_BASE_ARTICLES_DB } from '@/lib/mockDatabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function NewKnowledgeBaseArticlePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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
            You do not have permission to create new knowledge base articles.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSaveArticle = (articleData: Omit<KnowledgeBaseArticle, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt' | 'slug' | 'viewCount'>) => {
    if (!currentUser) return;

    const newArticle: KnowledgeBaseArticle = {
      ...articleData,
      id: `kb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      slug: articleData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: articleData.isPublished ? new Date().toISOString() : undefined,
      viewCount: 0,
    };

    MOCK_KNOWLEDGE_BASE_ARTICLES_DB.unshift(newArticle); // Add to the beginning of the array for visibility
    toast({
      title: "Article Created",
      description: `"${newArticle.title}" has been successfully created.`,
    });
    router.push(`/knowledge-base/${newArticle.id}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-primary">Create New Knowledge Base Article</h1>
      <ArticleEditorForm 
        onSave={handleSaveArticle} 
        onCancel={() => router.push('/knowledge-base')} 
        currentUser={currentUser}
      />
    </div>
  );
}

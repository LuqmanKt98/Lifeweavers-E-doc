
// src/app/(app)/admin/knowledge-base/[articleId]/edit/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ArticleEditorForm from '@/components/admin/knowledge-base/ArticleEditorForm';
import { useAuth } from '@/contexts/AuthContext';
import type { KnowledgeBaseArticle } from '@/lib/types';
import { MOCK_KNOWLEDGE_BASE_ARTICLES_DB } from '@/lib/mockDatabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function EditKnowledgeBaseArticlePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const articleId = params.articleId as string;
  const { toast } = useToast();

  const [article, setArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articleId) {
      setIsLoading(true);
      const foundArticle = MOCK_KNOWLEDGE_BASE_ARTICLES_DB.find(art => art.id === articleId);
      if (foundArticle) {
        setArticle(foundArticle);
      } else {
        setError("Article not found.");
      }
      setIsLoading(false);
    }
  }, [articleId]);

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
            You do not have permission to edit knowledge base articles.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSaveArticle = (articleData: Omit<KnowledgeBaseArticle, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt' | 'slug' | 'viewCount'>) => {
    if (!article || !currentUser) return;

    const articleIndex = MOCK_KNOWLEDGE_BASE_ARTICLES_DB.findIndex(art => art.id === article.id);
    if (articleIndex === -1) {
      toast({ title: "Error", description: "Article not found for update.", variant: "destructive" });
      return;
    }

    const updatedArticle: KnowledgeBaseArticle = {
      ...MOCK_KNOWLEDGE_BASE_ARTICLES_DB[articleIndex], // Preserve original fields like author, createdAt, viewCount
      ...articleData, // Apply changes from the form
      slug: articleData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''), // Re-generate slug based on new title
      updatedAt: new Date().toISOString(),
      publishedAt: articleData.isPublished && !MOCK_KNOWLEDGE_BASE_ARTICLES_DB[articleIndex].publishedAt 
                     ? new Date().toISOString() 
                     : (articleData.isPublished ? MOCK_KNOWLEDGE_BASE_ARTICLES_DB[articleIndex].publishedAt : undefined),
    };
    // If unpublished, publishedAt should be undefined
    if (!articleData.isPublished) {
        updatedArticle.publishedAt = undefined;
    }


    MOCK_KNOWLEDGE_BASE_ARTICLES_DB[articleIndex] = updatedArticle;
    toast({
      title: "Article Updated",
      description: `"${updatedArticle.title}" has been successfully updated.`,
    });
    router.push(`/knowledge-base/${updatedArticle.id}`);
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

  if (error || !article) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" /> {error || "Could Not Load Article"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">
            The article you are trying to edit could not be found or loaded.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-primary">Edit Knowledge Base Article</h1>
      <ArticleEditorForm 
        initialData={article} 
        onSave={handleSaveArticle} 
        onCancel={() => router.push(`/knowledge-base/${article.id}`)} 
        currentUser={currentUser}
      />
    </div>
  );
}


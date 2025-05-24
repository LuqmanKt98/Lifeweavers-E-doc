
// src/app/(app)/knowledge-base/page.tsx
"use client";

import { useState, useEffect } from 'react';
import type { KnowledgeBaseArticle } from '@/lib/types';
import { MOCK_KNOWLEDGE_BASE_ARTICLES_DB } from '@/lib/mockDatabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, AlertCircle, PlusCircle, Edit3 } from 'lucide-react';
import KnowledgeBaseListItem from '@/components/knowledge-base/KnowledgeBaseListItem';
import { useAuth } from '@/contexts/AuthContext'; 
import Link from 'next/link';

export default function KnowledgeBasePage() {
  const { user } = useAuth(); 
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching articles
    setTimeout(() => {
      const relevantArticles = user && (user.role === 'Admin' || user.role === 'Super Admin')
        ? MOCK_KNOWLEDGE_BASE_ARTICLES_DB // Admins see all articles
        : MOCK_KNOWLEDGE_BASE_ARTICLES_DB.filter(article => article.isPublished); // Others see only published

      setArticles(
        relevantArticles.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
      );
      setIsLoading(false);
    }, 300);
  }, [user]);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    article.authorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageKB = user && (user.role === 'Admin' || user.role === 'Super Admin');

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <BookOpen className="h-7 w-7" /> Knowledge Base
            </CardTitle>
            <CardDescription>
              {canManageKB ? "Manage and browse articles." : "Find helpful articles, guides, and resources shared by the team."}
            </CardDescription>
          </div>
          {canManageKB && (
            <Button asChild variant="default">
              <Link href="/admin/knowledge-base/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Article
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
              placeholder="Search articles by title, keyword, tag, or author..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-4">Loading articles...</p>
          ) : filteredArticles.length > 0 ? (
            <div className="space-y-4">
              {filteredArticles.map(article => (
                <KnowledgeBaseListItem key={article.id} article={article} currentUser={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <AlertCircle className="mx-auto h-12 w-12 mb-3"/>
              <p className="text-lg font-medium">
                {searchTerm ? "No articles match your search." : "No articles found."}
              </p>
              <p className="text-sm">
                {searchTerm ? "Try different keywords or check back later." : (canManageKB ? "Create a new article to get started." : "The knowledge base is currently empty or no articles are published.")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

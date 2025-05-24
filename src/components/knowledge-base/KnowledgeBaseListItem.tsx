
// src/components/knowledge-base/KnowledgeBaseListItem.tsx
"use client";

import type { KnowledgeBaseArticle } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowRight, CalendarDays, Edit3, Tag, UserCircle } from 'lucide-react';
import Image from 'next/image';

interface KnowledgeBaseListItemProps {
  article: KnowledgeBaseArticle;
}

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length === 1) return names[0][0].toUpperCase();
  return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
};

export default function KnowledgeBaseListItem({ article }: KnowledgeBaseListItemProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <Link href={`/knowledge-base/${article.id}`} className="block group">
        <CardHeader className="pb-3">
          {article.coverImageUrl && (
            <div className="relative h-40 w-full mb-4 rounded-t-md overflow-hidden">
              <Image 
                src={article.coverImageUrl} 
                alt={`Cover image for ${article.title}`} 
                layout="fill" 
                objectFit="cover" 
                className="group-hover:scale-105 transition-transform duration-300"
                data-ai-hint="article cover"
              />
            </div>
          )}
          <CardTitle className="text-xl font-semibold text-primary group-hover:underline">
            {article.title}
          </CardTitle>
          <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <div className="flex items-center gap-1">
              <UserCircle className="h-3.5 w-3.5" />
              <span>{article.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Published: {format(new Date(article.publishedAt || article.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm text-foreground/80 line-clamp-3">
            {article.excerpt || article.content.substring(0, 150).replace(/<[^>]+>/g, '') + '...'}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-3">
          <div className="flex flex-wrap gap-1">
            {article.tags?.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            {article.tags && article.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">+{article.tags.length - 3} more</Badge>
            )}
          </div>
          <span className="text-sm text-primary group-hover:underline flex items-center gap-1">
            Read More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}

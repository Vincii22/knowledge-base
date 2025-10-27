'use client';

import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Calendar, User, Tag, FolderOpen } from 'lucide-react';
import { Article } from '@/types';

const GET_ARTICLES = gql`
  query GetArticles($limit: Int, $isPublished: Boolean) {
    articles(limit: $limit, isPublished: $isPublished) {
      id
      title
      slug
      excerpt
      createdAt
      isPublished
      author {
        username
        name
      }
      category {
        name
        slug
      }
      tags {
        name
        slug
      }
    }
  }
`;

export default function HomePage() {
  const { data, loading, error } = useQuery(GET_ARTICLES, {
    variables: {
      limit: 20,
      isPublished: true,
    },
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading articles</p>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const articles: Article[] = data?.articles || [];

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">CSIT Knowledge Base</h1>
            <p className="text-xl text-accent-300 mb-8 italic">Your Success - Our World!</p>
            <p className="text-lg max-w-2xl mx-auto">
              Explore articles, tutorials, and documentation created by our community
            </p>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-primary-900">Latest Articles</h2>
          <div className="flex gap-4">
            <Link
              href="/categories"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Browse Categories
            </Link>
            <Link
              href="/tags"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Browse Tags
            </Link>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No articles published yet.</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-semibold"
            >
              Create the first article →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/article/${article.slug}`}>
                <Card className="h-full p-6 hover:border-primary-300 border-2 border-transparent transition">
                  <h3 className="text-xl font-bold text-primary-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  {article.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                  )}

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{article.author.name || article.author.username}</span>
                    </div>

                    {article.category && (
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        <span>{article.category.name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>

                    {article.tags.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Tag className="w-4 h-4 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag) => (
                            <span
                              key={tag.slug}
                              className="px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
'use client';

import { useQuery, gql } from '@apollo/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Plus, Edit, Eye, EyeOff, Calendar, Pencil } from 'lucide-react';
import { Article } from '@/types';

const GET_MY_ARTICLES = gql`
  query GetMe {
    me {
      id
      username
      name
      email
      role
      articles {
        id
        title
        slug
        excerpt
        isPublished
        createdAt
        updatedAt
        category {
          name
        }
        tags {
          name
        }
      }
    }
  }
`;

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data, loading, error } = useQuery(GET_MY_ARTICLES, {
    skip: status !== 'authenticated',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!session) {
    return null;
  }

  const user = data?.me;
  const articles: Article[] = user?.articles || [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">
            Welcome back, {user?.name || user?.username}!
          </h1>
          <p className="text-gray-600">Manage your articles and content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Articles</p>
                <p className="text-3xl font-bold text-primary-900">{articles.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Edit className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Published</p>
                <p className="text-3xl font-bold text-green-600">
                  {articles.filter((a) => a.isPublished).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Drafts</p>
                <p className="text-3xl font-bold text-gray-600">
                  {articles.filter((a) => !a.isPublished).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary-900">Your Articles</h2>
          <Link href="/dashboard/article/new">
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              New Article
            </Button>
          </Link>
        </div>

        {/* Articles List */}
        {articles.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">You haven't created any articles yet.</p>
            <Link href="/dashboard/article/new">
              <Button variant="primary">Create your first article</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id} className="p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-primary-900">{article.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          article.isPublished
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {article.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    {article.excerpt && (
                      <p className="text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {article.category && (
                        <span className="flex items-center gap-1">
                          📁 {article.category.name}
                        </span>
                      )}
                      {article.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          🏷️ {article.tags.map((t) => t.name).join(', ')}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Link href={`/article/${article.slug}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/dashboard/article/${article.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
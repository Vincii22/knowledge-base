'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, gql } from '@apollo/client';
import MainLayout from '@/components/layout/MainLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ArticleEditor from '@/components/article/ArticleEditor';
import { Save, Eye, X } from 'lucide-react';

const CREATE_ARTICLE = gql`
  mutation CreateArticle($input: CreateArticleInput!) {
    createArticle(input: $input) {
      id
      title
      slug
      content
      excerpt
      isPublished
    }
  }
`;

const PUBLISH_ARTICLE = gql`
  mutation PublishArticle($id: ID!) {
    publishArticle(id: $id) {
      id
      isPublished
    }
  }
`;

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
    }
  }
`;

export default function NewArticlePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tagIds: [] as string[],
  });
  const [error, setError] = useState('');

  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: tagsData } = useQuery(GET_TAGS);

  const [createArticle, { loading: creating }] = useMutation(CREATE_ARTICLE, {
    onCompleted: (data) => {
      router.push('/dashboard');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const [publishArticle] = useMutation(PUBLISH_ARTICLE);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
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

  const handleSubmit = async (publish: boolean = false) => {
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    try {
      const result = await createArticle({
        variables: {
          input: {
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt || undefined,
            categoryId: formData.categoryId || undefined,
            tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
          },
        },
      });

      if (publish && result.data?.createArticle?.id) {
        await publishArticle({
          variables: {
            id: result.data.createArticle.id,
          },
        });
      }
    } catch (err) {
      console.error('Error creating article:', err);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setFormData({
      ...formData,
      tagIds: formData.tagIds.includes(tagId)
        ? formData.tagIds.filter((id) => id !== tagId)
        : [...formData.tagIds, tagId],
    });
  };

  const categories = categoriesData?.categories || [];
  const tags = tagsData?.tags || [];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-primary-900">Create New Article</h1>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            <X className="w-5 h-5 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <Input
            label="Title"
            type="text"
            placeholder="Enter article title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Brief description of the article"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category (Optional)
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Select a category</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: any) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    formData.tagIds.includes(tag.id)
                      ? 'bg-accent-500 text-primary-900'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <ArticleEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              isLoading={creating}
              disabled={creating}
            >
              <Save className="w-5 h-5 mr-2" />
              Save as Draft
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit(true)}
              isLoading={creating}
              disabled={creating}
            >
              <Eye className="w-5 h-5 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
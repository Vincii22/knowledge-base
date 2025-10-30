'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, gql } from '@apollo/client';
import MainLayout from '@/components/layout/MainLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ArticleEditor from '@/components/article/ArticleEditor';
import { Save, Eye, Trash2, X } from 'lucide-react';

const GET_ARTICLE = gql`
  query GetArticleForEdit($id: ID!) {
    user(id: $id) {
      id
      title
      slug
      content
      excerpt
      isPublished
      category {
        id
      }
      tags {
        id
      }
    }
  }
`;

const UPDATE_ARTICLE = gql`
  mutation UpdateArticle($id: ID!, $input: UpdateArticleInput!) {
    updateArticle(id: $id, input: $input) {
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

const DELETE_ARTICLE = gql`
  mutation DeleteArticle($id: ID!) {
    deleteArticle(id: $id)
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

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id as string;
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tagIds: [] as string[],
  });
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: articleData, loading: articleLoading } = useQuery(GET_ARTICLE, {
    variables: { id: articleId },
    skip: !articleId,
    onCompleted: (data) => {
      const article = data.article;
      setFormData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || '',
        categoryId: article.category?.id || '',
        tagIds: article.tags?.map((t: any) => t.id) || [],
      });
    },
  });

  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: tagsData } = useQuery(GET_TAGS);

  const [updateArticle, { loading: updating }] = useMutation(UPDATE_ARTICLE, {
    onCompleted: () => {
      router.push('/dashboard');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const [publishArticle] = useMutation(PUBLISH_ARTICLE);

  const [deleteArticle, { loading: deleting }] = useMutation(DELETE_ARTICLE, {
    onCompleted: () => {
      router.push('/dashboard');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || articleLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!session || !articleData?.article) {
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
      await updateArticle({
        variables: {
          id: articleId,
          input: {
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt || undefined,
            categoryId: formData.categoryId || undefined,
            tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
          },
        },
      });

      if (publish && !articleData.article.isPublished) {
        await publishArticle({
          variables: {
            id: articleId,
          },
        });
      }
    } catch (err) {
      console.error('Error updating article:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteArticle({
        variables: { id: articleId },
      });
    } catch (err) {
      console.error('Error deleting article:', err);
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
  const article = articleData.article;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-primary-900">Edit Article</h1>
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold mb-3">
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={deleting}
              >
                Yes, Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

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
              isLoading={updating}
              disabled={updating}
            >
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </Button>
            {!article.isPublished && (
              <Button
                variant="primary"
                onClick={() => handleSubmit(true)}
                isLoading={updating}
                disabled={updating}
              >
                <Eye className="w-5 h-5 mr-2" />
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
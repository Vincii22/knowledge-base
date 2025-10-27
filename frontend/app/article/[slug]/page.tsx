'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { Calendar, User, Tag, FolderOpen, MessageCircle } from 'lucide-react';
import { Article } from '@/types';

const GET_ARTICLE = gql`
  query GetArticle($slug: String!) {
    article(slug: $slug) {
      id
      title
      slug
      content
      excerpt
      createdAt
      updatedAt
      author {
        id
        username
        name
      }
      category {
        id
        name
        slug
      }
      tags {
        id
        name
        slug
      }
      comments {
        id
        content
        createdAt
        author {
          username
          name
        }
      }
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      createdAt
      author {
        username
        name
      }
    }
  }
`;

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { data: session } = useSession();
  const [commentContent, setCommentContent] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_ARTICLE, {
    variables: { slug },
  });

  const [createComment, { loading: commentLoading }] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      setCommentContent('');
      refetch();
    },
  });

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await createComment({
        variables: {
          input: {
            content: commentContent,
            articleId: article.id,
          },
        },
      });
    } catch (err) {
      console.error('Error creating comment:', err);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (error || !data?.article) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Article not found</p>
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-semibold">
              ← Back to Home
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const article: Article = data.article;

  return (
    <MainLayout>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-block">
            ← Back to Articles
          </Link>

          <h1 className="text-4xl font-bold text-primary-900 mb-4">{article.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.author.name || article.author.username}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(article.createdAt).toLocaleDateString()}</span>
            </div>

            {article.category && (
              <Link
                href={`/category/${article.category.slug}`}
                className="flex items-center gap-2 hover:text-primary-600"
              >
                <FolderOpen className="w-4 h-4" />
                <span>{article.category.name}</span>
              </Link>
            )}
          </div>

          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm hover:bg-accent-200 transition"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Comments ({article.comments.length})
          </h2>

          {/* Comment Form */}
          {session ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={4}
              />
              <div className="mt-2 flex justify-end">
                <Button type="submit" isLoading={commentLoading} disabled={!commentContent.trim()}>
                  Post Comment
                </Button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-primary-50 rounded-lg text-center">
              <p className="text-gray-700">
                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Sign in
                </Link>{' '}
                to leave a comment
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {article.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              article.comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-primary-900">
                      {comment.author.name || comment.author.username}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </article>
    </MainLayout>
  );
}
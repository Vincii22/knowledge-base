import bcrypt from 'bcryptjs';
import { Context } from '../../types/context.js';
import { generateToken } from '../../utils/jwt.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

// Helper function to generate slug
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const resolvers = {
  Query: {
    // Test query
    hello: () => 'Hello from Knowledge Base API!',

    // User queries
    me: async (_: any, __: any, context: Context) => {
      requireAuth(context.user);
      return await context.prisma.user.findUnique({
        where: { id: context.user!.userId },
      });
    },

    users: async (_: any, __: any, context: Context) => {
      requireRole(context.user, ['ADMIN']);
      return await context.prisma.user.findMany();
    },

    user: async (_: any, { id }: { id: string }, context: Context) => {
      requireRole(context.user, ['ADMIN']);
      return await context.prisma.user.findUnique({
        where: { id },
      });
    },

    // Article queries
    articles: async (
      _: any,
      { limit = 10, offset = 0, isPublished }: { limit?: number; offset?: number; isPublished?: boolean },
      context: Context
    ) => {
      return await context.prisma.article.findMany({
        ...(isPublished !== undefined && { where: { isPublished } }),
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });
    },

    article: async (_: any, { id, slug }: { id?: string; slug?: string }, context: Context) => {
      if (!id && !slug) {
        throw new Error('Either id or slug must be provided');
      }

      return await context.prisma.article.findUnique({
        where: id ? { id } : { slug: slug! },
      });
    },

    // Category queries
    categories: async (_: any, __: any, context: Context) => {
      return await context.prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
    },

    category: async (_: any, { id }: { id: string }, context: Context) => {
      return await context.prisma.category.findUnique({
        where: { id },
      });
    },

    // Tag queries
    tags: async (_: any, __: any, context: Context) => {
      return await context.prisma.tag.findMany({
        orderBy: { name: 'asc' },
      });
    },

    tag: async (_: any, { id }: { id: string }, context: Context) => {
      return await context.prisma.tag.findUnique({
        where: { id },
      });
    },
  },

  Mutation: {
    // Auth mutations
    register: async (
      _: any,
      { input }: { input: { email: string; username: string; password: string; name?: string } },
      context: Context
    ) => {
      const { email, username, password, name } = input;

      // Check if user exists
      const existingUser = await context.prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await context.prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          ...(name && { name }),
          role: 'VIEWER', // Default role
        },
      });

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { token, user };
    },

    login: async (_: any, { input }: { input: { email: string; password: string } }, context: Context) => {
      const { email, password } = input;

      // Find user
      const user = await context.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { token, user };
    },

    // User mutations
    updateUser: async (
      _: any,
      { id, input }: { id: string; input: any },
      context: Context
    ) => {
      requireRole(context.user, ['ADMIN']);

      return await context.prisma.user.update({
        where: { id },
        data: input,
      });
    },

    deleteUser: async (_: any, { id }: { id: string }, context: Context) => {
      requireRole(context.user, ['ADMIN']);

      await context.prisma.user.delete({
        where: { id },
      });

      return true;
    },

    // Article mutations
    createArticle: async (
      _: any,
      { input }: { input: any },
      context: Context
    ) => {
      requireRole(context.user, ['ADMIN', 'EDITOR']);

      const { title, content, excerpt, categoryId, tagIds } = input;
      const slug = generateSlug(title);

      const articleData: any = {
        title,
        slug,
        content,
        authorId: context.user!.userId,
      };

      if (excerpt) {
        articleData.excerpt = excerpt;
      }

      if (categoryId) {
        articleData.categoryId = categoryId;
      }

      if (tagIds && tagIds.length > 0) {
        articleData.tags = {
          connect: tagIds.map((id: string) => ({ id })),
        };
      }

      return await context.prisma.article.create({
        data: articleData,
      });
    },

    updateArticle: async (
      _: any,
      { id, input }: { id: string; input: any },
      context: Context
    ) => {
      requireRole(context.user, ['ADMIN', 'EDITOR']);

      const { title, content, excerpt, categoryId, tagIds } = input;
      
      const updateData: any = {};

      if (title) {
        updateData.title = title;
        updateData.slug = generateSlug(title);
      }

      if (content) {
        updateData.content = content;
      }

      if (excerpt !== undefined) {
        updateData.excerpt = excerpt;
      }

      if (categoryId !== undefined) {
        updateData.categoryId = categoryId;
      }

      if (tagIds) {
        // Disconnect all existing tags and connect new ones
        updateData.tags = {
          set: [],
          connect: tagIds.map((tagId: string) => ({ id: tagId })),
        };
      }

      return await context.prisma.article.update({
        where: { id },
        data: updateData,
      });
    },

    deleteArticle: async (_: any, { id }: { id: string }, context: Context) => {
      requireRole(context.user, ['ADMIN', 'EDITOR']);

      await context.prisma.article.delete({
        where: { id },
      });

      return true;
    },

    publishArticle: async (_: any, { id }: { id: string }, context: Context) => {
      requireRole(context.user, ['ADMIN', 'EDITOR']);

      await context.prisma.article.update({
        where: { id },
        data: { isPublished: true },
      });

      return await context.prisma.article.findUnique({
        where: { id },
      });
    },

    // Category mutations
    createCategory: async (
      _: any,
      { input }: { input: { name: string; description?: string } },
      context: Context
    ) => {
      requireRole(context.user, ['ADMIN', 'EDITOR']);

      const { name, description } = input;
      const slug = generateSlug(name);

      const categoryData: any = {
        name,
        slug,
      };

      if (description) {
        categoryData.description = description;
      }

      return await context.prisma.category.create({
        data: categoryData,
      });
    },

    updateCategory: async (
      _: any,
      { id, input }: { id: string; input: { name?: string; description?: string } },
      context: Context
    ) => {
      requireRole(context.user, ['ADMIN', 'EDITOR']);

      const { name, description } = input;
      const updateData: any = {};

      if (name) {
        updateData.name = name;
        updateData.slug = generateSlug(name);
      }

      if (description !== undefined) {
        updateData.description = description;
      }

      return await context.prisma.category.update({
        where: { id },
        data: updateData,
      });
    },

    deleteCategory: async (_: any, { id }: { id: string }, context: Context) => {
      requireRole(context.user, ['ADMIN']);

      await context.prisma.category.delete({
        where: { id },
      });

      return true;
    },

    // Tag mutations
    createTag: async (
      _: any,
      { input }: { input: { name: string } },
      context: Context
    ) => {
      requireRole(context.user, ['ADMIN', 'EDITOR']);

      const { name } = input;
      const slug = generateSlug(name);

      return await context.prisma.tag.create({
        data: {
          name,
          slug,
        },
      });
    },

    updateTag: async (
      _: any,
      { id, input }: { id: string; input: { name: string } },
      context: Context
    ) => {
      requireRole(context.user, ['ADMIN', 'EDITOR']);

      const { name } = input;

      return await context.prisma.tag.update({
        where: { id },
        data: {
          name,
          slug: generateSlug(name),
        },
      });
    },

    deleteTag: async (_: any, { id }: { id: string }, context: Context) => {
      requireRole(context.user, ['ADMIN']);

      await context.prisma.tag.delete({
        where: { id },
      });

      return true;
    },

    // Comment mutations
    createComment: async (
      _: any,
      { input }: { input: { content: string; articleId: string } },
      context: Context
    ) => {
      requireAuth(context.user);

      const { content, articleId } = input;

      return await context.prisma.comment.create({
        data: {
          content,
          articleId,
          authorId: context.user!.userId,
        },
      });
    },

    deleteComment: async (_: any, { id }: { id: string }, context: Context) => {
      requireAuth(context.user);

      const comment = await context.prisma.comment.findUnique({
        where: { id },
      });

      if (!comment) {
        throw new Error('Comment not found');
      }

      // Only allow deletion if user is comment author or admin
      if (comment.authorId !== context.user!.userId && context.user!.role !== 'ADMIN') {
        throw new Error('Not authorized to delete this comment');
      }

      await context.prisma.comment.delete({
        where: { id },
      });

      return true;
    },
  },

  // Field resolvers
  User: {
    articles: async (parent: any, _: any, context: Context) => {
      return await context.prisma.article.findMany({
        where: { authorId: parent.id },
      });
    },
    comments: async (parent: any, _: any, context: Context) => {
      return await context.prisma.comment.findMany({
        where: { authorId: parent.id },
      });
    },
  },

  Article: {
    author: async (parent: any, _: any, context: Context) => {
      return await context.prisma.user.findUnique({
        where: { id: parent.authorId },
      });
    },
    category: async (parent: any, _: any, context: Context) => {
      if (!parent.categoryId) return null;
      return await context.prisma.category.findUnique({
        where: { id: parent.categoryId },
      });
    },
    tags: async (parent: any, _: any, context: Context) => {
      const article = await context.prisma.article.findUnique({
        where: { id: parent.id },
        include: { tags: true },
      });
      return article?.tags || [];
    },
    comments: async (parent: any, _: any, context: Context) => {
      return await context.prisma.comment.findMany({
        where: { articleId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Category: {
    articles: async (parent: any, _: any, context: Context) => {
      return await context.prisma.article.findMany({
        where: { categoryId: parent.id },
      });
    },
  },

  Tag: {
    articles: async (parent: any, _: any, context: Context) => {
      const tag = await context.prisma.tag.findUnique({
        where: { id: parent.id },
        include: { articles: true },
      });
      return tag?.articles || [];
    },
  },

  Comment: {
    article: async (parent: any, _: any, context: Context) => {
      return await context.prisma.article.findUnique({
        where: { id: parent.articleId },
      });
    },
    author: async (parent: any, _: any, context: Context) => {
      return await context.prisma.user.findUnique({
        where: { id: parent.authorId },
      });
    },
  },
};
export const typeDefs = `#graphql
  type Query {
    hello: String!
    me: User
    users: [User!]!
    user(id: ID!): User
    
    articles(limit: Int, offset: Int, isPublished: Boolean): [Article!]!
    article(id: ID, slug: String): Article
    
    categories: [Category!]!
    category(id: ID!): Category
    
    tags: [Tag!]!
    tag(id: ID!): Tag
  }

  type Mutation {
    # Auth mutations
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    
    # User mutations
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    
    # Article mutations
    createArticle(input: CreateArticleInput!): Article!
    updateArticle(id: ID!, input: UpdateArticleInput!): Article!
    deleteArticle(id: ID!): Boolean!
    publishArticle(id: ID!): Article!
    
    # Category mutations
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
    
    # Tag mutations
    createTag(input: CreateTagInput!): Tag!
    updateTag(id: ID!, input: UpdateTagInput!): Tag!
    deleteTag(id: ID!): Boolean!
    
    # Comment mutations
    createComment(input: CreateCommentInput!): Comment!
    deleteComment(id: ID!): Boolean!
  }

  type User {
    id: ID!
    email: String!
    username: String!
    name: String
    role: UserRole!
    createdAt: String!
    updatedAt: String!
    articles: [Article!]!
    comments: [Comment!]!
  }

  enum UserRole {
    ADMIN
    EDITOR
    VIEWER
  }

  type Article {
    id: ID!
    title: String!
    slug: String!
    content: String!
    excerpt: String
    isPublished: Boolean!
    createdAt: String!
    updatedAt: String!
    author: User!
    category: Category
    tags: [Tag!]!
    comments: [Comment!]!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    createdAt: String!
    updatedAt: String!
    articles: [Article!]!
  }

  type Tag {
    id: ID!
    name: String!
    slug: String!
    createdAt: String!
    updatedAt: String!
    articles: [Article!]!
  }

  type Comment {
    id: ID!
    content: String!
    createdAt: String!
    updatedAt: String!
    article: Article!
    author: User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    username: String!
    password: String!
    name: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    email: String
    username: String
    name: String
    role: UserRole
  }

  input CreateArticleInput {
    title: String!
    content: String!
    excerpt: String
    categoryId: ID
    tagIds: [ID!]
  }

  input UpdateArticleInput {
    title: String
    content: String
    excerpt: String
    categoryId: ID
    tagIds: [ID!]
  }

  input CreateCategoryInput {
    name: String!
    description: String
  }

  input UpdateCategoryInput {
    name: String
    description: String
  }

  input CreateTagInput {
    name: String!
  }

  input UpdateTagInput {
    name: String!
  }

  input CreateCommentInput {
    content: String!
    articleId: ID!
  }
`;
import { PrismaClient } from '@prisma/client';

export interface User {
  userId: string;
  email: string;
  role: string;
}

export interface Context {
  prisma: PrismaClient;
  user: User | null;
}
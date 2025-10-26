import { verifyToken } from '../utils/jwt';
import { User } from '../types/context';

export const getUserFromToken = (token: string | undefined): User | null => {
  if (!token) return null;

  // Remove 'Bearer ' prefix if present
  const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;

  const payload = verifyToken(actualToken);
  if (!payload) return null;

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };
};

export const requireAuth = (user: User | null) => {
  if (!user) {
    throw new Error('Authentication required');
  }
};

export const requireRole = (user: User | null, allowedRoles: string[]) => {
  requireAuth(user);
  if (user && !allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
};
import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabase.service.js';
import { AppError } from './errorHandler.js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  isDemo?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      userId?: string;
    }
  }
}

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  // If Supabase is NOT configured, handle carefully in isolated dev mode
  if (!supabaseService.isConfigured) {
    // Provide a stable demo identity for offline/local evaluation
    req.user = {
      id: 'demo-farmer-id',
      email: 'farmer@agrivision.ai',
      isDemo: true,
    };
    req.userId = 'demo-farmer-id';
    next();
    return;
  }

  // When Supabase is configured, enforce strict token verification
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError('Authentication required. Missing Bearer token.', 401));
    return;
  }

  const token = authHeader.split(' ')[1];
  const client = supabaseService.getClient();

  if (!client) {
    next(new AppError('Authentication service temporarily unavailable.', 503));
    return;
  }

  try {
    const { data: { user }, error } = await client.auth.getUser(token);

    if (error || !user) {
      next(new AppError('Invalid or expired authentication session.', 401));
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      isDemo: false,
    };
    req.userId = user.id;
    next();
  } catch (err: any) {
    next(new AppError('Failed to verify authentication token: ' + err.message, 401));
  }
};

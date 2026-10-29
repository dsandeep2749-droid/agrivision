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
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // Handle demo mode authentication (when Supabase is unconfigured or user authenticated with demo token)
  if (!supabaseService.isConfigured || token === 'demo-token' || (!token && !authHeader)) {
    req.user = {
      id: 'demo-farmer-id',
      email: 'farmer@agrivision.ai',
      isDemo: true,
    };
    req.userId = 'demo-farmer-id';
    next();
    return;
  }

  const client = supabaseService.getClient();

  if (!client) {
    // Isolated dev fallback
    req.user = {
      id: 'demo-farmer-id',
      email: 'farmer@agrivision.ai',
      isDemo: true,
    };
    req.userId = 'demo-farmer-id';
    next();
    return;
  }

  if (!token) {
    next(new AppError('Authentication required. Missing Bearer token.', 401));
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

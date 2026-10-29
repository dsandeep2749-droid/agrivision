import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabaseService } from '../services/supabase.service.js';
import { AppError } from '../middleware/errorHandler.js';

const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name cannot be empty').optional(),
  preferredLanguage: z.enum(['en', 'te']).optional(),
  defaultLocation: z.string().optional(),
  defaultLat: z.number().nullable().optional(),
  defaultLng: z.number().nullable().optional(),
});

export const getProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const profile = await supabaseService.getProfile(userId);

    res.json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const validated = updateProfileSchema.parse(req.body);

    const updated = await supabaseService.upsertProfile({
      id: userId,
      ...(validated.displayName !== undefined && { display_name: validated.displayName }),
      ...(validated.preferredLanguage !== undefined && { preferred_language: validated.preferredLanguage }),
      ...(validated.defaultLocation !== undefined && { default_location: validated.defaultLocation }),
      ...(validated.defaultLat !== undefined && { default_lat: validated.defaultLat }),
      ...(validated.defaultLng !== undefined && { default_lng: validated.defaultLng }),
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

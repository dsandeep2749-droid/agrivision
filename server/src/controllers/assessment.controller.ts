import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { geminiService } from '../services/gemini.service.js';
import { supabaseService } from '../services/supabase.service.js';
import { AppError } from '../middleware/errorHandler.js';

export const analyzeCropHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file;
    const body = req.body;

    const cropName = body.cropName?.trim() || 'General Crop';
    const cropVariety = body.cropVariety?.trim();
    const growthStage = body.growthStage?.trim();
    const farmLocation = body.farmLocation?.trim();
    const observedSymptoms = body.observedSymptoms?.trim();
    const language = (body.language === 'te' ? 'te' : 'en') as 'en' | 'te';

    let imageBuffer: Buffer | undefined;
    let imageMimeType: string | undefined;

    if (file) {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedMimes.includes(file.mimetype)) {
        throw new AppError('Invalid image format. Please upload JPEG, PNG, or WebP.', 400);
      }
      imageBuffer = file.buffer;
      imageMimeType = file.mimetype;
    }

    const analysis = await geminiService.analyzeCropSymptom({
      imageBuffer,
      imageMimeType,
      cropName,
      cropVariety,
      growthStage,
      farmLocation,
      observedSymptoms,
      language,
    });

    res.json({
      success: true,
      data: {
        analysis,
        inputMetadata: {
          cropName,
          cropVariety,
          growthStage,
          farmLocation,
          observedSymptoms,
          hasImage: !!file,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const saveAssessmentSchema = z.object({
  cropName: z.string().min(1, 'Crop name is required'),
  cropVariety: z.string().optional().nullable(),
  growthStage: z.string().optional().nullable(),
  farmLocation: z.string().optional().nullable(),
  observedSymptoms: z.string().optional().nullable(),
  assessmentSummary: z.string().min(1, 'Assessment summary is required'),
  possibleCondition: z.string().optional().nullable(),
  conditionCategory: z.string().optional().nullable(),
  uncertaintyNotes: z.string().optional().nullable(),
  visibleSymptoms: z.array(z.string()).optional(),
  alternativeExplanations: z.array(z.string()).optional(),
  contributingFactors: z.array(z.string()).optional(),
  suggestedNextSteps: z.array(z.string()).optional(),
  preventivePractices: z.array(z.string()).optional(),
  expertReviewTriggers: z.array(z.string()).optional(),
  modelIdentifier: z.string().optional().nullable(),
  needsFollowup: z.boolean().optional(),
  imagePath: z.string().optional().nullable(),
});

export const saveAssessmentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const validated = saveAssessmentSchema.parse(req.body);

    const saved = await supabaseService.saveAssessment({
      user_id: userId,
      crop_name: validated.cropName,
      crop_variety: validated.cropVariety || null,
      growth_stage: validated.growthStage || null,
      farm_location: validated.farmLocation || null,
      image_path: validated.imagePath || null,
      observed_symptoms: validated.observedSymptoms || null,
      assessment_summary: validated.assessmentSummary,
      possible_condition: validated.possibleCondition || null,
      condition_category: validated.conditionCategory || null,
      uncertainty_notes: validated.uncertaintyNotes || null,
      visible_symptoms: validated.visibleSymptoms || [],
      alternative_explanations: validated.alternativeExplanations || [],
      contributing_factors: validated.contributingFactors || [],
      suggested_next_steps: validated.suggestedNextSteps || [],
      preventive_practices: validated.preventivePractices || [],
      expert_review_triggers: validated.expertReviewTriggers || [],
      model_identifier: validated.modelIdentifier || null,
      needs_followup: validated.needsFollowup ?? false,
    });

    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (err) {
    next(err);
  }
};

export const listAssessmentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const crop = typeof req.query.crop === 'string' ? req.query.crop : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await supabaseService.getAssessments(userId, {
      crop,
      search,
      limit,
      offset,
    });

    res.json({
      success: true,
      data: result.assessments,
      meta: {
        total: result.total,
        limit,
        offset,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAssessmentByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await supabaseService.getAssessmentById(id, userId);

    if (!item) {
      throw new AppError('Assessment record not found', 404);
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAssessmentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await supabaseService.deleteAssessment(id, userId);

    if (!deleted) {
      throw new AppError('Assessment not found or not permitted to delete', 404);
    }

    res.json({
      success: true,
      message: 'Assessment deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

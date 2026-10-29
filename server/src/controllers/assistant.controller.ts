import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { geminiService } from '../services/gemini.service.js';

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1, 'Message content cannot be empty'),
    })
  ).min(1, 'At least one message is required'),
  language: z.enum(['en', 'te']).optional().default('en'),
  farmLocation: z.string().optional(),
  currentCropContext: z.string().optional(),
});

export const chatHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = chatSchema.parse(req.body);

    const reply = await geminiService.chatAssistant(validated.messages, {
      language: validated.language,
      farmLocation: validated.farmLocation,
      currentCropContext: validated.currentCropContext,
    });

    res.json({
      success: true,
      data: {
        message: reply,
        language: validated.language,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
};


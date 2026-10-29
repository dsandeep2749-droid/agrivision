import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number = 400, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Centralized logging (preventing secrets or sensitive image buffers from dumping)
  const isDev = process.env.NODE_ENV !== 'production';

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
    });
    return;
  }

  if (err?.name === 'MulterError') {
    res.status(400).json({
      success: false,
      error: {
        message: `File upload error: ${err.message}`,
      },
    });
    return;
  }

  console.error('[AgriVision Error]', err.message || err);

  res.status(500).json({
    success: false,
    error: {
      message: isDev ? err.message || 'Internal server error' : 'An unexpected error occurred. Please try again.',
      ...(isDev && err.stack ? { stack: err.stack } : {}),
    },
  });
};


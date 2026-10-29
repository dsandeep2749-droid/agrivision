import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import {
  analyzeCropHandler,
  saveAssessmentHandler,
  listAssessmentsHandler,
  getAssessmentByIdHandler,
  deleteAssessmentHandler,
} from '../controllers/assessment.controller.js';
import { chatHandler } from '../controllers/assistant.controller.js';
import { getWeatherHandler, searchLocationHandler } from '../controllers/weather.controller.js';
import { getProfileHandler, updateProfileHandler } from '../controllers/profile.controller.js';
import { geminiService } from '../services/gemini.service.js';
import { supabaseService } from '../services/supabase.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const apiRouter = Router();

// Health Check & System Status
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiProvider: {
      model: geminiService.modelName,
      isConfigured: geminiService.isConfigured,
    },
    databaseProvider: {
      type: 'Supabase PostgreSQL',
      isConfigured: supabaseService.isConfigured,
    },
    weatherProvider: {
      type: 'Open-Meteo',
      status: 'active',
    },
  });
});

// Profile endpoints (Protected)
apiRouter.get('/profile', requireAuth, getProfileHandler);
apiRouter.put('/profile', requireAuth, updateProfileHandler);

// Crop Assessment endpoints
// Analysis can be initiated with an uploaded image
apiRouter.post('/crop-assessments/analyze', upload.single('image'), analyzeCropHandler);

// Crop Assessment history endpoints (Protected)
apiRouter.post('/crop-assessments', requireAuth, saveAssessmentHandler);
apiRouter.get('/crop-assessments', requireAuth, listAssessmentsHandler);
apiRouter.get('/crop-assessments/:id', requireAuth, getAssessmentByIdHandler);
apiRouter.delete('/crop-assessments/:id', requireAuth, deleteAssessmentHandler);

// AI Farming Assistant endpoint
apiRouter.post('/assistant/chat', chatHandler);

// Weather & Agro-Insights endpoints
apiRouter.get('/weather', getWeatherHandler);
apiRouter.get('/weather/search', searchLocationHandler);

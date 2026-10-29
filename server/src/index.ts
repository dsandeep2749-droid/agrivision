import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';
import { apiRouter } from './routes/api.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Logging basic request info in dev
app.use((req, _res, next) => {
  if (env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes mounted first
app.use('/api', apiRouter);

// Combined Frontend Serving: Locate client/dist reliably
const candidatePaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
];

const activeDist = candidatePaths.find((p) => fs.existsSync(path.join(p, 'index.html')));

if (activeDist) {
  console.log(`📦 Serving compiled frontend from: ${activeDist}`);
  app.use(express.static(activeDist));

  // SPA fallback for frontend client routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(activeDist, 'index.html'));
  });
} else {
  console.warn('⚠️ client/dist not found. Frontend static serving is inactive. Run "npm run build" to compile frontend.');
}

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server
const server = app.listen(env.PORT, () => {
  console.log(`🚀 AgriVision AI Server is running on http://localhost:${env.PORT}`);
  console.log(`🌾 AI Model: ${env.GEMINI_MODEL}`);
  console.log(`🌦️ Weather Service: Open-Meteo Integration Active`);
  if (activeDist) {
    console.log(`🌱 Frontend + Backend Unified at: http://localhost:${env.PORT}`);
  }
});

export default app;

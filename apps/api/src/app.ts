import cors from 'cors';
import express from 'express';
import linesRouter from './routes/lines.js';
import { env } from './config/env.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/lines', linesRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use(
    (error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      res.status(500).json({
        message: 'Unhandled server error',
        detail: error.message,
      });
    },
  );

  return app;
}

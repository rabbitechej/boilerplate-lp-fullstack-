import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { getCorsOrigins, getTrustProxy } from './config/env';
import { isDatabaseReady } from './config/db';
import { rejectUnsafeMongoKeys, securityHeaders } from './middlewares/security';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import uploadRoutes from './routes/uploadRoutes';
import auditRoutes from './routes/auditRoutes';
import contactRoutes from './routes/contactRoutes';

type AppOptions = {
  corsOrigins?: string[];
};

export function createApp(options: AppOptions = {}) {
  const app = express();
  const allowedOrigins = options.corsOrigins ?? getCorsOrigins();

  app.disable('x-powered-by');
  app.set('trust proxy', getTrustProxy());
  app.use(securityHeaders);
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origem nao autorizada pelo CORS'));
      },
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(rejectUnsafeMongoKeys);

  const healthHandler: express.RequestHandler = (_req, res) => {
    res.json({ data: { message: 'API do boilerplate' } });
  };
  const livenessHandler: express.RequestHandler = (_req, res) => {
    res.json({ data: { status: 'ok' } });
  };
  const readinessHandler: express.RequestHandler = (_req, res) => {
    const ready = isDatabaseReady();
    res.status(ready ? 200 : 503).json({ data: { status: ready ? 'ready' : 'not_ready' } });
  };

  app.get('/', healthHandler);
  app.get('/health', livenessHandler);
  app.get('/ready', readinessHandler);

  const apiV1 = express.Router();
  apiV1.get('/', healthHandler);
  apiV1.get('/health', livenessHandler);
  apiV1.get('/ready', readinessHandler);
  apiV1.use(authRoutes);
  apiV1.use(postRoutes);
  apiV1.use(uploadRoutes);
  apiV1.use(auditRoutes);
  apiV1.use(contactRoutes);
  app.use('/api/v1', apiV1);

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Rota nao encontrada.' } });
  });

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    const isCorsError = error instanceof Error && error.message.includes('CORS');
    if (!isCorsError) console.error('Erro nao tratado na requisicao:', error);
    res.status(isCorsError ? 403 : 500).json({
      error: {
        code: isCorsError ? 'CORS_FORBIDDEN' : 'INTERNAL_ERROR',
        message: isCorsError ? 'Origem nao autorizada.' : 'Erro interno no servidor.',
      },
    });
  };
  app.use(errorHandler);

  return app;
}

import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import { env } from './config/env';
import { connectRedis } from './config/redis';
import { logger } from './common/logger';
import { errorHandler } from './common/middleware/errorHandler';

import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { campaignsRouter } from './modules/campaigns/campaigns.router';
import { postsRouter } from './modules/posts/posts.router';
import { sessionsRouter } from './modules/sessions/sessions.router';
import { brandsRouter } from './modules/brands/brands.router';
import { adminRouter } from './modules/admin/admin.router';

import {
  startSessionScheduler,
  startVerificationWorker,
  startCreditExpiryWorker,
} from './modules/posts/verification.worker';

const app = express();

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    // Token-based API (Authorization header, no cookies) → safe to reflect any origin.
    // Allows the mobile app (no origin), the Vercel web dashboard, and local dev.
    origin: true,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'طلبات كثيرة جداً، يرجى المحاولة لاحقاً' },
});
app.use('/api', limiter);

// Stricter rate limit for OTP
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'محاولات كثيرة جداً لإرسال OTP' },
});
app.use('/api/auth/otp', otpLimiter);

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/admin', adminRouter);

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    await connectRedis();

    // Start background workers
    startSessionScheduler();
    startVerificationWorker();
    startCreditExpiryWorker();

    const PORT = parseInt(env.PORT);
    app.listen(PORT, () => {
      logger.info(`🚀 WinWin API running on port ${PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();

export default app;

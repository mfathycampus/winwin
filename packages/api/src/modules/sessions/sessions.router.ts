import { Router } from 'express';
import { authenticate } from '../../common/guards/auth.guard';
import { createSessionSchema } from '@winwin/shared';
import * as sessionsService from './sessions.service';

const router = Router();
router.use(authenticate);

router.get('/active', async (_req, res) => {
  const sessions = await sessionsService.getActiveSessions();
  res.json({ success: true, data: sessions });
});

router.get('/upcoming', async (req, res) => {
  const brandId = req.query.brandId as string | undefined;
  const sessions = await sessionsService.getUpcomingSessions(brandId);
  res.json({ success: true, data: sessions });
});

router.post('/', async (req, res) => {
  const data = createSessionSchema.parse(req.body);
  const session = await sessionsService.createSession(req.body.brandId, data);
  res.status(201).json({ success: true, data: session });
});

router.get('/:sessionId/stats', async (req, res) => {
  const stats = await sessionsService.getSessionStats(req.params.sessionId);
  res.json({ success: true, data: stats });
});

export { router as sessionsRouter };

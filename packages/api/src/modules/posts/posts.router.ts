import { Router } from 'express';
import { authenticate } from '../../common/guards/auth.guard';
import { submitPostSchema } from '@winwin/shared';
import * as postsService from './posts.service';

const router = Router();
router.use(authenticate);

router.post('/', async (req, res) => {
  const data = submitPostSchema.parse(req.body);
  const post = await postsService.submitPost(req.user!.sub, data);
  res.status(201).json({ success: true, data: post });
});

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await postsService.getUserPosts(req.user!.sub, page, limit);
  res.json({ success: true, data: result });
});

export { router as postsRouter };

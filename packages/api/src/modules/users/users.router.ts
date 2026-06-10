import { Router } from 'express';
import { updateProfileSchema } from '@winwin/shared';
import { authenticate } from '../../common/guards/auth.guard';
import * as usersService from './users.service';

const router = Router();
router.use(authenticate);

router.get('/me', async (req, res) => {
  const user = await usersService.getProfile(req.user!.sub);
  res.json({ success: true, data: user });
});

router.patch('/me', async (req, res) => {
  const data = updateProfileSchema.parse(req.body);
  const user = await usersService.updateProfile(req.user!.sub, data);
  res.json({ success: true, data: user });
});

router.post('/me/social-accounts', async (req, res) => {
  const account = await usersService.connectSocialAccount(req.user!.sub, req.body);
  res.json({ success: true, data: account });
});

router.delete('/me/social-accounts/:platform', async (req, res) => {
  await usersService.disconnectSocialAccount(req.user!.sub, req.params.platform.toUpperCase());
  res.json({ success: true, message: 'تم إلغاء ربط الحساب' });
});

router.get('/me/wallet', async (req, res) => {
  const wallet = await usersService.getWallet(req.user!.sub);
  res.json({ success: true, data: wallet });
});

router.get('/me/wallet/transactions', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await usersService.getCreditTransactions(req.user!.sub, page, limit);
  res.json({ success: true, data: result });
});

export { router as usersRouter };

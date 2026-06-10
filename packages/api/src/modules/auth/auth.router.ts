import { Router } from 'express';
import { sendOtpSchema, verifyOtpSchema } from '@winwin/shared';
import * as authService from './auth.service';
import { authenticate } from '../../common/guards/auth.guard';

const router = Router();

router.post('/otp/send', async (req, res) => {
  const { phone } = sendOtpSchema.parse(req.body);
  const result = await authService.sendOtp(phone);
  res.json({ success: true, ...result });
});

router.post('/otp/verify', async (req, res) => {
  const { phone, code } = verifyOtpSchema.parse(req.body);
  const result = await authService.verifyOtp(phone, code);
  res.json({ success: true, data: result });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'refreshToken مطلوب' });
  }
  const tokens = await authService.refreshTokens(refreshToken);
  res.json({ success: true, data: tokens });
});

router.post('/logout', authenticate, async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) await authService.logout(refreshToken);
  res.json({ success: true, message: 'تم تسجيل الخروج' });
});

export { router as authRouter };

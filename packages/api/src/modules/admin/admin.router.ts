import { Router } from 'express';
import { prisma } from '@winwin/db';
import { authenticate, requireRole } from '../../common/guards/auth.guard';
import { logger } from '../../common/logger';

const router = Router();
router.use(authenticate);

// DANGER: wipes ALL data for a clean production start.
// Guarded by: admin role + an explicit confirmation phrase in the body.
// Admin accounts are recreated automatically on next login (role comes from ADMIN_PHONES).
router.post('/reset', requireRole('admin'), async (req, res) => {
  if (req.body?.confirm !== 'RESET-ALL-DATA') {
    return res.status(400).json({
      success: false,
      message: 'التأكيد مطلوب: أرسل { "confirm": "RESET-ALL-DATA" }',
    });
  }

  // Delete children first to respect foreign keys.
  await prisma.commission.deleteMany();
  await prisma.sessionParticipant.deleteMany();
  await prisma.userPost.deleteMany();
  await prisma.adContent.deleteMany();
  await prisma.primeSession.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.brandManager.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.company.deleteMany();
  await prisma.userCreditTransaction.deleteMany();
  await prisma.userCredit.deleteMany();
  await prisma.userSocialAccount.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.user.deleteMany();

  logger.warn('⚠️ DATABASE RESET performed by admin');
  res.json({ success: true, message: 'تم مسح جميع البيانات. النظام جاهز للإنتاج.' });
});

export { router as adminRouter };

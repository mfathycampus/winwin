import { z } from 'zod';

export const saudiPhoneSchema = z
  .string()
  .regex(/^\+9665[0-9]{8}$/, 'رقم الجوال يجب أن يكون سعودياً صحيحاً (+9665XXXXXXXX)');

export const sendOtpSchema = z.object({
  phone: saudiPhoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: saudiPhoneSchema,
  code: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url().optional(),
});

export const createCampaignSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  contentType: z.enum(['IMAGE', 'VIDEO', 'BOTH']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  maxCreditPct: z.number().min(0.01).max(1),
  totalBudget: z.number().min(500),
  allowedPlatforms: z.array(z.enum(['SNAPCHAT', 'TIKTOK', 'INSTAGRAM', 'X'])).min(1),
});

export const createSessionSchema = z.object({
  campaignId: z.string().cuid(),
  timeSlot: z.enum(['EVENING', 'LUNCH', 'MORNING', 'RAMADAN', 'CUSTOM']),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  durationMinutes: z.number().min(15).max(240),
  maxSeats: z.number().min(10).max(10000),
  bonusBudget: z.number().min(100),
  bonusPerUser: z.number().min(1),
});

export const submitPostSchema = z.object({
  campaignId: z.string().cuid(),
  platform: z.enum(['SNAPCHAT', 'TIKTOK', 'INSTAGRAM', 'X']),
  postUrl: z.string().url().optional(),
  sessionId: z.string().cuid().optional(),
});

export const redeemCreditSchema = z.object({
  amount: z.number().min(1),
  brandId: z.string().cuid(),
  method: z.enum(['DISCOUNT_CODE', 'QR', 'CASHBACK']),
});

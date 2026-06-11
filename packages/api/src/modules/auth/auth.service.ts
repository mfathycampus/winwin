import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { prisma } from '@winwin/db';
import { env } from '../../config/env';
import { redis } from '../../config/redis';
import { AppError } from '../../common/middleware/errorHandler';
import { logger } from '../../common/logger';
import type { AuthTokens, JwtPayload } from '@winwin/shared';

const OTP_TTL = parseInt(env.OTP_EXPIRY_MINUTES) * 60;

// Normalize a phone to a canonical form: keep only digits and a leading +.
// Strips spaces, dashes, and invisible/RTL characters that sneak in from Arabic keyboards.
export function normalizePhone(phone: string): string {
  return (phone || '').replace(/[^\d+]/g, '');
}

// ─── OTP ──────────────────────────────────────────────────────────────────────

function generateOtp(): string {
  if (env.NODE_ENV === 'development') return '123456'; // fixed in dev
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpViaSms(phone: string, code: string) {
  if (env.SMS_PROVIDER === 'mock') {
    logger.info(`[MOCK SMS] ${phone} → OTP: ${code}`);
    return;
  }
  // TODO: integrate Unifonic or Twilio
}

export async function sendOtp(phoneInput: string) {
  const phone = normalizePhone(phoneInput);
  const code = generateOtp();

  await redis.setex(`otp:${phone}`, OTP_TTL, code);

  // Store in DB for audit
  await prisma.otp.create({
    data: {
      phone,
      code: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + OTP_TTL * 1000),
    },
  });

  await sendOtpViaSms(phone, code);

  return { message: 'تم إرسال رمز التحقق' };
}

// Determine a user's role: admin (env allowlist) > brand_manager (has a brand) > user
async function resolveRole(userId: string, phone: string): Promise<'user' | 'brand_manager' | 'admin'> {
  const adminPhones = env.ADMIN_PHONES.split(',').map((p) => normalizePhone(p)).filter(Boolean);
  if (adminPhones.includes(normalizePhone(phone))) return 'admin';
  const managed = await prisma.brandManager.count({ where: { userId } });
  return managed > 0 ? 'brand_manager' : 'user';
}

export async function verifyOtp(phoneInput: string, code: string): Promise<AuthTokens & { isNew: boolean; role: string }> {
  const phone = normalizePhone(phoneInput);
  const stored = await redis.get(`otp:${phone}`);
  if (!stored || stored !== code) {
    throw new AppError('رمز التحقق غير صحيح أو منتهي الصلاحية', 400, 'INVALID_OTP');
  }

  await redis.del(`otp:${phone}`);

  let user = await prisma.user.findUnique({ where: { phone } });
  const isNew = !user;

  if (!user) {
    user = await prisma.user.create({
      data: { phone, name: '' },
    });
    await prisma.userCredit.create({ data: { userId: user.id } });
  }

  if (!user.isActive) throw new AppError('الحساب موقوف', 403, 'ACCOUNT_SUSPENDED');

  const role = await resolveRole(user.id, user.phone);
  const tokens = await generateTokens(user.id, user.phone, role);
  return { ...tokens, isNew, role };
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

async function generateTokens(
  userId: string,
  phone: string,
  role: 'user' | 'brand_manager' | 'admin' = 'user',
): Promise<AuthTokens> {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: userId,
    phone,
    role,
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });

  const refreshToken = uuid();
  await prisma.refreshToken.create({
    data: {
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return { accessToken, refreshToken, expiresIn: 15 * 60 };
}

export async function refreshTokens(token: string): Promise<AuthTokens> {
  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('الجلسة منتهية، يرجى تسجيل الدخول مجدداً', 401, 'REFRESH_EXPIRED');
  }

  // Rotate refresh token
  await prisma.refreshToken.delete({ where: { token } });

  const role = await resolveRole(stored.userId, stored.user.phone);
  return generateTokens(stored.userId, stored.user.phone, role);
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  OTP_EXPIRY_MINUTES: z.string().default('5'),
  OTP_LENGTH: z.string().default('6'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().default('me-south-1'),
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),
  MOYASAR_SECRET_KEY: z.string().optional(),
  MOYASAR_PUBLISHABLE_KEY: z.string().optional(),
  SNAPCHAT_CLIENT_ID: z.string().optional(),
  SNAPCHAT_CLIENT_SECRET: z.string().optional(),
  TIKTOK_CLIENT_ID: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  INSTAGRAM_CLIENT_ID: z.string().optional(),
  INSTAGRAM_CLIENT_SECRET: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  ADMIN_URL: z.string().default('http://localhost:3001'),
  // Comma-separated phone numbers that get the platform ADMIN role on login.
  ADMIN_PHONES: z.string().default(''),
  SMS_PROVIDER: z.enum(['twilio', 'unifonic', 'mock']).default('mock'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

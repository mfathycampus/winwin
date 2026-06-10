export const PLATFORM_MULTIPLIERS = {
  snap: 2.0,
  tiktok: 1.8,
  insta: 1.5,
  x: 1.0,
} as const;

export const TIME_MULTIPLIERS = {
  EVENING: 2.5,
  LUNCH: 1.8,
  MORNING: 1.3,
  RAMADAN: 3.0,
  CUSTOM: 1.0,
} as const;

export const BASE_COMMISSION_RATE = 0.05;
export const SESSION_COMMISSION_RATE = 0.15;

export const CREDIT_EXPIRY_DAYS = 90;
export const POST_VERIFICATION_WINDOW_MINUTES = 30;
export const MAX_POSTS_PER_USER_PER_DAY = 5;
export const MIN_FOLLOWERS = 100;
export const MIN_ACCOUNT_AGE_DAYS = 30;
export const SAME_CAMPAIGN_COOLDOWN_DAYS = 7;
export const FRAUD_DELETE_RATE_THRESHOLD = 0.3;
export const FRAUD_SAME_IP_ACCOUNTS = 3;

export const SUBSCRIPTION_PLANS = {
  STARTER: {
    price: 199,
    maxCampaigns: 3,
    platforms: 1,
    primeSessionsPerMonth: 0,
    firstFreePostsCount: 50,
    commissionRate: 0.1,
  },
  GROWTH: {
    price: 799,
    maxCampaigns: 10,
    platforms: -1, // unlimited
    primeSessionsPerMonth: 2,
    firstFreePostsCount: 0,
    commissionRate: BASE_COMMISSION_RATE,
  },
  PRO: {
    price: 1999,
    maxCampaigns: -1,
    platforms: -1,
    primeSessionsPerMonth: 8,
    firstFreePostsCount: 0,
    commissionRate: BASE_COMMISSION_RATE,
  },
  ENTERPRISE: {
    price: 0, // custom
    maxCampaigns: -1,
    platforms: -1,
    primeSessionsPerMonth: -1,
    firstFreePostsCount: 0,
    commissionRate: BASE_COMMISSION_RATE,
  },
} as const;

export const SAR_CURRENCY = 'SAR';
export const VAT_RATE = 0.15; // Saudi VAT 15%

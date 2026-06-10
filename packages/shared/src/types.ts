export type SocialPlatformKey = 'snap' | 'tiktok' | 'insta' | 'x';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  phone: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export type UserRole = 'user' | 'brand_manager' | 'admin';

export interface CreditCalculationInput {
  followers: number;
  engagementRate: number;
  maxCredit: number;
  platformKey: SocialPlatformKey;
  primeSessionMultiplier?: number;
}

export interface CreditBreakdown {
  followerScore: number;
  engagementScore: number;
  ratio: number;
  platformMultiplier: number;
  baseCredit: number;
  primeBonus: number;
  total: number;
}

export interface CampaignCard {
  id: string;
  title: string;
  brandName: string;
  brandLogo?: string;
  brandColor?: string;
  mediaUrl: string;
  estimatedCredit: number;
  platform: string[];
  activePrimeSession?: {
    id: string;
    endsAt: string;
    bonusPerUser: number;
  };
}

export interface WalletSummary {
  balance: number;
  lifetimeEarned: number;
  pendingAmount: number;
  expiringIn7Days: number;
}

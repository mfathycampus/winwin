import { PLATFORM_MULTIPLIERS, TIME_MULTIPLIERS } from './constants';
import type { CreditCalculationInput, CreditBreakdown, SocialPlatformKey } from './types';

export function getFollowerScore(followers: number): number {
  if (followers < 1000) return 5;
  if (followers < 10000) return 15;
  if (followers < 50000) return 30;
  if (followers < 100000) return 50;
  if (followers < 250000) return 70;
  return 90;
}

export function calculateCredit(input: CreditCalculationInput): CreditBreakdown {
  const { followers, engagementRate, maxCredit, platformKey, primeSessionMultiplier = 1 } = input;

  const followerScore = getFollowerScore(followers);
  const engagementScore = Math.min(100, engagementRate * 5);
  const ratio = Math.min(1, (followerScore * 0.5 + engagementScore * 0.5) / 100);

  const platformMult = PLATFORM_MULTIPLIERS[platformKey] ?? 1.0;
  const baseCredit = Math.round(maxCredit * ratio * platformMult * 10) / 10;
  const primeBonus = Math.round(baseCredit * (primeSessionMultiplier - 1) * 10) / 10;

  return {
    followerScore,
    engagementScore,
    ratio,
    platformMultiplier: platformMult,
    baseCredit,
    primeBonus,
    total: Math.round((baseCredit + primeBonus) * 10) / 10,
  };
}

export function getTimeMultiplier(timeSlot: keyof typeof TIME_MULTIPLIERS): number {
  return TIME_MULTIPLIERS[timeSlot] ?? 1.0;
}

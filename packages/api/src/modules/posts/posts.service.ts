import { prisma } from '@winwin/db';
import { calculateCredit } from '@winwin/shared';
import {
  BASE_COMMISSION_RATE,
  MAX_POSTS_PER_USER_PER_DAY,
  MIN_FOLLOWERS,
  SAME_CAMPAIGN_COOLDOWN_DAYS,
  POST_VERIFICATION_WINDOW_MINUTES,
  CREDIT_EXPIRY_DAYS,
} from '@winwin/shared';
import { AppError } from '../../common/middleware/errorHandler';
import { redis } from '../../config/redis';
import { logger } from '../../common/logger';

const PLATFORM_KEY_MAP: Record<string, 'snap' | 'tiktok' | 'insta' | 'x'> = {
  SNAPCHAT: 'snap',
  TIKTOK: 'tiktok',
  INSTAGRAM: 'insta',
  X: 'x',
};

export async function submitPost(userId: string, data: {
  campaignId: string;
  platform: 'SNAPCHAT' | 'TIKTOK' | 'INSTAGRAM' | 'X';
  postUrl?: string;
  sessionId?: string;
}) {
  // Fraud checks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [dailyPostCount, cooldownPost, socialAccount, campaign] = await Promise.all([
    prisma.userPost.count({
      where: { userId, postedAt: { gte: today } },
    }),
    prisma.userPost.findFirst({
      where: {
        userId,
        campaignId: data.campaignId,
        postedAt: {
          gte: new Date(Date.now() - SAME_CAMPAIGN_COOLDOWN_DAYS * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.userSocialAccount.findUnique({
      where: { userId_platform: { userId, platform: data.platform } },
    }),
    prisma.campaign.findUnique({ where: { id: data.campaignId } }),
  ]);

  if (dailyPostCount >= MAX_POSTS_PER_USER_PER_DAY) {
    throw new AppError('لقد تجاوزت الحد الأقصى للمشاركات اليومية (5 مشاركات)', 429, 'DAILY_LIMIT');
  }
  if (cooldownPost) {
    throw new AppError(
      `لا يمكنك المشاركة في نفس الحملة قبل مرور ${SAME_CAMPAIGN_COOLDOWN_DAYS} أيام`,
      400,
      'CAMPAIGN_COOLDOWN',
    );
  }
  if (!socialAccount || !socialAccount.isActive) {
    throw new AppError('يرجى ربط حساب ' + data.platform + ' أولاً', 400, 'NO_SOCIAL_ACCOUNT');
  }
  if (socialAccount.followersCount < MIN_FOLLOWERS) {
    throw new AppError(`يجب أن يكون لديك ${MIN_FOLLOWERS} متابع على الأقل`, 400, 'MIN_FOLLOWERS');
  }
  if (!campaign || campaign.status !== 'ACTIVE') {
    throw new AppError('الحملة غير متاحة', 400, 'CAMPAIGN_INACTIVE');
  }

  // Calculate credit
  const platformKey = PLATFORM_KEY_MAP[data.platform] ?? 'x';
  let sessionBonus = 0;
  let session = null;

  if (data.sessionId) {
    session = await prisma.primeSession.findUnique({ where: { id: data.sessionId } });
    if (session?.status === 'ACTIVE' && session.seatsTaken < session.maxSeats) {
      sessionBonus = session.bonusPerUser;
    }
  }

  const breakdown = calculateCredit({
    followers: socialAccount.followersCount,
    engagementRate: socialAccount.engagementRate,
    maxCredit: campaign.totalBudget * campaign.maxCreditPct,
    platformKey,
  });

  const post = await prisma.userPost.create({
    data: {
      userId,
      campaignId: data.campaignId,
      platform: data.platform,
      postUrl: data.postUrl,
      verificationStatus: 'PENDING',
      creditAmount: breakdown.total,
      bonusAmount: sessionBonus,
    },
  });

  // Handle session participation
  if (session && data.sessionId) {
    await prisma.sessionParticipant.create({
      data: {
        sessionId: data.sessionId,
        userId,
        postId: post.id,
        bonusEarned: sessionBonus,
      },
    });
    await prisma.primeSession.update({
      where: { id: data.sessionId },
      data: { seatsTaken: { increment: 1 } },
    });
  }

  // Schedule verification after 30-min window
  await redis.setex(
    `verify:${post.id}`,
    POST_VERIFICATION_WINDOW_MINUTES * 60,
    JSON.stringify({ userId, creditAmount: breakdown.total, bonusAmount: sessionBonus }),
  );

  // Trigger background verification job
  await redis.lpush('verification_queue', post.id);

  logger.info(`Post submitted: ${post.id} by user ${userId}`);
  return post;
}

export async function releaseCredit(postId: string) {
  const post = await prisma.userPost.findUnique({ where: { id: postId } });
  if (!post || post.verificationStatus !== 'PENDING') return;

  const totalCredit = post.creditAmount + post.bonusAmount;
  const commission = Math.round(totalCredit * BASE_COMMISSION_RATE * 100) / 100;
  const userCredit = Math.round((totalCredit - commission) * 100) / 100;

  const expiresAt = new Date(Date.now() + CREDIT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.userPost.update({
      where: { id: postId },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        creditReleasedAt: new Date(),
      },
    }),
    prisma.userCredit.update({
      where: { userId: post.userId },
      data: {
        balance: { increment: userCredit },
        lifetimeEarned: { increment: userCredit },
      },
    }),
    prisma.userCreditTransaction.create({
      data: {
        userId: post.userId,
        amount: userCredit,
        type: 'EARN',
        referenceId: postId,
        description: 'مكافأة مشاركة المحتوى',
        expiresAt,
      },
    }),
    prisma.commission.create({
      data: {
        postId,
        amount: commission,
        type: 'CREDIT_COMMISSION',
      },
    }),
    prisma.campaign.update({
      where: { id: post.campaignId },
      data: { spentBudget: { increment: totalCredit } },
    }),
  ]);

  logger.info(`Credit released: ${userCredit} SAR to user ${post.userId} for post ${postId}`);
}

export async function getUserPosts(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.userPost.findMany({
      where: { userId },
      include: {
        campaign: {
          include: { brand: { select: { name: true, logoUrl: true, color: true } } },
        },
      },
      orderBy: { postedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.userPost.count({ where: { userId } }),
  ]);
  return { items, total, page, limit, hasMore: skip + limit < total };
}

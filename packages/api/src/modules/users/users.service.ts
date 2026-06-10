import { prisma } from '@winwin/db';
import { AppError } from '../../common/middleware/errorHandler';
import { deleteCache } from '../../config/redis';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      socialAccounts: { where: { isActive: true } },
      credits: true,
    },
  });
  if (!user) throw new AppError('المستخدم غير موجود', 404);
  return user;
}

export async function updateProfile(userId: string, data: {
  name?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  await deleteCache(`user:${userId}`);
  return user;
}

export async function connectSocialAccount(userId: string, data: {
  platform: 'SNAPCHAT' | 'TIKTOK' | 'INSTAGRAM' | 'X';
  platformUserId: string;
  username: string;
  followersCount: number;
  engagementRate: number;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}) {
  const account = await prisma.userSocialAccount.upsert({
    where: { userId_platform: { userId, platform: data.platform } },
    update: {
      ...data,
      verifiedAt: new Date(),
      isActive: true,
    },
    create: {
      userId,
      ...data,
      verifiedAt: new Date(),
    },
  });
  return account;
}

export async function disconnectSocialAccount(userId: string, platform: string) {
  await prisma.userSocialAccount.updateMany({
    where: { userId, platform: platform as any },
    data: { isActive: false },
  });
}

export async function getWallet(userId: string) {
  const [credits, pendingPosts] = await Promise.all([
    prisma.userCredit.findUnique({ where: { userId } }),
    prisma.userPost.aggregate({
      where: { userId, verificationStatus: 'PENDING' },
      _sum: { creditAmount: true, bonusAmount: true },
    }),
  ]);

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const expiringTxns = await prisma.userCreditTransaction.aggregate({
    where: {
      userId,
      type: 'EARN',
      expiresAt: { gte: now, lte: in7Days },
    },
    _sum: { amount: true },
  });

  return {
    balance: credits?.balance ?? 0,
    lifetimeEarned: credits?.lifetimeEarned ?? 0,
    pendingAmount:
      (pendingPosts._sum.creditAmount ?? 0) + (pendingPosts._sum.bonusAmount ?? 0),
    expiringIn7Days: expiringTxns._sum.amount ?? 0,
  };
}

export async function getCreditTransactions(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.userCreditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.userCreditTransaction.count({ where: { userId } }),
  ]);
  return { items, total, page, limit, hasMore: skip + limit < total };
}

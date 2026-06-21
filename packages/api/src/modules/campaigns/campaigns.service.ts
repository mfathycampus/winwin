import { prisma } from '@winwin/db';
import { calculateCredit } from '@winwin/shared';
import { AppError } from '../../common/middleware/errorHandler';
import { getCache, setCache } from '../../config/redis';

const PLATFORM_KEY_MAP: Record<string, 'snap' | 'tiktok' | 'insta' | 'x'> = {
  SNAPCHAT: 'snap',
  TIKTOK: 'tiktok',
  INSTAGRAM: 'insta',
  X: 'x',
};

export async function getHomeFeed(
  userId: string,
  page = 1,
  limit = 20,
  filters?: { platform?: string; sector?: string },
) {
  const cacheKey = `feed:${userId}:${page}:${JSON.stringify(filters)}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { socialAccounts: { where: { isActive: true } } },
  });
  if (!user) throw new AppError('المستخدم غير موجود', 404);

  const skip = (page - 1) * limit;
  const now = new Date();

  const where: any = {
    status: 'ACTIVE',
    startDate: { lte: now },
    endDate: { gte: now },
    spentBudget: { lt: prisma.campaign.fields.totalBudget },
  };

  if (filters?.sector) {
    where.brand = { sector: filters.sector };
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    include: {
      brand: { select: { name: true, logoUrl: true, color: true, emoji: true, sector: true } },
      adContent: { take: 1, orderBy: { createdAt: 'desc' } },
      primeSessions: {
        where: { status: 'ACTIVE', endsAt: { gt: now } },
        orderBy: { endsAt: 'asc' },
        take: 1,
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const result = campaigns.map((campaign) => {
    const bestAccount = user.socialAccounts
      .filter((a) => campaign.adContent[0]?.allowedPlatforms.includes(a.platform))
      .sort((a, b) => b.followersCount - a.followersCount)[0];

    const platformKey = bestAccount
      ? PLATFORM_KEY_MAP[bestAccount.platform] ?? 'x'
      : 'x';

    const creditBreakdown = bestAccount
      ? calculateCredit({
          followers: bestAccount.followersCount,
          engagementRate: bestAccount.engagementRate,
          maxCredit: campaign.totalBudget * campaign.maxCreditPct,
          platformKey,
        })
      : null;

    const activeSession = campaign.primeSessions[0];

    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      brandName: campaign.brand.name,
      brandLogo: campaign.brand.logoUrl,
      brandColor: campaign.brand.color,
      brandEmoji: campaign.brand.emoji,
      sector: campaign.brand.sector,
      platforms: campaign.adContent[0]?.allowedPlatforms ?? [],
      mediaUrl: campaign.adContent[0]?.mediaUrl,
      estimatedCredit: creditBreakdown?.total ?? 0,
      creditBreakdown,
      contentType: campaign.contentType,
      activePrimeSession: activeSession
        ? {
            id: activeSession.id,
            endsAt: activeSession.endsAt,
            bonusPerUser: activeSession.bonusPerUser,
          }
        : null,
    };
  });

  await setCache(cacheKey, result, 60);
  return result;
}

// Campaigns for the dashboard, scoped by role:
// admin → all campaigns; brand manager → only their brands' campaigns.
export async function getManagedCampaigns(userId: string, role: string) {
  const where: any =
    role === 'admin' ? {} : { brand: { managers: { some: { userId } } } };

  const campaigns = await prisma.campaign.findMany({
    where,
    include: {
      brand: { select: { name: true, emoji: true, color: true } },
      adContent: { take: 1, select: { allowedPlatforms: true } },
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return campaigns.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    status: c.status,
    brandId: c.brandId,
    brandName: c.brand.name,
    brandEmoji: c.brand.emoji,
    brandColor: c.brand.color,
    totalBudget: c.totalBudget,
    spentBudget: c.spentBudget,
    startDate: c.startDate,
    endDate: c.endDate,
    platforms: c.adContent[0]?.allowedPlatforms ?? [],
    postsCount: c._count.posts,
  }));
}

export async function getCampaignDetail(campaignId: string, userId: string) {
  const now = new Date();
  const [campaign, user] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        brand: true,
        adContent: true,
        primeSessions: {
          where: { status: 'ACTIVE', endsAt: { gt: now } },
          take: 1,
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      include: { socialAccounts: { where: { isActive: true } } },
    }),
  ]);

  if (!campaign) throw new AppError('الحملة غير موجودة', 404);

  const creditBreakdowns = user?.socialAccounts.map((account) => {
    const platformKey = PLATFORM_KEY_MAP[account.platform] ?? 'x';
    return {
      platform: account.platform,
      username: account.username,
      followers: account.followersCount,
      breakdown: calculateCredit({
        followers: account.followersCount,
        engagementRate: account.engagementRate,
        maxCredit: campaign.totalBudget * campaign.maxCreditPct,
        platformKey,
      }),
    };
  });

  return { campaign, creditBreakdowns };
}

export async function createCampaign(brandId: string, data: {
  title: string;
  description?: string;
  contentType: 'IMAGE' | 'VIDEO' | 'BOTH';
  startDate: string;
  endDate: string;
  maxCreditPct: number;
  totalBudget: number;
  allowedPlatforms: string[];
}) {
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) throw new AppError('البراند غير موجود', 404);
  if (brand.spentBudget + data.totalBudget > brand.monthlyBudget) {
    throw new AppError('الميزانية غير كافية', 400, 'INSUFFICIENT_BUDGET');
  }

  const campaign = await prisma.campaign.create({
    data: {
      brandId,
      title: data.title,
      description: data.description,
      contentType: data.contentType,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      maxCreditPct: data.maxCreditPct,
      totalBudget: data.totalBudget,
      status: 'DRAFT',
    },
  });

  // Create the ad content so the mobile app knows which platforms are allowed
  // (drives the publish flow + credit calculation).
  await prisma.adContent.create({
    data: {
      campaignId: campaign.id,
      // No baked-in text image (placeholders can't render Arabic → boxes).
      // Empty → the app shows its own clean branded placeholder. Brands can upload real media later.
      mediaUrl: '',
      captionTemplate: data.description || `شارك حملة ${brand.name} 🎯`,
      hashtags: [],
      allowedPlatforms: data.allowedPlatforms as any,
    },
  });

  return campaign;
}

export async function updateCampaignStatus(
  campaignId: string,
  status: 'ACTIVE' | 'PAUSED' | 'ENDED',
) {
  return prisma.campaign.update({
    where: { id: campaignId },
    data: { status },
  });
}

import { prisma } from '@winwin/db';
import { AppError } from '../../common/middleware/errorHandler';

export async function getBrandsByCompany(companyId: string) {
  return prisma.brand.findMany({
    where: { companyId, isActive: true },
    include: {
      campaigns: {
        where: { status: 'ACTIVE' },
        select: { id: true, title: true, spentBudget: true, totalBudget: true },
      },
      _count: { select: { campaigns: true } },
    },
  });
}

export async function getBrandDashboard(brandId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [brand, postsThisMonth, estimatedReach, creditsDistributed, activeCampaigns] =
    await Promise.all([
      prisma.brand.findUnique({ where: { id: brandId }, include: { company: true } }),
      prisma.userPost.count({
        where: { campaign: { brandId }, postedAt: { gte: monthStart } },
      }),
      prisma.userPost.findMany({
        where: { campaign: { brandId }, verificationStatus: 'VERIFIED' },
        include: { user: { include: { socialAccounts: true } } },
      }),
      prisma.userCreditTransaction.aggregate({
        where: { referenceId: { in: await getPostIdsByBrand(brandId) } },
        _sum: { amount: true },
      }),
      prisma.campaign.count({ where: { brandId, status: 'ACTIVE' } }),
    ]);

  const totalReach = estimatedReach.reduce((sum, post) => {
    const account = post.user.socialAccounts.find((a) => a.platform === post.platform);
    return sum + (account?.followersCount ?? 0);
  }, 0);

  return {
    brand,
    metrics: {
      postsThisMonth,
      estimatedReach: totalReach,
      creditsDistributed: creditsDistributed._sum.amount ?? 0,
      activeCampaigns,
      budgetUtilization: brand ? (brand.spentBudget / brand.monthlyBudget) * 100 : 0,
    },
  };
}

async function getPostIdsByBrand(brandId: string): Promise<string[]> {
  const posts = await prisma.userPost.findMany({
    where: { campaign: { brandId } },
    select: { id: true },
  });
  return posts.map((p) => p.id);
}

export async function createBrand(companyId: string, data: {
  name: string;
  sector?: string;
  emoji?: string;
  color?: string;
  logoUrl?: string;
  monthlyBudget: number;
}) {
  return prisma.brand.create({
    data: { companyId, ...data },
  });
}

export async function getBrandPosts(brandId: string, page = 1, limit = 50, filters?: {
  platform?: string;
  status?: string;
  from?: string;
  to?: string;
}) {
  const skip = (page - 1) * limit;
  const where: any = { campaign: { brandId } };

  if (filters?.platform) where.platform = filters.platform;
  if (filters?.status) where.verificationStatus = filters.status;
  if (filters?.from || filters?.to) {
    where.postedAt = {};
    if (filters.from) where.postedAt.gte = new Date(filters.from);
    if (filters.to) where.postedAt.lte = new Date(filters.to);
  }

  const [items, total] = await Promise.all([
    prisma.userPost.findMany({
      where,
      include: {
        user: { select: { name: true, phone: true } },
        campaign: { select: { title: true } },
      },
      orderBy: { postedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.userPost.count({ where }),
  ]);

  return { items, total, page, limit, hasMore: skip + limit < total };
}

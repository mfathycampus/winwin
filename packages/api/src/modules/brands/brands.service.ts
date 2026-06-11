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

const brandListInclude = {
  campaigns: {
    where: { status: 'ACTIVE' as const },
    select: { id: true, title: true, spentBudget: true, totalBudget: true },
  },
  _count: { select: { campaigns: true } },
};

// All campaigns of a single brand (for the brand dashboard pages).
export async function getBrandCampaigns(brandId: string) {
  return prisma.campaign.findMany({
    where: { brandId },
    include: { adContent: { take: 1, select: { allowedPlatforms: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

// Admin → all brands. Brand manager → only brands they manage.
export async function getBrandsForUser(userId: string, role: string) {
  if (role === 'admin') {
    return prisma.brand.findMany({
      where: { isActive: true },
      include: brandListInclude,
      orderBy: { createdAt: 'desc' },
    });
  }
  return prisma.brand.findMany({
    where: { isActive: true, managers: { some: { userId } } },
    include: brandListInclude,
    orderBy: { createdAt: 'desc' },
  });
}

// Fixed platform company that admin-created brands belong to (seeded).
const PLATFORM_COMPANY_ID = 'company_winwin';

// Admin creates a brand and (optionally) assigns an owner by phone.
export async function createBrandByAdmin(data: {
  name: string;
  sector?: string;
  emoji?: string;
  color?: string;
  monthlyBudget?: number;
  ownerPhone?: string;
}) {
  // Ensure the platform company exists
  await prisma.company.upsert({
    where: { id: PLATFORM_COMPANY_ID },
    update: {},
    create: {
      id: PLATFORM_COMPANY_ID,
      name: 'WinWin Platform',
      contactEmail: 'admin@winwin.sa',
      contactPhone: '+966500000000',
      isActive: true,
      isApproved: true,
    },
  });

  const brand = await prisma.brand.create({
    data: {
      companyId: PLATFORM_COMPANY_ID,
      name: data.name,
      sector: data.sector,
      emoji: data.emoji,
      color: data.color,
      monthlyBudget: data.monthlyBudget ?? 0,
      isActive: true,
    },
  });

  // Assign an owner account (creates the user if they don't exist yet)
  if (data.ownerPhone && data.ownerPhone.trim()) {
    const phone = data.ownerPhone.trim();
    let owner = await prisma.user.findUnique({ where: { phone } });
    if (!owner) {
      owner = await prisma.user.create({ data: { phone, name: data.name } });
      await prisma.userCredit.create({ data: { userId: owner.id } });
    }
    await prisma.brandManager.upsert({
      where: { brandId_userId: { brandId: brand.id, userId: owner.id } },
      update: { role: 'OWNER' },
      create: { brandId: brand.id, userId: owner.id, role: 'OWNER' },
    });
  }

  return brand;
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

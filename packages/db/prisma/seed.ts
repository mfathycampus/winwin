import { PrismaClient, CompanyPlan, CampaignStatus, ContentType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Demo company
  const company = await prisma.company.upsert({
    where: { crNumber: '1010000001' },
    update: {},
    create: {
      name: 'Almarai Company',
      crNumber: '1010000001',
      contactEmail: 'marketing@almarai.com',
      contactPhone: '+966500000001',
      plan: CompanyPlan.GROWTH,
      isActive: true,
      isApproved: true,
    },
  });

  // Demo brand
  const brand = await prisma.brand.upsert({
    where: { id: 'brand_almarai_001' },
    update: {},
    create: {
      id: 'brand_almarai_001',
      companyId: company.id,
      name: 'Almarai Juice',
      sector: 'Food & Beverage',
      emoji: '🥤',
      color: '#00B140',
      monthlyBudget: 50000,
      isActive: true,
    },
  });

  // Demo campaign
  await prisma.campaign.upsert({
    where: { id: 'campaign_summer_001' },
    update: {},
    create: {
      id: 'campaign_summer_001',
      brandId: brand.id,
      title: 'صيف مع ألمراعي',
      description: 'شارك لحظات صيفك مع عصائر ألمراعي واربح مكافآت حصرية',
      contentType: ContentType.IMAGE,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-08-31'),
      maxCreditPct: 0.6,
      totalBudget: 20000,
      status: CampaignStatus.ACTIVE,
    },
  });

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

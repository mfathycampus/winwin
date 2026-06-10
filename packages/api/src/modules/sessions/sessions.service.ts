import { prisma } from '@winwin/db';
import { SESSION_COMMISSION_RATE } from '@winwin/shared';
import { AppError } from '../../common/middleware/errorHandler';

export async function createSession(brandId: string, data: {
  campaignId: string;
  timeSlot: 'EVENING' | 'LUNCH' | 'MORNING' | 'RAMADAN' | 'CUSTOM';
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  maxSeats: number;
  bonusBudget: number;
  bonusPerUser: number;
}) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: data.campaignId, brandId },
  });
  if (!campaign) throw new AppError('الحملة غير موجودة أو لا تتبع هذا البراند', 404);

  const commission = Math.round(data.bonusBudget * SESSION_COMMISSION_RATE * 100) / 100;

  return prisma.primeSession.create({
    data: {
      brandId,
      campaignId: data.campaignId,
      timeSlot: data.timeSlot,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      durationMinutes: data.durationMinutes,
      maxSeats: data.maxSeats,
      bonusBudget: data.bonusBudget,
      bonusPerUser: data.bonusPerUser,
      status: 'SCHEDULED',
    },
  });
}

export async function getActiveSessions() {
  const now = new Date();
  return prisma.primeSession.findMany({
    where: { status: 'ACTIVE', endsAt: { gt: now } },
    include: {
      campaign: {
        include: { brand: { select: { name: true, logoUrl: true, color: true } } },
      },
    },
    orderBy: { endsAt: 'asc' },
  });
}

export async function getUpcomingSessions(brandId?: string) {
  const now = new Date();
  return prisma.primeSession.findMany({
    where: {
      status: 'SCHEDULED',
      startsAt: { gt: now },
      ...(brandId ? { brandId } : {}),
    },
    include: { campaign: { include: { brand: true } } },
    orderBy: { startsAt: 'asc' },
  });
}

export async function activateSession(sessionId: string) {
  return prisma.primeSession.update({
    where: { id: sessionId },
    data: { status: 'ACTIVE' },
  });
}

export async function endSession(sessionId: string) {
  return prisma.primeSession.update({
    where: { id: sessionId },
    data: { status: 'ENDED' },
  });
}

export async function getSessionStats(sessionId: string) {
  const [session, participantCount, totalBonus] = await Promise.all([
    prisma.primeSession.findUnique({ where: { id: sessionId } }),
    prisma.sessionParticipant.count({ where: { sessionId } }),
    prisma.sessionParticipant.aggregate({
      where: { sessionId },
      _sum: { bonusEarned: true },
    }),
  ]);
  return {
    session,
    participantCount,
    totalBonusPaid: totalBonus._sum.bonusEarned ?? 0,
    seatsRemaining: (session?.maxSeats ?? 0) - (session?.seatsTaken ?? 0),
  };
}

import cron from 'node-cron';
import { prisma } from '@winwin/db';
import { redis } from '../../config/redis';
import { releaseCredit } from './posts.service';
import { logger } from '../../common/logger';

// Auto-activate/end Prime Sessions
export function startSessionScheduler() {
  // Check every minute
  cron.schedule('* * * * *', async () => {
    const now = new Date();

    // Activate scheduled sessions that should start
    const toActivate = await prisma.primeSession.findMany({
      where: { status: 'SCHEDULED', startsAt: { lte: now } },
    });
    for (const s of toActivate) {
      await prisma.primeSession.update({ where: { id: s.id }, data: { status: 'ACTIVE' } });
      logger.info(`Session activated: ${s.id}`);
    }

    // End active sessions that are over
    const toEnd = await prisma.primeSession.findMany({
      where: { status: 'ACTIVE', endsAt: { lte: now } },
    });
    for (const s of toEnd) {
      await prisma.primeSession.update({ where: { id: s.id }, data: { status: 'ENDED' } });
      logger.info(`Session ended: ${s.id}`);
    }
  });
}

// Process verification queue — release credits after 30-min window
export function startVerificationWorker() {
  cron.schedule('*/2 * * * *', async () => {
    const postId = await redis.rpop('verification_queue');
    if (!postId) return;

    try {
      const data = await redis.get(`verify:${postId}`);
      if (data) {
        // TTL still active — post wasn't deleted, release credit
        await releaseCredit(postId);
        await redis.del(`verify:${postId}`);
      } else {
        // TTL expired or post deleted — check DB
        const post = await prisma.userPost.findUnique({ where: { id: postId } });
        if (post?.verificationStatus === 'PENDING') {
          // 30 minutes passed without deletion detected → release
          await releaseCredit(postId);
        }
      }
    } catch (err) {
      logger.error(`Verification error for post ${postId}:`, err);
      // Re-queue for retry
      await redis.lpush('verification_queue', postId);
    }
  });
}

// Expire credits older than 90 days
export function startCreditExpiryWorker() {
  cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    const expiredTxns = await prisma.userCreditTransaction.findMany({
      where: { type: 'EARN', expiresAt: { lte: now } },
      select: { userId: true, amount: true, id: true },
    });

    for (const txn of expiredTxns) {
      await prisma.$transaction([
        prisma.userCredit.update({
          where: { userId: txn.userId },
          data: { balance: { decrement: txn.amount } },
        }),
        prisma.userCreditTransaction.create({
          data: {
            userId: txn.userId,
            amount: -txn.amount,
            type: 'EXPIRE',
            referenceId: txn.id,
            description: 'انتهت صلاحية الرصيد',
          },
        }),
        prisma.userCreditTransaction.delete({ where: { id: txn.id } }),
      ]);
    }

    if (expiredTxns.length > 0) {
      logger.info(`Expired ${expiredTxns.length} credit transactions`);
    }
  });
}

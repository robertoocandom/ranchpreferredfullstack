import { Router } from 'express';
import { db } from '../db';
import { requireAuth } from '../auth/middleware';
import { tierForPoints } from './tiers';

export const pointsRouter = Router();

pointsRouter.get('/me', requireAuth, async (req, res) => {
  const c = req.contractor!;
  const homeStore = c.homeStoreId ? await db.store.findUnique({ where: { id: c.homeStoreId } }) : null;
  res.json({
    id: c.id,
    name: c.name,
    email: c.email,
    picture: c.picture,
    points: c.points,
    tier: tierForPoints(c.points),
    memberSince: c.memberSince,
    referralCode: c.referralCode,
    homeStore: homeStore?.name ?? null,
    isAdmin: c.isAdmin,
  });
});

pointsRouter.get('/points/history', requireAuth, async (req, res) => {
  const items = await db.pointsTransaction.findMany({
    where: { contractorId: req.contractor!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(
    items.map((t) => ({
      id: t.id,
      descEs: t.descriptionEs,
      descEn: t.descriptionEn,
      pts: t.points,
      balance: t.balanceAfter,
      type: t.type,
      source: t.source,
      date: t.createdAt,
    })),
  );
});

pointsRouter.get('/rewards', async (_req, res) => {
  const rewards = await db.reward.findMany({ where: { active: true }, orderBy: { pts: 'asc' } });
  res.json(rewards.map((r) => ({ id: r.id, nameEs: r.nameEs, nameEn: r.nameEn, pts: r.pts })));
});

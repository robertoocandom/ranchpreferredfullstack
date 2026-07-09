import { Router } from 'express';
import { db } from '../db';
import { requireAdmin } from '../auth/middleware';
import { tierForPoints } from '../points/tiers';

export const adminRouter = Router();

// Dashboard stats
adminRouter.get('/stats', requireAdmin, async (_req, res) => {
  const [contractors, pendingRedemptions, unresolvedAlerts, totalPointsAgg] = await Promise.all([
    db.contractor.count(),
    db.redemption.count({ where: { status: 'PENDING' } }),
    db.fraudAlert.count({ where: { resolved: false } }),
    db.contractor.aggregate({ _sum: { points: true } }),
  ]);
  res.json({
    contractors,
    pendingRedemptions,
    unresolvedAlerts,
    totalPoints: totalPointsAgg._sum.points ?? 0,
  });
});

// List all contractors
adminRouter.get('/contractors', requireAdmin, async (_req, res) => {
  const contractors = await db.contractor.findMany({
    orderBy: { points: 'desc' },
    include: { homeStore: { select: { name: true } } },
  });
  res.json(
    contractors.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      points: c.points,
      tier: tierForPoints(c.points),
      memberSince: c.memberSince,
      homeStore: c.homeStore?.name ?? null,
      isAdmin: c.isAdmin,
    })),
  );
});

// List redemptions (all or by status)
adminRouter.get('/redemptions', requireAdmin, async (req, res) => {
  const status = req.query.status as string | undefined;
  const where = status ? { status: status as 'PENDING' | 'CONFIRMED' | 'EXPIRED' } : {};
  const redemptions = await db.redemption.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { contractor: { select: { name: true, email: true } } },
  });
  res.json(
    redemptions.map((r) => ({
      id: r.id,
      contractorName: r.contractor.name,
      contractorEmail: r.contractor.email,
      nameEs: r.nameEs,
      nameEn: r.nameEn,
      pts: r.pts,
      dollars: r.dollars,
      status: r.status,
      createdAt: r.createdAt,
      confirmedAt: r.confirmedAt,
      qrTokenId: r.qrTokenId,
    })),
  );
});

// Confirm a redemption (staff action)
adminRouter.post('/redemptions/:id/confirm', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const redemption = await db.redemption.findUnique({
    where: { id },
    include: { contractor: true, qrToken: true },
  });
  if (!redemption) { res.status(404).json({ error: 'not_found' }); return; }
  if (redemption.status !== 'PENDING') { res.status(409).json({ error: 'not_pending' }); return; }

  await db.$transaction([
    db.redemption.update({ where: { id }, data: { status: 'CONFIRMED', confirmedAt: new Date() } }),
    db.qrToken.update({ where: { id: redemption.qrTokenId }, data: { usedAt: new Date() } }),
    db.contractor.update({
      where: { id: redemption.contractorId },
      data: { points: { decrement: redemption.pts } },
    }),
    db.pointsTransaction.create({
      data: {
        contractorId: redemption.contractorId,
        type: 'REDEMPTION',
        points: -redemption.pts,
        balanceAfter: redemption.contractor.points - redemption.pts,
        descriptionEs: `Canje confirmado: ${redemption.nameEs}`,
        descriptionEn: `Redemption confirmed: ${redemption.nameEn}`,
        source: 'admin',
      },
    }),
  ]);

  res.json({ ok: true });
});

// List all rewards (including inactive)
adminRouter.get('/rewards', requireAdmin, async (_req, res) => {
  const rewards = await db.reward.findMany({ orderBy: { pts: 'asc' } });
  res.json(rewards);
});

// Create a reward
adminRouter.post('/rewards', requireAdmin, async (req, res) => {
  const { nameEs, nameEn, pts } = req.body as { nameEs: string; nameEn: string; pts: number };
  if (!nameEs || !nameEn || !pts) { res.status(400).json({ error: 'missing_fields' }); return; }
  const reward = await db.reward.create({ data: { nameEs, nameEn, pts: Number(pts) } });
  res.status(201).json(reward);
});

// Toggle reward active / update
adminRouter.patch('/rewards/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const data = req.body as Partial<{ nameEs: string; nameEn: string; pts: number; active: boolean }>;
  const reward = await db.reward.update({ where: { id }, data });
  res.json(reward);
});

// List fraud alerts
adminRouter.get('/fraud-alerts', requireAdmin, async (req, res) => {
  const resolved = req.query.resolved === 'true';
  const alerts = await db.fraudAlert.findMany({
    where: { resolved },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { contractor: { select: { name: true, email: true } } },
  });
  res.json(
    alerts.map((a) => ({
      id: a.id,
      type: a.type,
      severity: a.severity,
      details: a.details,
      resolved: a.resolved,
      createdAt: a.createdAt,
      contractorName: a.contractor?.name ?? null,
      contractorEmail: a.contractor?.email ?? null,
    })),
  );
});

// Resolve a fraud alert
adminRouter.patch('/fraud-alerts/:id/resolve', requireAdmin, async (req, res) => {
  const { id } = req.params;
  await db.fraudAlert.update({ where: { id }, data: { resolved: true } });
  res.json({ ok: true });
});

import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { db } from '../db';
import { requireAuth } from '../auth/middleware';
import { multiplierForPoints } from '../points/tiers';
import {
  checkActivationVelocity,
  checkLargePurchase,
  checkRedemptionVelocity,
  flagExpiredQr,
  flagQrReplay,
} from '../fraud/engine';

export const qrRouter = Router();

const REDEEM_TTL_MS = 24 * 60 * 60_000; // matches the "válido 24 horas" copy in the UI
const ACTIVATE_TTL_MS = 15 * 60_000;

// --- Redeem: contractor spends points for store credit -------------------

qrRouter.post('/redeem', requireAuth, async (req, res) => {
  const contractor = req.contractor!;
  const { rewardId, customPts } = req.body as { rewardId?: string; customPts?: number };

  let pts: number;
  let nameEs: string;
  let nameEn: string;
  let rewardIdToStore: string | null = null;

  if (rewardId) {
    const reward = await db.reward.findUnique({ where: { id: rewardId } });
    if (!reward || !reward.active) {
      res.status(404).json({ error: 'reward_not_found' });
      return;
    }
    pts = reward.pts;
    nameEs = reward.nameEs;
    nameEn = reward.nameEn;
    rewardIdToStore = reward.id;
  } else if (customPts) {
    if (customPts < 100 || customPts % 100 !== 0) {
      res.status(400).json({ error: 'invalid_custom_amount' });
      return;
    }
    pts = customPts;
    const dollars = Math.round(pts / 10);
    nameEs = `$${dollars} Crédito Personalizado`;
    nameEn = `$${dollars} Custom Credit`;
  } else {
    res.status(400).json({ error: 'rewardId_or_customPts_required' });
    return;
  }

  if (contractor.points < pts) {
    res.status(400).json({ error: 'insufficient_points' });
    return;
  }

  const dollars = Math.round(pts / 10);
  const jti = randomUUID();

  const qrToken = await db.qrToken.create({
    data: {
      jti,
      contractorId: contractor.id,
      purpose: 'REDEEM',
      payload: JSON.stringify({ pts, dollars, nameEs, nameEn }),
      expiresAt: new Date(Date.now() + REDEEM_TTL_MS),
    },
  });

  const redemption = await db.redemption.create({
    data: {
      contractorId: contractor.id,
      rewardId: rewardIdToStore,
      nameEs,
      nameEn,
      pts,
      dollars,
      qrTokenId: qrToken.id,
    },
  });

  res.json({
    redemptionId: redemption.id,
    jti,
    qrValue: `RANCHPREFERRED:REDEEM:${jti}`,
    pts,
    dollars,
    nameEs,
    nameEn,
    expiresAt: qrToken.expiresAt,
  });
});

// In production this must run under a store-terminal/staff session, not the
// contractor's own token — simulated here so the whole loop is testable
// end-to-end without a POS integration.
qrRouter.post('/redeem/confirm', requireAuth, async (req, res) => {
  const contractor = req.contractor!;
  const { jti } = req.body as { jti?: string };
  if (!jti) {
    res.status(400).json({ error: 'jti_required' });
    return;
  }

  const qrToken = await db.qrToken.findUnique({ where: { jti }, include: { redemption: true } });
  if (!qrToken || qrToken.purpose !== 'REDEEM' || !qrToken.redemption) {
    res.status(404).json({ error: 'qr_not_found' });
    return;
  }
  if (qrToken.usedAt) {
    await flagQrReplay(qrToken.contractorId, jti);
    res.status(409).json({ error: 'qr_already_used' });
    return;
  }
  if (qrToken.expiresAt < new Date()) {
    await flagExpiredQr(qrToken.contractorId, jti);
    res.status(410).json({ error: 'qr_expired' });
    return;
  }

  const fresh = await db.contractor.findUniqueOrThrow({ where: { id: contractor.id } });
  if (fresh.points < qrToken.redemption.pts) {
    res.status(400).json({ error: 'insufficient_points' });
    return;
  }

  const balanceAfter = fresh.points - qrToken.redemption.pts;

  await db.$transaction([
    db.contractor.update({ where: { id: contractor.id }, data: { points: balanceAfter } }),
    db.qrToken.update({ where: { id: qrToken.id }, data: { usedAt: new Date() } }),
    db.redemption.update({ where: { id: qrToken.redemption.id }, data: { status: 'CONFIRMED', confirmedAt: new Date() } }),
    db.pointsTransaction.create({
      data: {
        contractorId: contractor.id,
        type: 'REDEMPTION',
        points: -qrToken.redemption.pts,
        balanceAfter,
        descriptionEs: `Canje: ${qrToken.redemption.nameEs}`,
        descriptionEn: `Redeemed: ${qrToken.redemption.nameEn}`,
        source: 'app',
      },
    }),
  ]);

  await checkRedemptionVelocity(contractor.id);

  res.json({ points: balanceAfter });
});

// --- Activate: contractor shows QR at checkout, cashier scans + enters $ ---

qrRouter.post('/activate', requireAuth, async (req, res) => {
  const contractor = req.contractor!;
  const jti = randomUUID();
  const qrToken = await db.qrToken.create({
    data: {
      jti,
      contractorId: contractor.id,
      purpose: 'ACTIVATE',
      payload: JSON.stringify({}),
      expiresAt: new Date(Date.now() + ACTIVATE_TTL_MS),
    },
  });
  res.json({ jti, qrValue: `RANCHPREFERRED:ACTIVATE:${jti}`, expiresAt: qrToken.expiresAt });
});

// Simulates the cashier terminal scanning the QR and keying in the sale
// amount. In production this is a POS integration call, not something the
// contractor's own app should be able to trigger for itself.
qrRouter.post('/activate/scan', requireAuth, async (req, res) => {
  const contractor = req.contractor!;
  const { jti, amountUsd } = req.body as { jti?: string; amountUsd?: number };
  if (!jti || !amountUsd || amountUsd <= 0) {
    res.status(400).json({ error: 'jti_and_amountUsd_required' });
    return;
  }

  const qrToken = await db.qrToken.findUnique({ where: { jti } });
  if (!qrToken || qrToken.purpose !== 'ACTIVATE') {
    res.status(404).json({ error: 'qr_not_found' });
    return;
  }
  if (qrToken.usedAt) {
    await flagQrReplay(qrToken.contractorId, jti);
    res.status(409).json({ error: 'qr_already_used' });
    return;
  }
  if (qrToken.expiresAt < new Date()) {
    await flagExpiredQr(qrToken.contractorId, jti);
    res.status(410).json({ error: 'qr_expired' });
    return;
  }

  const fresh = await db.contractor.findUniqueOrThrow({ where: { id: contractor.id } });
  const multiplier = multiplierForPoints(fresh.points);
  const pts = Math.round((amountUsd / 10) * multiplier);
  const balanceAfter = fresh.points + pts;

  await db.$transaction([
    db.contractor.update({ where: { id: contractor.id }, data: { points: balanceAfter } }),
    db.qrToken.update({ where: { id: qrToken.id }, data: { usedAt: new Date() } }),
    db.pointsTransaction.create({
      data: {
        contractorId: contractor.id,
        type: 'PURCHASE',
        points: pts,
        balanceAfter,
        descriptionEs: `Compra activada — $${amountUsd.toFixed(2)}`,
        descriptionEn: `Activated purchase — $${amountUsd.toFixed(2)}`,
        source: 'app',
      },
    }),
  ]);

  await checkActivationVelocity(contractor.id);
  await checkLargePurchase(contractor.id, amountUsd);

  res.json({ points: balanceAfter, ptsEarned: pts });
});

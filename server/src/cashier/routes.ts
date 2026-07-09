import { Router, type Request, type Response, type NextFunction } from 'express';
import { db } from '../db';
import { signCashier, verifyCashier, type CashierPayload } from '../auth/jwt';
import { multiplierForPoints } from '../points/tiers';
import {
  checkActivationVelocity,
  checkLargePurchase,
  checkRedemptionVelocity,
  flagExpiredQr,
  flagQrReplay,
} from '../fraud/engine';

export const cashierRouter = Router();

// Extend Express Request to carry cashier session
declare global {
  namespace Express {
    interface Request {
      cashier?: CashierPayload;
    }
  }
}

async function requireCashier(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ error: 'missing_token' }); return; }
  try {
    req.cashier = verifyCashier(header.slice('Bearer '.length));
    next();
  } catch {
    res.status(401).json({ error: 'invalid_cashier_token' });
  }
}

// POST /cashier/login { storeId, pin }
cashierRouter.post('/login', async (req, res) => {
  const { storeId, pin } = req.body as { storeId?: string; pin?: string };
  if (!storeId || !pin) { res.status(400).json({ error: 'storeId_and_pin_required' }); return; }

  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store || store.cashierPin !== pin) {
    res.status(401).json({ error: 'invalid_credentials' });
    return;
  }

  const token = signCashier({ role: 'cashier', storeId: store.id, storeName: store.name });
  res.json({ token, storeName: store.name });
});

// GET /cashier/stores  — public, so cashier login can list stores
cashierRouter.get('/stores', async (_req, res) => {
  const stores = await db.store.findMany({
    select: { id: true, name: true, address: true },
    orderBy: { name: 'asc' },
  });
  res.json(stores);
});

// POST /cashier/scan { qrValue, amountUsd? }
// qrValue format: "RANCHPREFERRED:ACTIVATE:<jti>" or "RANCHPREFERRED:REDEEM:<jti>"
cashierRouter.post('/scan', requireCashier, async (req, res) => {
  const { qrValue, amountUsd } = req.body as { qrValue?: string; amountUsd?: number };
  if (!qrValue) { res.status(400).json({ error: 'qrValue_required' }); return; }

  const parts = qrValue.trim().split(':');
  if (parts.length !== 3 || parts[0] !== 'RANCHPREFERRED') {
    res.status(400).json({ error: 'invalid_qr_format' });
    return;
  }

  const purpose = parts[1] as 'ACTIVATE' | 'REDEEM';
  const jti = parts[2];

  if (purpose !== 'ACTIVATE' && purpose !== 'REDEEM') {
    res.status(400).json({ error: 'unknown_qr_purpose' });
    return;
  }

  const qrToken = await db.qrToken.findUnique({
    where: { jti },
    include: { redemption: true },
  });

  if (!qrToken || qrToken.purpose !== purpose) {
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

  const contractor = await db.contractor.findUniqueOrThrow({ where: { id: qrToken.contractorId } });

  // ── ACTIVATE: credit points for purchase ──────────────────────────────────
  if (purpose === 'ACTIVATE') {
    if (!amountUsd || amountUsd <= 0) {
      res.status(400).json({ error: 'amountUsd_required_for_activation', purpose: 'ACTIVATE' });
      return;
    }

    const multiplier = multiplierForPoints(contractor.points);
    const pts = Math.round((amountUsd / 10) * multiplier);
    const balanceAfter = contractor.points + pts;

    await db.$transaction([
      db.contractor.update({ where: { id: contractor.id }, data: { points: balanceAfter } }),
      db.qrToken.update({ where: { id: qrToken.id }, data: { usedAt: new Date() } }),
      db.pointsTransaction.create({
        data: {
          contractorId: contractor.id,
          type: 'PURCHASE',
          points: pts,
          balanceAfter,
          descriptionEs: `Compra — $${amountUsd.toFixed(2)} (Tienda ${req.cashier!.storeName})`,
          descriptionEn: `Purchase — $${amountUsd.toFixed(2)} (${req.cashier!.storeName} Store)`,
          source: 'cashier',
        },
      }),
    ]);

    await checkActivationVelocity(contractor.id);
    await checkLargePurchase(contractor.id, amountUsd);

    res.json({
      purpose: 'ACTIVATE',
      contractorName: contractor.name,
      ptsEarned: pts,
      newBalance: balanceAfter,
      amountUsd,
    });
    return;
  }

  // ── REDEEM: deduct points for store credit ────────────────────────────────
  const redemption = qrToken.redemption;
  if (!redemption) { res.status(404).json({ error: 'redemption_not_found' }); return; }

  if (contractor.points < redemption.pts) {
    res.status(400).json({ error: 'insufficient_points' });
    return;
  }

  const balanceAfter = contractor.points - redemption.pts;

  await db.$transaction([
    db.contractor.update({ where: { id: contractor.id }, data: { points: balanceAfter } }),
    db.qrToken.update({ where: { id: qrToken.id }, data: { usedAt: new Date() } }),
    db.redemption.update({ where: { id: redemption.id }, data: { status: 'CONFIRMED', confirmedAt: new Date() } }),
    db.pointsTransaction.create({
      data: {
        contractorId: contractor.id,
        type: 'REDEMPTION',
        points: -redemption.pts,
        balanceAfter,
        descriptionEs: `Canje: ${redemption.nameEs} (Tienda ${req.cashier!.storeName})`,
        descriptionEn: `Redeemed: ${redemption.nameEn} (${req.cashier!.storeName} Store)`,
        source: 'cashier',
      },
    }),
  ]);

  await checkRedemptionVelocity(contractor.id);

  res.json({
    purpose: 'REDEEM',
    contractorName: contractor.name,
    ptsDeducted: redemption.pts,
    newBalance: balanceAfter,
    dollars: redemption.dollars,
    rewardName: redemption.nameEs,
  });
});

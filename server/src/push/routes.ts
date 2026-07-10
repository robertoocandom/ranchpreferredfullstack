import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import { db } from '../db';

export const pushRouter = Router();

// POST /push/subscribe — save push subscription
pushRouter.post('/subscribe', requireAuth, async (req, res) => {
  const contractor = req.contractor!;
  const { endpoint, keys } = req.body as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ error: 'invalid_subscription' });
    return;
  }

  await db.pushSubscription.upsert({
    where: { endpoint },
    update: { contractorId: contractor.id, p256dh: keys.p256dh, auth: keys.auth },
    create: { contractorId: contractor.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
  });

  res.json({ ok: true });
});

// DELETE /push/unsubscribe — remove push subscription
pushRouter.delete('/unsubscribe', requireAuth, async (req, res) => {
  const { endpoint } = req.body as { endpoint?: string };
  if (!endpoint) {
    res.status(400).json({ error: 'missing_endpoint' });
    return;
  }
  await db.pushSubscription.deleteMany({ where: { endpoint } });
  res.json({ ok: true });
});

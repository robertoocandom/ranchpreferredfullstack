import webpush from 'web-push';
import { db } from '../db';
import { config } from '../config';

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return;
  if (!config.vapidPublicKey || !config.vapidPrivateKey) return;
  webpush.setVapidDetails(
    'mailto:admin@ranchfencesupply.com',
    config.vapidPublicKey,
    config.vapidPrivateKey,
  );
  vapidConfigured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushToContractor(contractorId: string, payload: PushPayload) {
  ensureVapid();
  if (!vapidConfigured) return;

  const subs = await db.pushSubscription.findMany({ where: { contractorId } });
  const dead: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
      } catch (err: unknown) {
        // 404/410 means subscription expired — clean it up
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) dead.push(sub.id);
      }
    }),
  );

  if (dead.length > 0) {
    await db.pushSubscription.deleteMany({ where: { id: { in: dead } } });
  }
}

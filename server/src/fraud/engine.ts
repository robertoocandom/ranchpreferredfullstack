import { db } from '../db';
import { config } from '../config';

type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

async function notify(alert: { contractorId: string | null; type: string; severity: Severity; details: string }) {
  console.warn(`[fraud-alert:${alert.severity}] ${alert.type} — ${alert.details}`);
  if (!config.fraudWebhookUrl) return;
  try {
    await fetch(config.fraudWebhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: `[Ranch Preferred] ${alert.severity} ${alert.type}: ${alert.details}` }),
    });
  } catch (err) {
    console.error('fraud webhook delivery failed', err);
  }
}

async function raise(contractorId: string | null, type: string, severity: Severity, details: string) {
  await db.fraudAlert.create({ data: { contractorId, type, severity, details } });
  await notify({ contractorId, type, severity, details });
}

const VELOCITY_WINDOW_MINUTES = 60;
const MAX_REDEMPTIONS_PER_WINDOW = 3;
const MAX_ACTIVATIONS_PER_WINDOW = 5;
const LARGE_PURCHASE_USD = 5000;

export async function checkRedemptionVelocity(contractorId: string) {
  const since = new Date(Date.now() - VELOCITY_WINDOW_MINUTES * 60_000);
  const count = await db.redemption.count({ where: { contractorId, status: 'CONFIRMED', confirmedAt: { gte: since } } });
  if (count + 1 > MAX_REDEMPTIONS_PER_WINDOW) {
    await raise(
      contractorId,
      'redemption_velocity',
      'HIGH',
      `${count + 1} redemptions within ${VELOCITY_WINDOW_MINUTES} minutes (limit ${MAX_REDEMPTIONS_PER_WINDOW})`,
    );
  }
}

export async function checkActivationVelocity(contractorId: string) {
  const since = new Date(Date.now() - VELOCITY_WINDOW_MINUTES * 60_000);
  const count = await db.pointsTransaction.count({
    where: { contractorId, type: 'PURCHASE', source: 'app', createdAt: { gte: since } },
  });
  if (count + 1 > MAX_ACTIVATIONS_PER_WINDOW) {
    await raise(
      contractorId,
      'activation_velocity',
      'MEDIUM',
      `${count + 1} purchase activations within ${VELOCITY_WINDOW_MINUTES} minutes (limit ${MAX_ACTIVATIONS_PER_WINDOW})`,
    );
  }
}

export async function checkLargePurchase(contractorId: string, amountUsd: number) {
  if (amountUsd >= LARGE_PURCHASE_USD) {
    await raise(contractorId, 'large_purchase', 'MEDIUM', `Purchase activation of $${amountUsd.toFixed(2)} exceeds $${LARGE_PURCHASE_USD}`);
  }
}

export async function flagQrReplay(contractorId: string | null, jti: string) {
  await raise(contractorId, 'qr_replay', 'HIGH', `QR token ${jti} was scanned again after already being used`);
}

export async function flagExpiredQr(contractorId: string | null, jti: string) {
  await raise(contractorId, 'qr_expired', 'LOW', `Expired QR token ${jti} was presented`);
}

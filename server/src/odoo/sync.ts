import { db } from '../db';
import { mockOdooClient } from './mockClient';
import { multiplierForPoints } from '../points/tiers';

export async function runOdooSync(): Promise<{ processed: number }> {
  const state = await db.syncState.upsert({ where: { id: 'odoo' }, update: {}, create: { id: 'odoo' } });
  const sales = await mockOdooClient.fetchSalesSince(state.lastSyncAt);
  let processed = 0;

  for (const sale of sales) {
    let contractor = await db.contractor.findUnique({ where: { email: sale.partnerEmail } });

    if (!contractor) {
      const store = await db.store.findFirst({ orderBy: { name: 'asc' } });
      contractor = await db.contractor.create({
        data: {
          name: sale.partnerName,
          email: sale.partnerEmail,
          referralCode: `${sale.partnerName.slice(0, 3).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
          homeStoreId: store?.id ?? null,
        },
      });
    }

    if (!contractor.odooPartnerId) {
      const { partnerId } = await mockOdooClient.pushCustomer({ name: contractor.name, email: contractor.email });
      contractor = await db.contractor.update({ where: { id: contractor.id }, data: { odooPartnerId: partnerId } });
    }

    const multiplier = multiplierForPoints(contractor.points);
    const pts = Math.round((sale.amount / 10) * multiplier);
    const balanceAfter = contractor.points + pts;

    await db.$transaction([
      db.contractor.update({ where: { id: contractor.id }, data: { points: balanceAfter } }),
      db.pointsTransaction.create({
        data: {
          contractorId: contractor.id,
          type: 'ODOO_SYNC',
          points: pts,
          balanceAfter,
          descriptionEs: `Compra en Odoo (${sale.orderRef}): $${sale.amount.toFixed(2)}`,
          descriptionEn: `Odoo sale (${sale.orderRef}): $${sale.amount.toFixed(2)}`,
          source: 'odoo',
        },
      }),
    ]);
    processed += 1;
  }

  await db.syncState.update({ where: { id: 'odoo' }, data: { lastSyncAt: new Date() } });
  return { processed };
}

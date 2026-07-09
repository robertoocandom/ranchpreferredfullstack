import cron from 'node-cron';
import { runOdooSync } from './sync';

/** Runs the Odoo sync every hour, on the hour — swap the cron expression if the business needs a different cadence. */
export function startOdooScheduler() {
  cron.schedule('0 * * * *', async () => {
    try {
      const { processed } = await runOdooSync();
      console.log(`[odoo-sync] processed ${processed} sale(s)`);
    } catch (err) {
      console.error('[odoo-sync] failed', err);
    }
  });
}

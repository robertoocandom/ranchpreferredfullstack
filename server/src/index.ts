import express from 'express';
import cors from 'cors';
import { config } from './config';
import { authRouter } from './auth/routes';
import { pointsRouter } from './points/routes';
import { qrRouter } from './qr/routes';
import { referralsRouter } from './referrals/routes';
import { storesRouter } from './stores/routes';
import { odooRouter } from './odoo/routes';
import { startOdooScheduler } from './odoo/scheduler';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/', pointsRouter); // exposes /me, /points/history, /rewards
app.use('/', qrRouter); // exposes /redeem, /redeem/confirm, /activate, /activate/scan
app.use('/referrals', referralsRouter);
app.use('/stores', storesRouter);
app.use('/odoo', odooRouter);

app.listen(config.port, () => {
  console.log(`Ranch Preferred API listening on http://localhost:${config.port}`);
  startOdooScheduler();
});

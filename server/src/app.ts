import express from 'express';
import cors from 'cors';
import { config } from './config';
import { authRouter } from './auth/routes';
import { pointsRouter } from './points/routes';
import { qrRouter } from './qr/routes';
import { referralsRouter } from './referrals/routes';
import { storesRouter } from './stores/routes';
import { odooRouter } from './odoo/routes';
import { adminRouter } from './admin/routes';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/', pointsRouter);   // /me, /points/history, /rewards
app.use('/', qrRouter);       // /redeem, /redeem/confirm, /activate, /activate/scan
app.use('/referrals', referralsRouter);
app.use('/stores', storesRouter);
app.use('/odoo', odooRouter);
app.use('/admin', adminRouter);

export default app;

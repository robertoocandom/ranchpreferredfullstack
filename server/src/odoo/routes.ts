import { Router } from 'express';
import { runOdooSync } from './sync';

export const odooRouter = Router();

// Manual trigger for testing/demo purposes so the sync doesn't require
// waiting an actual hour to verify. In production, gate this behind an
// internal/admin credential — it must not be reachable by contractor
// sessions or the public internet.
odooRouter.post('/sync', async (_req, res) => {
  const result = await runOdooSync();
  res.json(result);
});

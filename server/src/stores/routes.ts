import { Router } from 'express';
import { db } from '../db';

export const storesRouter = Router();

storesRouter.get('/', async (_req, res) => {
  const stores = await db.store.findMany({ orderBy: { name: 'asc' } });
  res.json(stores);
});

import type { Request, Response, NextFunction } from 'express';
import type { Contractor } from '@prisma/client';
import { verifySession } from './jwt';
import { db } from '../db';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      contractor?: Contractor;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'missing_token' });
    return;
  }
  try {
    const { sub } = verifySession(header.slice('Bearer '.length));
    const contractor = await db.contractor.findUnique({ where: { id: sub } });
    if (!contractor) {
      res.status(401).json({ error: 'contractor_not_found' });
      return;
    }
    req.contractor = contractor;
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (!req.contractor?.isAdmin) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }
    next();
  });
}

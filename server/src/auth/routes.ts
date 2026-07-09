import { Router } from 'express';
import { db } from '../db';
import { verifyGoogleIdToken } from './google';
import { signSession } from './jwt';

export const authRouter = Router();

function referralCodeFor(name: string): string {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${initials}${suffix}`;
}

async function findOrCreateHomeStore(): Promise<string | null> {
  const store = await db.store.findFirst({ orderBy: { name: 'asc' } });
  return store?.id ?? null;
}

authRouter.post('/google', async (req, res) => {
  const { idToken } = req.body as { idToken?: string };
  if (!idToken) {
    res.status(400).json({ error: 'idToken required' });
    return;
  }
  try {
    const profile = await verifyGoogleIdToken(idToken);
    let contractor = await db.contractor.findUnique({ where: { googleSub: profile.sub } });
    if (!contractor) {
      contractor = await db.contractor.findUnique({ where: { email: profile.email } });
    }
    if (!contractor) {
      contractor = await db.contractor.create({
        data: {
          name: profile.name,
          email: profile.email,
          googleSub: profile.sub,
          picture: profile.picture,
          referralCode: referralCodeFor(profile.name),
          homeStoreId: await findOrCreateHomeStore(),
        },
      });
    } else if (!contractor.googleSub) {
      contractor = await db.contractor.update({ where: { id: contractor.id }, data: { googleSub: profile.sub, picture: profile.picture ?? contractor.picture } });
    }
    const token = signSession({ sub: contractor.id });
    res.json({ token, contractor });
  } catch (err) {
    res.status(401).json({ error: 'google_verification_failed', message: (err as Error).message });
  }
});

// Demo login: always resolves to the same seeded demo contractor
// (Carlos Hernández). Mirrors the frontend's "cuenta de prueba" button
// so the whole flow can be exercised without Google OAuth configured.
authRouter.post('/demo', async (_req, res) => {
  let contractor = await db.contractor.findUnique({ where: { email: 'carlos.h@contractormail.com' } });
  if (!contractor) {
    contractor = await db.contractor.create({
      data: {
        name: 'Carlos Hernández',
        email: 'carlos.h@contractormail.com',
        points: 847,
        referralCode: 'CH4471',
        homeStoreId: await findOrCreateHomeStore(),
      },
    });
  }
  const token = signSession({ sub: contractor.id });
  res.json({ token, contractor });
});

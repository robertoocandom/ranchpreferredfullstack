import { Router } from 'express';
import { db } from '../db';
import { requireAuth } from '../auth/middleware';

export const referralsRouter = Router();

referralsRouter.use(requireAuth);

const QUALIFYING_AMOUNT = 2000;
const QUALIFIED_PTS = 50;
const REGULAR_PTS = 10;

referralsRouter.get('/', async (req, res) => {
  const referrals = await db.referral.findMany({
    where: { referrerId: req.contractor!.id },
    orderBy: { date: 'desc' },
  });
  res.json(referrals);
});

referralsRouter.post('/', async (req, res) => {
  const contractor = req.contractor!;
  const { refereeName, amount } = req.body as { refereeName?: string; amount?: number };
  if (!refereeName || !amount || amount <= 0) {
    res.status(400).json({ error: 'refereeName_and_amount_required' });
    return;
  }

  const qualified = amount >= QUALIFYING_AMOUNT;
  const pts = qualified ? QUALIFIED_PTS : REGULAR_PTS;
  const balanceAfter = contractor.points + pts;

  const [referral] = await db.$transaction([
    db.referral.create({ data: { referrerId: contractor.id, refereeName, amount, qualified, pts } }),
    db.contractor.update({ where: { id: contractor.id }, data: { points: balanceAfter } }),
    db.pointsTransaction.create({
      data: {
        contractorId: contractor.id,
        type: 'REFERRAL',
        points: pts,
        balanceAfter,
        descriptionEs: `Referido: ${refereeName}`,
        descriptionEn: `Referral: ${refereeName}`,
        source: 'app',
      },
    }),
  ]);

  res.json({ referral, points: balanceAfter });
});

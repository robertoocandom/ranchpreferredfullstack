import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const stores = [
  { name: 'Arlington', address: '2201 E Division St, Arlington TX 76011', phone: '(817) 555-0101', hoursEs: 'L–S 7–17h', hoursEn: 'M–Sat 7am–5pm', maps: 'https://maps.google.com/?q=2201+E+Division+St+Arlington+TX', tel: 'tel:+18175550101' },
  { name: 'Dallas', address: '4521 Singleton Blvd, Dallas TX 75212', phone: '(214) 555-0182', hoursEs: 'L–S 7–17h', hoursEn: 'M–Sat 7am–5pm', maps: 'https://maps.google.com/?q=4521+Singleton+Blvd+Dallas+TX', tel: 'tel:+12145550182' },
  { name: 'Fort Worth', address: '3301 S Riverside Dr, Fort Worth TX 76104', phone: '(817) 555-0234', hoursEs: 'L–S 7–17h', hoursEn: 'M–Sat 7am–5pm', maps: 'https://maps.google.com/?q=Fort+Worth+TX', tel: 'tel:+18175550234' },
  { name: 'Waxahachie', address: '1802 N Hwy 287, Waxahachie TX 75165', phone: '(972) 555-0311', hoursEs: 'L–S 7–17h', hoursEn: 'M–Sat 7am–5pm', maps: 'https://maps.google.com/?q=Waxahachie+TX', tel: 'tel:+19725550311' },
  { name: 'Grand Prairie', address: '2755 W Pioneer Pkwy, Grand Prairie TX 75051', phone: '(972) 555-0422', hoursEs: 'L–S 7–17h', hoursEn: 'M–Sat 7am–5pm', maps: 'https://maps.google.com/?q=Grand+Prairie+TX', tel: 'tel:+19725550422' },
  { name: 'Venus', address: '920 US-67, Venus TX 76084', phone: '(972) 555-0533', hoursEs: 'L–V 7–17h', hoursEn: 'M–F 7am–5pm', maps: 'https://maps.google.com/?q=Venus+TX', tel: 'tel:+19725550533' },
  { name: 'OKC West', address: '5221 W Reno Ave, Oklahoma City OK 73127', phone: '(405) 555-0644', hoursEs: 'L–S 7–17h', hoursEn: 'M–Sat 7am–5pm', maps: 'https://maps.google.com/?q=5221+W+Reno+Oklahoma+City+OK', tel: 'tel:+14055550644' },
];

const rewards = [
  { nameEs: '$10 Crédito en Tienda', nameEn: '$10 Store Credit', pts: 100 },
  { nameEs: '$20 Crédito en Tienda', nameEn: '$20 Store Credit', pts: 150 },
  { nameEs: 'Premio del Mes: Cooler YETI', nameEn: 'Prize of the Month: YETI Cooler', pts: 200 },
  { nameEs: 'Especial: Generador Honda EU2200i', nameEn: 'Special: Honda EU2200i Generator', pts: 1500 },
];

async function main() {
  for (const { maps, ...s } of stores) {
    const data = { ...s, mapsUrl: maps };
    await db.store.upsert({
      where: { name: s.name },
      update: data,
      create: data,
    });
  }

  for (const r of rewards) {
    const existing = await db.reward.findFirst({ where: { nameEs: r.nameEs } });
    if (!existing) await db.reward.create({ data: r });
  }

  const arlington = await db.store.findFirst({ where: { name: 'Arlington' } });
  const carlos = await db.contractor.upsert({
    where: { email: 'carlos.h@contractormail.com' },
    update: {},
    create: {
      name: 'Carlos Hernández',
      email: 'carlos.h@contractormail.com',
      points: 847,
      referralCode: 'CH4471',
      homeStoreId: arlington?.id ?? null,
      memberSince: new Date('2024-01-15'),
    },
  });

  const existingHistory = await db.pointsTransaction.count({ where: { contractorId: carlos.id } });
  if (existingHistory === 0) {
    const history: Array<{ descriptionEs: string; descriptionEn: string; points: number; balanceAfter: number; type: 'PURCHASE' | 'REFERRAL' | 'REDEMPTION' | 'BONUS'; daysAgo: number }> = [
      { descriptionEs: 'Bono de bienvenida', descriptionEn: 'Welcome bonus', points: 50, balanceAfter: 787, type: 'BONUS', daysAgo: 35 },
      { descriptionEs: 'Compra: Pickets de cedro', descriptionEn: 'Purchase: Cedar pickets', points: 55, balanceAfter: 842, type: 'PURCHASE', daysAgo: 30 },
      { descriptionEs: 'Canje: $10 crédito tienda', descriptionEn: 'Redeemed: $10 store credit', points: -100, balanceAfter: 742, type: 'REDEMPTION', daysAgo: 25 },
      { descriptionEs: 'Compra: Tablones stained', descriptionEn: 'Purchase: Stained boards', points: 38, balanceAfter: 780, type: 'PURCHASE', daysAgo: 22 },
      { descriptionEs: 'Referido: Juan Méndez', descriptionEn: 'Referral: Juan Méndez', points: 25, balanceAfter: 805, type: 'REFERRAL', daysAgo: 20 },
      { descriptionEs: 'Compra: Postes de cedro', descriptionEn: 'Purchase: Cedar posts', points: 42, balanceAfter: 847, type: 'PURCHASE', daysAgo: 16 },
    ];
    for (const h of history) {
      await db.pointsTransaction.create({
        data: {
          contractorId: carlos.id,
          type: h.type,
          points: h.points,
          balanceAfter: h.balanceAfter,
          descriptionEs: h.descriptionEs,
          descriptionEn: h.descriptionEn,
          source: 'seed',
          createdAt: new Date(Date.now() - h.daysAgo * 24 * 60 * 60_000),
        },
      });
    }
  }

  const existingReferrals = await db.referral.count({ where: { referrerId: carlos.id } });
  if (existingReferrals === 0) {
    const referrals = [
      { refereeName: 'Juan Méndez', amount: 3200, qualified: true, pts: 50, daysAgo: 20 },
      { refereeName: 'Roberto Leal', amount: 850, qualified: false, pts: 10, daysAgo: 28 },
      { refereeName: 'Ernesto Vargas', amount: 2450, qualified: true, pts: 50, daysAgo: 37 },
    ];
    for (const r of referrals) {
      await db.referral.create({
        data: {
          referrerId: carlos.id,
          refereeName: r.refereeName,
          amount: r.amount,
          qualified: r.qualified,
          pts: r.pts,
          date: new Date(Date.now() - r.daysAgo * 24 * 60 * 60_000),
        },
      });
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

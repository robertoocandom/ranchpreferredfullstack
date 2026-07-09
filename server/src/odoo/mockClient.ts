// Stand-in for a real Odoo integration. A production client would speak
// Odoo's XML-RPC/JSON-RPC API, e.g.:
//   models.execute_kw(db, uid, password, 'sale.order', 'search_read',
//     [[['write_date', '>=', since], ['state', '=', 'sale']]],
//     { fields: ['partner_id', 'amount_total', 'name', 'date_order'] })
// This mock returns fixture data behind the same shape so `sync.ts` can be
// pointed at a real client later by swapping this module only.

export interface OdooSaleRecord {
  orderRef: string;
  partnerEmail: string;
  partnerName: string;
  amount: number;
  orderDate: Date;
}

const FIXTURE_CUSTOMERS = [
  { email: 'roberto.leal@example.com', name: 'Roberto Leal' },
  { email: 'ernesto.vargas@example.com', name: 'Ernesto Vargas' },
  { email: 'juan.mendez@example.com', name: 'Juan Méndez' },
  { email: 'sofia.reyes@example.com', name: 'Sofía Reyes' },
  { email: 'david.ochoa@example.com', name: 'David Ochoa' },
];

let cursor = 0;

export const mockOdooClient = {
  /** Simulates pulling confirmed sale orders since the last sync cursor. */
  async fetchSalesSince(_since: Date): Promise<OdooSaleRecord[]> {
    const customer = FIXTURE_CUSTOMERS[cursor % FIXTURE_CUSTOMERS.length];
    cursor += 1;
    const amount = Math.round((150 + Math.random() * 2500) * 100) / 100;
    return [
      {
        orderRef: `SO${1000 + cursor}`,
        partnerEmail: customer.email,
        partnerName: customer.name,
        amount,
        orderDate: new Date(),
      },
    ];
  },

  /**
   * Simulates pushing the app's customer record to Odoo's `res.partner`
   * (create-or-update by email). A real client would call:
   *   models.execute_kw(db, uid, password, 'res.partner', 'write'/'create', ...)
   */
  async pushCustomer(customer: { name: string; email: string }): Promise<{ partnerId: string }> {
    const partnerId = `mock-partner-${Buffer.from(customer.email).toString('base64url').slice(0, 12)}`;
    console.log(`[odoo-mock] upserted res.partner ${partnerId} for ${customer.name} <${customer.email}>`);
    return { partnerId };
  },
};

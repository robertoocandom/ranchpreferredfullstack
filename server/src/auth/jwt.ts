import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface SessionPayload {
  sub: string; // contractor id
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '30d' });
}

export function verifySession(token: string): SessionPayload {
  return jwt.verify(token, config.jwtSecret) as SessionPayload;
}

export interface CashierPayload {
  role: 'cashier';
  storeId: string;
  storeName: string;
}

export function signCashier(payload: CashierPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '12h' });
}

export function verifyCashier(token: string): CashierPayload {
  const decoded = jwt.verify(token, config.jwtSecret) as CashierPayload;
  if (decoded.role !== 'cashier') throw new Error('not_cashier_token');
  return decoded;
}

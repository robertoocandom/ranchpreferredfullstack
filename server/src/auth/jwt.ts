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

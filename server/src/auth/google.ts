import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';

const client = config.googleClientId ? new OAuth2Client(config.googleClientId) : null;

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * Verifies a Google ID token server-side against Google's public keys.
 * This is the check the frontend's client-side JWT decode explicitly
 * does NOT do — never trust the client-decoded token for anything
 * security-sensitive, only this verified result.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  if (!client) {
    throw new Error('GOOGLE_CLIENT_ID is not configured on the server');
  }
  const ticket = await client.verifyIdToken({ idToken, audience: config.googleClientId! });
  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.sub) {
    throw new Error('Invalid Google ID token payload');
  }
  return { sub: payload.sub, email: payload.email, name: payload.name ?? payload.email, picture: payload.picture };
}

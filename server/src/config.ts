import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) throw new Error(`Missing required env var ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 8787),
  jwtSecret: required('JWT_SECRET', 'dev-only-secret-change-me'),
  googleClientId: process.env.GOOGLE_CLIENT_ID || null,
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()),
  fraudWebhookUrl: process.env.FRAUD_WEBHOOK_URL || null,
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || null,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || null,
};

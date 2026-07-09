const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const TOKEN_KEY = 'ranch-preferred:token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  picture: string | null;
  points: number;
  tier: 'BRONCE' | 'PLATA' | 'ORO';
  memberSince: string;
  referralCode: string;
  homeStore: string | null;
  isAdmin: boolean;
}

export interface AdminStats {
  contractors: number;
  pendingRedemptions: number;
  unresolvedAlerts: number;
  totalPoints: number;
}

export interface AdminContractor {
  id: string;
  name: string;
  email: string;
  points: number;
  tier: string;
  memberSince: string;
  homeStore: string | null;
  isAdmin: boolean;
}

export interface AdminRedemption {
  id: string;
  contractorName: string;
  contractorEmail: string;
  nameEs: string;
  nameEn: string;
  pts: number;
  dollars: number;
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED';
  createdAt: string;
  confirmedAt: string | null;
}

export interface AdminReward {
  id: string;
  nameEs: string;
  nameEn: string;
  pts: number;
  active: boolean;
}

export interface AdminAlert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  details: string;
  resolved: boolean;
  createdAt: string;
  contractorName: string | null;
  contractorEmail: string | null;
}

export interface HistoryItem {
  id: string;
  descEs: string;
  descEn: string;
  pts: number;
  balance: number;
  type: string;
  source: string;
  date: string;
}

export interface RewardDto {
  id: string;
  nameEs: string;
  nameEn: string;
  pts: number;
}

export interface StoreDto {
  id: string;
  name: string;
  address: string;
  phone: string;
  hoursEs: string;
  hoursEn: string;
  mapsUrl: string;
  tel: string;
}

export interface ReferralDto {
  id: string;
  refereeName: string;
  amount: number;
  qualified: boolean;
  pts: number;
  date: string;
}

export interface RedeemResponse {
  redemptionId: string;
  jti: string;
  qrValue: string;
  pts: number;
  dollars: number;
  nameEs: string;
  nameEn: string;
  expiresAt: string;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? 'GET',
      headers: {
        'content-type': 'application/json',
        ...(getToken() ? { authorization: `Bearer ${getToken()}` } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'network_error');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, err.error || 'request_failed');
  }
  return res.json();
}

export const api = {
  authGoogle: (idToken: string) => request<{ token: string; contractor: MeResponse }>('/auth/google', { method: 'POST', body: { idToken } }),
  authDemo: () => request<{ token: string; contractor: MeResponse }>('/auth/demo', { method: 'POST' }),
  me: () => request<MeResponse>('/me'),
  pointsHistory: () => request<HistoryItem[]>('/points/history'),
  rewards: () => request<RewardDto[]>('/rewards'),
  stores: () => request<StoreDto[]>('/stores'),
  referrals: () => request<ReferralDto[]>('/referrals'),
  redeem: (body: { rewardId?: string; customPts?: number }) => request<RedeemResponse>('/redeem', { method: 'POST', body }),
  confirmRedeem: (jti: string) => request<{ points: number }>('/redeem/confirm', { method: 'POST', body: { jti } }),
  activate: () => request<{ jti: string; qrValue: string; expiresAt: string }>('/activate', { method: 'POST' }),
  adminStats: () => request<AdminStats>('/admin/stats'),
  adminContractors: () => request<AdminContractor[]>('/admin/contractors'),
  adminRedemptions: (status?: string) => request<AdminRedemption[]>(`/admin/redemptions${status ? `?status=${status}` : ''}`),
  adminConfirmRedemption: (id: string) => request<{ ok: boolean }>(`/admin/redemptions/${id}/confirm`, { method: 'POST' }),
  adminRewards: () => request<AdminReward[]>('/admin/rewards'),
  adminCreateReward: (body: { nameEs: string; nameEn: string; pts: number }) => request<AdminReward>('/admin/rewards', { method: 'POST', body }),
  adminUpdateReward: (id: string, body: Partial<{ nameEs: string; nameEn: string; pts: number; active: boolean }>) => request<AdminReward>(`/admin/rewards/${id}`, { method: 'PATCH', body }),
  adminAlerts: () => request<AdminAlert[]>('/admin/fraud-alerts'),
  adminResolveAlert: (id: string) => request<{ ok: boolean }>(`/admin/fraud-alerts/${id}/resolve`, { method: 'PATCH' }),
};

export { ApiError };

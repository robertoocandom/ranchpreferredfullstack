import { useEffect, useState } from 'react';
import { Users, ShoppingBag, Gift, AlertTriangle, CheckCircle, XCircle, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { api, type AdminStats, type AdminRedemption, type AdminReward, type AdminAlert, type AdminContractor } from '../api/client';
import { colors, font } from '../theme';

type AdminTab = 'dashboard' | 'redemptions' | 'rewards' | 'alerts';

const badge = (severity: string) => {
  const map: Record<string, string> = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#6b7280' };
  return map[severity] ?? '#6b7280';
};

const statusColor: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#22c55e',
  EXPIRED: '#6b7280',
};

export function AdminScreen() {
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [redemptions, setRedemptions] = useState<AdminRedemption[]>([]);
  const [rewards, setRewards] = useState<AdminReward[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [contractors, setContractors] = useState<AdminContractor[]>([]);
  const [loading, setLoading] = useState(false);

  // New reward form
  const [newReward, setNewReward] = useState({ nameEs: '', nameEn: '', pts: '' });
  const [showNewReward, setShowNewReward] = useState(false);

  const load = async (t: AdminTab) => {
    setLoading(true);
    try {
      if (t === 'dashboard') {
        const [s, c] = await Promise.all([api.adminStats(), api.adminContractors()]);
        setStats(s);
        setContractors(c);
      } else if (t === 'redemptions') {
        setRedemptions(await api.adminRedemptions());
      } else if (t === 'rewards') {
        setRewards(await api.adminRewards());
      } else if (t === 'alerts') {
        setAlerts(await api.adminAlerts());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(tab); }, [tab]);

  const confirmRedemption = async (id: string) => {
    await api.adminConfirmRedemption(id);
    setRedemptions((prev) => prev.map((r) => r.id === id ? { ...r, status: 'CONFIRMED' as const, confirmedAt: new Date().toISOString() } : r));
  };

  const toggleReward = async (r: AdminReward) => {
    const updated = await api.adminUpdateReward(r.id, { active: !r.active });
    setRewards((prev) => prev.map((x) => x.id === r.id ? updated : x));
  };

  const createReward = async () => {
    if (!newReward.nameEs || !newReward.nameEn || !newReward.pts) return;
    const created = await api.adminCreateReward({ nameEs: newReward.nameEs, nameEn: newReward.nameEn, pts: Number(newReward.pts) });
    setRewards((prev) => [...prev, created]);
    setNewReward({ nameEs: '', nameEn: '', pts: '' });
    setShowNewReward(false);
  };

  const resolveAlert = async (id: string) => {
    await api.adminResolveAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const TABS: Array<{ key: AdminTab; label: string; icon: typeof Users }> = [
    { key: 'dashboard', label: 'Dashboard', icon: Users },
    { key: 'redemptions', label: 'Canjes', icon: ShoppingBag },
    { key: 'rewards', label: 'Premios', icon: Gift },
    { key: 'alerts', label: 'Alertas', icon: AlertTriangle },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: colors.dark, fontFamily: font }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 0', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: -0.3 }}>
          Panel Admin
        </h1>
        <p style={{ margin: '2px 0 12px', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Ranch Preferred</p>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 0 }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '8px 4px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${tab === key ? colors.orange : 'transparent'}`,
                color: tab === key ? colors.orange : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                fontSize: 9,
                fontFamily: font,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.3,
              }}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {loading && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, paddingTop: 40 }}>
            Cargando...
          </div>
        )}

        {/* Dashboard */}
        {tab === 'dashboard' && !loading && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Contratistas', value: stats.contractors, color: '#3b82f6' },
                { label: 'Canjes pendientes', value: stats.pendingRedemptions, color: colors.orange },
                { label: 'Puntos activos', value: stats.totalPoints.toLocaleString(), color: '#22c55e' },
                { label: 'Alertas', value: stats.unresolvedAlerts, color: '#ef4444' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 12px' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            <h3 style={{ color: 'white', fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>Top contratistas</h3>
            {contractors.slice(0, 10).map((c) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{c.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: colors.orange }}>{c.points}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{c.tier}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Redemptions */}
        {tab === 'redemptions' && !loading && (
          <div>
            {redemptions.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', paddingTop: 32 }}>Sin canjes</p>
            )}
            {redemptions.map((r) => (
              <div key={r.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{r.contractorName}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{r.nameEs}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{r.pts} pts · ${r.dollars}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                      {new Date(r.createdAt).toLocaleDateString('es-MX')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: statusColor[r.status], background: `${statusColor[r.status]}22`, padding: '2px 7px', borderRadius: 6 }}>
                      {r.status}
                    </span>
                    {r.status === 'PENDING' && (
                      <button
                        onClick={() => void confirmRedemption(r.id)}
                        style={{ background: '#22c55e', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: 'white', cursor: 'pointer', fontFamily: font }}
                      >
                        Confirmar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rewards */}
        {tab === 'rewards' && !loading && (
          <div>
            <button
              onClick={() => setShowNewReward((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: colors.orange, border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, color: colors.dark, cursor: 'pointer', fontFamily: font, marginBottom: 12 }}
            >
              <Plus size={14} /> Nuevo Premio
            </button>

            {showNewReward && (
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                {(['nameEs', 'nameEn', 'pts'] as const).map((field) => (
                  <input
                    key={field}
                    placeholder={field === 'nameEs' ? 'Nombre (ES)' : field === 'nameEn' ? 'Name (EN)' : 'Puntos'}
                    value={newReward[field]}
                    onChange={(e) => setNewReward((p) => ({ ...p, [field]: e.target.value }))}
                    type={field === 'pts' ? 'number' : 'text'}
                    style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 10px', color: 'white', fontSize: 13, fontFamily: font, marginBottom: 6, boxSizing: 'border-box' }}
                  />
                ))}
                <button
                  onClick={() => void createReward()}
                  style={{ background: colors.orange, border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, color: colors.dark, cursor: 'pointer', fontFamily: font }}
                >
                  Crear
                </button>
              </div>
            )}

            {rewards.map((r) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 12px', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, color: r.active ? 'white' : 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{r.nameEs}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{r.pts} pts</div>
                </div>
                <button
                  onClick={() => void toggleReward(r)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: r.active ? '#22c55e' : '#6b7280', padding: 4 }}
                >
                  {r.active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Fraud Alerts */}
        {tab === 'alerts' && !loading && (
          <div>
            {alerts.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 40 }}>
                <CheckCircle size={36} color='#22c55e' />
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 8 }}>Sin alertas activas</p>
              </div>
            )}
            {alerts.map((a) => (
              <div key={a.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12, marginBottom: 8, borderLeft: `3px solid ${badge(a.severity)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: badge(a.severity), background: `${badge(a.severity)}22`, padding: '1px 6px', borderRadius: 4 }}>{a.severity}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{a.type}</span>
                    </div>
                    {a.contractorName && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{a.contractorName}</div>}
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{a.details}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>{new Date(a.createdAt).toLocaleString('es-MX')}</div>
                  </div>
                  <button
                    onClick={() => void resolveAlert(a.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', padding: 4, flexShrink: 0 }}
                    title="Resolver"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

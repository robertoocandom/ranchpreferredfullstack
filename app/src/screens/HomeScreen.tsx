import { QrCode, Gift, Users, DollarSign, Truck, Zap } from 'lucide-react';
import { colors, font } from '../theme';
import { useAppState } from '../state/AppStateContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import { TierPill } from '../components/TierPill';
import { weeklyOffer, contractor } from '../data/sampleData';
import { tiers } from '../data/tiers';
import logoRanch from '../assets/logo-ranch.png';

function QuickAction({ icon: Icon, label, onClick }: { icon: typeof QrCode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: colors.dark,
        border: 'none',
        borderRadius: 14,
        padding: '14px 4px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        cursor: 'pointer',
      }}
    >
      <Icon size={22} color={colors.orange} strokeWidth={2} />
      <span
        style={{
          fontFamily: font,
          fontSize: 9,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.85)',
          textAlign: 'center',
          lineHeight: 1.3,
          textTransform: 'uppercase',
          whiteSpace: 'pre-line',
        }}
      >
        {label}
      </span>
    </button>
  );
}

function locationLabel(type: string, lang: 'es' | 'en', homeStore: string | null): string {
  if (type === 'REFERRAL') return lang === 'es' ? 'Referidos' : 'Referrals';
  if (type === 'ODOO_SYNC') return 'Odoo';
  return homeStore ?? '—';
}

export function HomeScreen() {
  const { setActiveTab, currentPoints, tier, pointsHistory, me, openReferScreen } = useAppState();
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const oro = tiers.find((tr) => tr.key === 'ORO')!;
  const pctToOro = Math.min(100, Math.round((currentPoints / oro.min) * 100));
  const ptsToOro = Math.max(0, oro.min - currentPoints);
  const recentActivity = pointsHistory.slice(0, 3);
  const dateFmt = new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' });

  return (
    <div style={{ animation: 'fadeUp 0.2s ease' }}>
      {/* Header */}
      <div style={{ background: colors.dark, padding: '16px 20px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ background: 'white', borderRadius: 8, padding: '5px 10px', display: 'inline-block', marginBottom: 7 }}>
              <img src={logoRanch} style={{ height: 30, width: 'auto', display: 'block' }} alt="The Ranch Fence Supply" />
            </div>
            <div style={{ fontFamily: font, fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 2, textTransform: 'uppercase' }}>
              {t('preferredRewards')}
            </div>
          </div>
          <TierPill tier={tier} />
        </div>
        <div style={{ fontFamily: font, fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{t('welcomeBack')}</div>
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: 28, color: 'white', lineHeight: 1.1 }}>
          {user?.name ?? contractor.name}
        </div>
      </div>

      {/* Points card */}
      <div style={{ margin: '-14px 16px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '18px 20px', boxShadow: '0 6px 24px rgba(0,0,0,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: colors.gray400, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>
                {t('tuPuntos')}
              </div>
              <div style={{ fontFamily: font, fontWeight: 900, fontSize: 52, color: colors.orange, lineHeight: 0.9, letterSpacing: -2 }}>
                {currentPoints}
              </div>
            </div>
            <div style={{ textAlign: 'right', paddingTop: 4 }}>
              <div style={{ fontFamily: font, fontSize: 10, color: colors.gray400, marginBottom: 2 }}>{t('proximoNivel')}</div>
              <div style={{ fontFamily: font, fontWeight: 900, fontSize: 20, color: colors.gold, letterSpacing: 1 }}>{oro.label[lang]}</div>
              <div style={{ fontFamily: font, fontSize: 11, color: colors.gray500, marginTop: 2 }}>
                {ptsToOro} {t('ptsMas')}
              </div>
            </div>
          </div>
          <div style={{ background: colors.cardBg, borderRadius: 99, height: 7, overflow: 'hidden', marginBottom: 5 }}>
            <div style={{ width: `${pctToOro}%`, height: '100%', background: `linear-gradient(90deg,${colors.orange},#F5A623)`, borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: font, fontSize: 10, color: colors.gray400 }}>
              {currentPoints.toLocaleString()} / {oro.min.toLocaleString()} {t('ptsParaOro')}
            </span>
            <span style={{ fontFamily: font, fontSize: 10, fontWeight: 700, color: colors.orange }}>{pctToOro}%</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '18px 16px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          <QuickAction icon={QrCode} label={t('qaActivar')} onClick={() => setActiveTab('activate')} />
          <QuickAction icon={Gift} label={t('qaCanjear')} onClick={() => setActiveTab('points')} />
          <QuickAction icon={Users} label={t('qaReferir')} onClick={openReferScreen} />
          <QuickAction icon={DollarSign} label={t('qaCotizar')} onClick={() => setActiveTab('stores')} />
        </div>
      </div>

      {/* Oferta de la semana */}
      <div style={{ padding: '6px 16px 0' }}>
        <div style={{ background: `linear-gradient(135deg,${colors.orange} 0%,${colors.orangeDark} 100%)`, borderRadius: 16, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', right: -20, top: -35, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: font, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>
            <Zap size={11} fill="rgba(255,255,255,0.7)" color="rgba(255,255,255,0.7)" /> {t('ofertaSemana')}
          </div>
          <div style={{ fontFamily: font, fontWeight: 900, fontSize: 22, color: 'white', lineHeight: 1.1, marginBottom: 6, whiteSpace: 'pre-line' }}>
            {lang === 'es' ? weeklyOffer.titleEs : weeklyOffer.titleEn}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
            <span style={{ fontFamily: font, fontWeight: 900, fontSize: 32, color: 'white', lineHeight: 1, letterSpacing: -1 }}>
              ${weeklyOffer.price.toFixed(2)}
            </span>
            <span style={{ fontFamily: font, fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'line-through' }}>
              ${weeklyOffer.originalPrice.toFixed(2)}
            </span>
            <span style={{ fontFamily: font, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              {lang === 'es' ? weeklyOffer.unitEs : weeklyOffer.unitEn}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('stores')}
            style={{ background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 8, padding: '9px 16px', fontFamily: font, fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {t('verEnTienda')}
          </button>
        </div>
      </div>

      {/* Actividad reciente */}
      <div style={{ padding: '20px 16px 20px' }}>
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: 17, color: colors.dark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          {t('actividadReciente')}
        </div>
        {recentActivity.map((item, i) => (
          <div
            key={item.id}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: '13px 15px',
              marginBottom: i === recentActivity.length - 1 ? 0 : 8,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ width: 38, height: 38, background: 'rgba(243,112,33,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item.type === 'REFERRAL' ? <Users size={16} color={colors.orange} /> : <Truck size={16} color={colors.orange} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: colors.dark }}>{lang === 'es' ? item.descEs : item.descEn}</div>
              <div style={{ fontFamily: font, fontSize: 11, color: colors.gray400, marginTop: 1 }}>
                {dateFmt.format(new Date(item.date))} · {locationLabel(item.type, lang, me?.homeStore ?? null)}
              </div>
            </div>
            <span style={{ fontFamily: font, fontWeight: 800, fontSize: 16, color: item.pts < 0 ? colors.red : colors.green, flexShrink: 0 }}>
              {item.pts > 0 ? '+' : ''}
              {item.pts} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

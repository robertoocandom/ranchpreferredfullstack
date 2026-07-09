import { Gift, Star, Minus, Plus, QrCode as QrIcon, Users, Check } from 'lucide-react';
import { colors, font } from '../theme';
import { useAppState } from '../state/AppStateContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Bold } from '../components/Bold';
import { tiers } from '../data/tiers';

function TierCard({ tier, current }: { tier: (typeof tiers)[number]; current: boolean }) {
  const { lang, t } = useLanguage();
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 10,
        boxShadow: current ? '0 2px 10px rgba(0,0,0,0.1)' : '0 1px 6px rgba(0,0,0,0.07)',
        border: current ? `1.5px solid ${colors.silver}` : undefined,
      }}
    >
      <div style={{ background: tier.gradient, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={16} fill={tier.key === 'BRONCE' ? colors.bronze : 'white'} color={tier.key === 'BRONCE' ? colors.bronze : 'white'} />
          <span style={{ fontFamily: font, fontWeight: 800, fontSize: 16, color: 'white', letterSpacing: 0.5 }}>{tier.label[lang]}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {current && (
            <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: '2px 10px' }}>
              <span style={{ fontFamily: font, fontSize: 10, fontWeight: 700, color: 'white' }}>{t('tuNivelActual')}</span>
            </div>
          )}
          <span style={{ fontFamily: font, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            {tier.max ? `${tier.min} – ${tier.max} pts` : `${tier.min.toLocaleString()}+ pts`}
          </span>
        </div>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {tier.benefits.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: tier.accent, flexShrink: 0 }} />
            <span style={{ fontFamily: font, fontSize: 13, color: colors.gray700 }}>
              <Bold text={b[lang]} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PointsScreen() {
  const {
    currentPoints,
    tier,
    me,
    pointsHistory,
    rewards,
    referrals,
    openRewardRedeem,
    customRedeemPts,
    incCustom,
    decCustom,
    openCustomRedeem,
    referralCopied,
    copyReferral,
  } = useAppState();
  const { t, lang } = useLanguage();

  const oro = tiers.find((tr) => tr.key === 'ORO')!;
  const ptsToOro = Math.max(0, oro.min - currentPoints);
  const customDollars = Math.round(customRedeemPts / 10);
  const totalReferralPts = referrals.reduce((sum, r) => sum + r.pts, 0);
  const referralUrl = `ranchpreferred.com/ref/${me?.referralCode ?? ''}`;
  const dateFmt = new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' });

  return (
    <div style={{ animation: 'fadeUp 0.2s ease' }}>
      <div style={{ background: colors.dark, padding: '16px 20px 26px' }}>
        <div style={{ fontFamily: font, fontWeight: 900, fontSize: 26, color: 'white', textTransform: 'uppercase', lineHeight: 1, marginBottom: 2 }}>
          {t('puntosPremios')}
        </div>
        <div style={{ fontFamily: font, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{t('historialRecompensas')}</div>
      </div>

      {/* Balance */}
      <div style={{ margin: '-14px 16px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '16px 18px', boxShadow: '0 6px 24px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: font, fontSize: 10, fontWeight: 700, color: colors.gray400, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 2 }}>
              {t('balance')}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: font, fontWeight: 900, fontSize: 40, color: colors.orange, lineHeight: 0.95, letterSpacing: -1.5 }}>
                {currentPoints}
              </span>
              <span style={{ fontFamily: font, fontSize: 14, color: colors.gray400 }}>pts</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ border: '1.5px solid rgba(168,169,173,0.4)', borderRadius: 20, padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 6, background: 'rgba(168,169,173,0.08)' }}>
              <Star size={10} fill={colors.silver} color={colors.silver} />
              <span style={{ fontFamily: font, fontWeight: 800, fontSize: 13, color: colors.silver, letterSpacing: 0.5 }}>
                {tiers.find((tr) => tr.key === tier)!.label[lang]}
              </span>
            </div>
            <div style={{ fontFamily: font, fontSize: 11, color: colors.gray400 }}>
              {ptsToOro} {t('ptsMas')} <span style={{ color: colors.gold, fontWeight: 700 }}>{oro.label[lang]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div style={{ padding: '22px 16px 4px' }}>
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: 17, color: colors.dark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          {t('historialPuntos')}
        </div>
        {pointsHistory.map((item) => (
          <div key={item.id} style={{ background: 'white', borderRadius: 12, padding: '12px 14px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.pts < 0 ? colors.red : item.type === 'BONUS' ? colors.orange : colors.green, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: colors.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {lang === 'es' ? item.descEs : item.descEn}
              </div>
              <div style={{ fontFamily: font, fontSize: 10, color: colors.gray400, marginTop: 1 }}>{dateFmt.format(new Date(item.date))}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: font, fontWeight: 800, fontSize: 15, color: item.pts < 0 ? colors.red : colors.green }}>
                {item.pts > 0 ? '+' : ''}
                {item.pts} pts
              </div>
              <div style={{ fontFamily: font, fontSize: 10, color: colors.gray400 }}>bal: {item.balance}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tier benefits */}
      <div style={{ padding: '12px 16px 4px' }}>
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: 17, color: colors.dark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          {t('beneficiosNivel')}
        </div>
        {tiers.map((tr) => (
          <TierCard key={tr.key} tier={tr} current={tr.key === tier} />
        ))}
      </div>

      {/* Rewards */}
      <div style={{ padding: '12px 16px 4px' }}>
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: 17, color: colors.dark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          {t('canjearPuntos')}
        </div>
        {rewards.map((rw) => {
          const ok = currentPoints >= rw.pts;
          return (
            <div
              key={rw.id}
              style={{ background: 'white', borderRadius: 14, padding: 14, marginBottom: 9, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', opacity: ok ? 1 : 0.45 }}
            >
              <div style={{ width: 42, height: 42, background: ok ? 'rgba(243,112,33,0.1)' : colors.cardBg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Gift size={18} color={ok ? colors.orange : colors.gray400} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: font, fontSize: 13, fontWeight: 700, color: colors.dark, lineHeight: 1.3, paddingRight: 4 }}>
                  {lang === 'es' ? rw.nameEs : rw.nameEn}
                </div>
                <div style={{ fontFamily: font, fontSize: 13, fontWeight: 700, color: colors.orange, marginTop: 2 }}>
                  {rw.pts} {t('puntos')}
                </div>
              </div>
              <button
                onClick={() => void openRewardRedeem(rw.id)}
                disabled={!ok}
                style={{ background: ok ? colors.orange : '#E5E7EB', border: 'none', borderRadius: 10, padding: '8px 14px', fontFamily: font, fontSize: 12, fontWeight: 700, color: ok ? colors.dark : colors.gray400, cursor: ok ? 'pointer' : 'not-allowed', textTransform: 'uppercase', flexShrink: 0 }}
              >
                {t('canjear')}
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom redeem */}
      <div style={{ padding: '0 16px 4px' }}>
        <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
          <div style={{ fontFamily: font, fontWeight: 800, fontSize: 15, color: colors.dark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            {t('canjePorMonto')}
          </div>
          <div style={{ fontFamily: font, fontSize: 12, color: colors.gray400, marginBottom: 16 }}>{t('canjePorMontoSub')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <button onClick={decCustom} style={{ width: 44, height: 44, background: colors.cardBg, border: 'none', borderRadius: 12, color: colors.dark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Minus size={20} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: font, fontWeight: 900, fontSize: 36, color: colors.orange, lineHeight: 1, letterSpacing: -1 }}>{customRedeemPts}</div>
              <div style={{ fontFamily: font, fontSize: 11, color: colors.gray400, marginTop: 2 }}>{t('puntos')}</div>
            </div>
            <button onClick={incCustom} style={{ width: 44, height: 44, background: colors.cardBg, border: 'none', borderRadius: 12, color: colors.dark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} />
            </button>
          </div>
          <div style={{ background: colors.cardBg, borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: font, fontSize: 13, color: colors.gray500 }}>{t('valorEnTienda')}</span>
            <span style={{ fontFamily: font, fontWeight: 800, fontSize: 18, color: colors.dark }}>${customDollars}.00</span>
          </div>
          <button
            onClick={() => void openCustomRedeem()}
            disabled={currentPoints < customRedeemPts}
            style={{
              width: '100%',
              background: currentPoints >= customRedeemPts ? colors.orange : '#E5E7EB',
              border: 'none',
              borderRadius: 12,
              padding: 13,
              fontFamily: font,
              fontSize: 14,
              fontWeight: 700,
              color: currentPoints >= customRedeemPts ? colors.dark : colors.gray400,
              cursor: currentPoints >= customRedeemPts ? 'pointer' : 'not-allowed',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <QrIcon size={16} strokeWidth={2.5} />
            {t('generarQRCanje')}
          </button>
        </div>
      </div>

      {/* Referidos */}
      <div style={{ padding: '12px 16px 24px' }}>
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: 17, color: colors.dark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          {t('referidos')}
        </div>
        <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 42, height: 42, background: 'rgba(243,112,33,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={18} color={colors.orange} />
            </div>
            <div>
              <div style={{ fontFamily: font, fontSize: 14, fontWeight: 700, color: colors.dark, marginBottom: 3 }}>{t('refiereContractor')}</div>
              <div style={{ fontFamily: font, fontSize: 12, color: colors.gray500, lineHeight: 1.5 }}>{t('refiereContractorSub', { n: 25 })}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: colors.cardBg, borderRadius: 10, padding: '10px 12px', marginBottom: 12, gap: 8 }}>
            <span style={{ fontFamily: font, fontSize: 11, color: colors.gray500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {referralUrl}
            </span>
            <button onClick={copyReferral} style={{ background: colors.orange, border: 'none', borderRadius: 7, padding: '6px 12px', fontFamily: font, fontSize: 11, fontWeight: 700, color: colors.dark, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', minWidth: 70 }}>
              {referralCopied ? t('copiado') : t('copiar')}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={14} color={colors.green} strokeWidth={2.5} />
            <span style={{ fontFamily: font, fontSize: 12, color: colors.gray500 }}>
              {t('referidosCompletados', { n: referrals.length, pts: totalReferralPts })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Share2, Star } from 'lucide-react';
import { colors, font, tierColor } from '../theme';
import { useAppState } from '../state/AppStateContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import { QRCode } from '../components/QRCode';
import { api } from '../api/client';
import { contractor } from '../data/sampleData';
import { tiers } from '../data/tiers';

export function ActivateScreen() {
  const { currentPoints, tier, me } = useAppState();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const tierInfo = tiers.find((tr) => tr.key === tier)!;
  const name = user?.name ?? contractor.name;

  const [qrValue, setQrValue] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void api.activate().then((res) => {
      if (!cancelled) setQrValue(res.qrValue);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const share = async () => {
    if (navigator.share && qrValue) {
      try {
        await navigator.share({ title: 'Ranch Preferred', text: `${name} · ${me?.id ?? ''}`, url: `https://${qrValue}` });
      } catch {
        // user cancelled share sheet — nothing to do
      }
    }
  };

  return (
    <div style={{ animation: 'fadeUp 0.2s ease', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: colors.dark, padding: '16px 20px 20px' }}>
        <div style={{ fontFamily: font, fontWeight: 900, fontSize: 26, color: 'white', textTransform: 'uppercase', lineHeight: 1, marginBottom: 2 }}>
          {t('activarCompra')}
        </div>
        <div style={{ fontFamily: font, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{t('muestraEsteCodigo')}</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 24px' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 8, borderRadius: 10, border: `2px solid ${colors.cardBg}`, minHeight: 196, minWidth: 196, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {qrValue && <QRCode value={qrValue} size={196} />}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: font, fontWeight: 900, fontSize: 22, color: colors.dark, lineHeight: 1.1 }}>{name}</div>
            <div style={{ fontFamily: font, fontSize: 12, color: colors.gray400, letterSpacing: 1.5, marginTop: 3 }}>
              {t('idLabel')}: {me?.id.slice(0, 12) ?? ''}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 8,
                background: `${tierInfo.accent}1a`,
                border: `1px solid ${tierInfo.accent}4d`,
                borderRadius: 20,
                padding: '4px 12px',
              }}
            >
              <Star size={10} fill={tierInfo.accent} color={tierInfo.accent} />
              <span style={{ fontFamily: font, fontWeight: 700, fontSize: 12, color: tierInfo.accent, letterSpacing: 0.5 }}>
                {tierInfo.label[lang]} · {currentPoints} {t('puntos').toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={() => void share()}
            style={{
              width: '100%',
              background: colors.orange,
              border: 'none',
              borderRadius: 12,
              padding: 14,
              fontFamily: font,
              fontSize: 14,
              fontWeight: 700,
              color: colors.dark,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            <Share2 size={16} strokeWidth={2.5} />
            {t('compartirQR')}
          </button>
        </div>
        <div style={{ marginTop: 16, background: 'rgba(0,0,0,0.05)', borderRadius: 12, padding: '12px 16px', textAlign: 'center', width: '100%' }}>
          <div style={{ fontFamily: font, fontSize: 12, color: colors.gray500, lineHeight: 1.6 }}>{t('qrFootnote')}</div>
        </div>
      </div>

      <div style={{ background: colors.dark, padding: '12px 20px', flexShrink: 0 }}>
        <div style={{ fontFamily: font, fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.9 }}>
          {t('ganasFootnote', {
            b: `1 pto/$10`,
            p: `1.5 ptos/$10`,
            o: `2 ptos/$10`,
          })
            .split(/(1 pto\/\$10|1\.5 ptos\/\$10|2 ptos\/\$10)/)
            .map((part, i) => {
              if (part === '1 pto/$10') return <span key={i} style={{ color: tierColor.BRONCE, fontWeight: 700 }}>{part}</span>;
              if (part === '1.5 ptos/$10') return <span key={i} style={{ color: tierColor.PLATA, fontWeight: 700 }}>{part}</span>;
              if (part === '2 ptos/$10') return <span key={i} style={{ color: tierColor.ORO, fontWeight: 700 }}>{part}</span>;
              return <span key={i}>{part}</span>;
            })}
        </div>
      </div>
    </div>
  );
}

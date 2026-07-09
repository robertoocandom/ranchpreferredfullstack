import { X } from 'lucide-react';
import { colors, font } from '../theme';
import { useAppState } from '../state/AppStateContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Sheet } from '../components/Sheet';
import { QRCode } from '../components/QRCode';

export function RedeemModal() {
  const { redeemModal, closeRedeemModal, confirmRedeem } = useAppState();
  const { t, lang } = useLanguage();

  if (!redeemModal) return null;

  return (
    <Sheet onDismiss={closeRedeemModal} zIndex={70}>
      <div style={{ background: colors.dark, borderRadius: '24px 24px 0 0', padding: '18px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <div style={{ fontFamily: font, fontWeight: 800, fontSize: 18, color: 'white', lineHeight: 1.2 }}>{lang === 'es' ? redeemModal.nameEs : redeemModal.nameEn}</div>
            <div style={{ fontFamily: font, fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
              {t('costoLabel')}: <span style={{ color: colors.orange, fontWeight: 700 }}>{redeemModal.pts} {t('puntos')}</span>
            </div>
          </div>
          <button onClick={closeRedeemModal} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={18} color="white" />
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 24px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ padding: 10, background: 'white', borderRadius: 12, border: `2px solid ${colors.cardBg}`, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <QRCode value={redeemModal.qrValue} size={176} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: font, fontWeight: 800, fontSize: 28, color: colors.dark, letterSpacing: -1 }}>${redeemModal.dollars}.00 USD</div>
          <div style={{ fontFamily: font, fontSize: 12, color: colors.gray400, marginTop: 3 }}>
            {t('creditoTienda')} · {t('validoHoras')}
          </div>
        </div>
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '10px 14px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontFamily: font, fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
            {t('muestraQrCaja')}
            <br />
            {t('seDescontaran', { pts: redeemModal.pts })}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 24px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => void confirmRedeem()}
          style={{ width: '100%', background: colors.orange, border: 'none', borderRadius: 12, padding: 15, fontFamily: font, fontSize: 15, fontWeight: 700, color: colors.dark, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {t('confirmarCanje')} — {redeemModal.pts} pts
        </button>
        <button
          onClick={closeRedeemModal}
          style={{ width: '100%', background: 'transparent', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: 13, fontFamily: font, fontSize: 14, fontWeight: 600, color: colors.gray400, cursor: 'pointer' }}
        >
          {t('cancelar')}
        </button>
      </div>
    </Sheet>
  );
}

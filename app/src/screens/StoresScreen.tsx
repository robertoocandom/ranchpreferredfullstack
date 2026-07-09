import { Navigation, Phone } from 'lucide-react';
import { colors, font } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';
import { useAppState } from '../state/AppStateContext';
import { colorSwatches } from '../data/sampleData';
import logoGoodFace from '../assets/logo-goodface.png';

export function StoresScreen() {
  const { t, lang } = useLanguage();
  const { stores, me } = useAppState();

  return (
    <div style={{ animation: 'fadeUp 0.2s ease' }}>
      <div style={{ background: colors.dark, padding: '16px 20px 20px' }}>
        <div style={{ fontFamily: font, fontWeight: 900, fontSize: 26, color: 'white', textTransform: 'uppercase', lineHeight: 1, marginBottom: 2 }}>
          {t('tiendasCatalogo')}
        </div>
        <div style={{ fontFamily: font, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{t('ubicaciones')}</div>
      </div>

      <div style={{ padding: '16px 16px 4px' }}>
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: 17, color: colors.dark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          {t('nuestrasTiendas')}
        </div>
        {stores.map((store) => {
          const isHome = store.name === me?.homeStore;
          return (
            <div key={store.id} style={{ background: 'white', borderRadius: 12, padding: '14px 15px', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: isHome ? colors.orange : colors.green, flexShrink: 0 }} />
                  <span style={{ fontFamily: font, fontWeight: 800, fontSize: 17, color: colors.dark }}>
                    {store.name}
                    {isHome ? ' ★' : ''}
                  </span>
                </div>
                <span style={{ fontFamily: font, fontSize: 10, color: colors.gray400, background: colors.cardBg, borderRadius: 5, padding: '3px 7px', whiteSpace: 'nowrap' }}>
                  {lang === 'es' ? store.hoursEs : store.hoursEn}
                </span>
              </div>
              <div style={{ fontFamily: font, fontSize: 12, color: colors.gray500, marginBottom: 3, paddingLeft: 16 }}>{store.address}</div>
              <div style={{ fontFamily: font, fontSize: 12, color: colors.gray500, paddingLeft: 16, marginBottom: 10 }}>{store.phone}</div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                <a
                  href={store.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: colors.dark, borderRadius: 8, padding: '7px 14px', fontFamily: font, fontSize: 11, fontWeight: 700, color: 'white', textDecoration: 'none', textTransform: 'uppercase' }}
                >
                  <Navigation size={12} strokeWidth={2.5} />
                  {t('comoLlegar')}
                </a>
                <a
                  href={store.tel}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: colors.orange, borderRadius: 8, padding: '7px 14px', fontFamily: font, fontSize: 11, fontWeight: 700, color: colors.dark, textDecoration: 'none', textTransform: 'uppercase' }}
                >
                  <Phone size={12} strokeWidth={2.5} />
                  {t('llamar')}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '12px 16px 24px' }}>
        <div style={{ background: colors.dark, borderRadius: 14, padding: 16, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={logoGoodFace} style={{ width: 72, height: 72, objectFit: 'contain', flexShrink: 0, borderRadius: 8 }} alt="Good Face Wood Stain" />
          <div>
            <div style={{ fontFamily: font, fontWeight: 900, fontSize: 18, color: 'white', lineHeight: 1, marginBottom: 3, textTransform: 'uppercase' }}>
              Good Face Wood Stain
            </div>
            <div style={{ fontFamily: font, fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 8, fontStyle: 'italic' }}>
              {t('goodFaceSlogan')}
            </div>
            <div style={{ fontFamily: font, fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {t('goodFaceTag')}
            </div>
          </div>
        </div>
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: 17, color: colors.dark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
          {t('materialStained')}
        </div>
        <div style={{ fontFamily: font, fontSize: 12, color: colors.gray400, marginBottom: 12 }}>{t('cartaColores')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {colorSwatches.map((c) => (
            <div key={c.name.en} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
              <div style={{ height: 72, background: c.hex, borderBottom: c.hex === '#EDE8E1' ? '1px solid #E5E7EB' : undefined }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontFamily: font, fontSize: 13, fontWeight: 700, color: colors.dark, marginBottom: 6 }}>{c.name[lang]}</div>
                <span
                  style={{
                    background: c.status === 'in' ? 'rgba(22,163,74,0.1)' : 'rgba(234,179,8,0.1)',
                    color: c.status === 'in' ? colors.green : '#B45309',
                    fontFamily: font,
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 5,
                    padding: '2px 8px',
                    display: 'inline-block',
                    marginBottom: 8,
                  }}
                >
                  {c.status === 'in' ? t('disponible') : t('bajoStock')}
                </span>
                <button style={{ width: '100%', background: colors.orange, border: 'none', borderRadius: 7, padding: 7, fontFamily: font, fontSize: 10, fontWeight: 700, color: colors.dark, cursor: 'pointer', textTransform: 'uppercase' }}>
                  {t('cotizar')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

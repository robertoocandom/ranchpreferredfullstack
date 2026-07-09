import { Star, LogOut } from 'lucide-react';
import { colors, font } from '../theme';
import { useAppState } from '../state/AppStateContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import { Toggle } from '../components/Toggle';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { advisor, contractor } from '../data/sampleData';
import { tiers } from '../data/tiers';

export function AccountScreen() {
  const { tier, currentPoints, me, notifPromos, notifPuntos, notifTiendas, notifReferidos, toggleNotif, openMessage } = useAppState();
  const { t, lang, toggleLang } = useLanguage();
  const { user, signOut } = useAuth();

  const tierInfo = tiers.find((tr) => tr.key === tier)!;
  const name = user?.name ?? contractor.name;
  const email = user?.email ?? contractor.email;
  const memberSinceFmt = me ? new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' }).format(new Date(me.memberSince)) : '';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const notifRows: Array<{ key: 'notifPromos' | 'notifPuntos' | 'notifTiendas' | 'notifReferidos'; titleKey: 'notifPromos' | 'notifPuntos' | 'notifTiendas' | 'notifReferidos'; subKey: 'notifPromosSub' | 'notifPuntosSub' | 'notifTiendasSub' | 'notifReferidosSub'; on: boolean }> = [
    { key: 'notifPromos', titleKey: 'notifPromos', subKey: 'notifPromosSub', on: notifPromos },
    { key: 'notifPuntos', titleKey: 'notifPuntos', subKey: 'notifPuntosSub', on: notifPuntos },
    { key: 'notifTiendas', titleKey: 'notifTiendas', subKey: 'notifTiendasSub', on: notifTiendas },
    { key: 'notifReferidos', titleKey: 'notifReferidos', subKey: 'notifReferidosSub', on: notifReferidos },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.2s ease' }}>
      {/* Profile */}
      <div style={{ background: colors.dark, padding: '20px 20px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: 'rgba(243,112,33,0.06)', right: -30, top: -40, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          {user?.picture ? (
            <img src={user.picture} alt={name} style={{ width: 60, height: 60, borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 0 3px rgba(243,112,33,0.3)', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg,${colors.orange},${colors.orangeDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 0 3px rgba(243,112,33,0.3)' }}>
              <span style={{ fontFamily: font, fontWeight: 900, fontSize: 22, color: 'white' }}>{initials}</span>
            </div>
          )}
          <div>
            <div style={{ fontFamily: font, fontWeight: 900, fontSize: 22, color: 'white', lineHeight: 1.1 }}>{name}</div>
            <div style={{ fontFamily: font, fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{email}</div>
            <div style={{ fontFamily: font, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
              {t('miembroDesde')} {memberSinceFmt}
            </div>
          </div>
        </div>

        {/* Tier benefits */}
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(168,169,173,0.25)', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: font, fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                {t('nivelActual')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Star size={15} fill={colors.silver} color={colors.silver} />
                <span style={{ fontFamily: font, fontWeight: 900, fontSize: 24, color: colors.silver, letterSpacing: 1 }}>{tierInfo.label[lang]}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: font, fontWeight: 900, fontSize: 28, color: colors.orange, lineHeight: 1, letterSpacing: -1 }}>{currentPoints}</div>
              <div style={{ fontFamily: font, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{t('puntosTotales')}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
              <div style={{ fontFamily: font, fontWeight: 900, fontSize: 18, color: colors.orange, lineHeight: 1 }}>{tierInfo.perksMultiplier}</div>
              <div style={{ fontFamily: font, fontSize: 9, color: 'rgba(255,255,255,0.4)', lineHeight: 1.3, marginTop: 2 }}>
                {lang === 'es' ? 'pts por compra' : 'pts per purchase'}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
              <div style={{ fontFamily: font, fontWeight: 900, fontSize: 18, color: colors.orange, lineHeight: 1 }}>5%</div>
              <div style={{ fontFamily: font, fontSize: 9, color: 'rgba(255,255,255,0.4)', lineHeight: 1.3, marginTop: 2 }}>
                {lang === 'es' ? 'desc. materiales' : 'materials discount'}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
              <div style={{ fontFamily: font, fontWeight: 900, fontSize: 18, color: colors.orange, lineHeight: 1 }}>VIP</div>
              <div style={{ fontFamily: font, fontSize: 9, color: 'rgba(255,255,255,0.4)', lineHeight: 1.3, marginTop: 2 }}>
                {lang === 'es' ? 'asesor asignado' : 'assigned advisor'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mi Asesor */}
      <div style={{ padding: '20px 16px 4px' }}>
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: 17, color: colors.dark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          {t('miAsesor')}
        </div>
        <div style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,#374151,#111111)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2.5px solid ${colors.orange}` }}>
            <span style={{ fontFamily: font, fontWeight: 900, fontSize: 16, color: 'white' }}>{advisor.initials}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: font, fontSize: 15, fontWeight: 700, color: colors.dark, lineHeight: 1.1 }}>{advisor.name}</div>
            <div style={{ fontFamily: font, fontSize: 11, color: colors.gray400, marginTop: 2 }}>{t('asesorTienda', { store: advisor.store })}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <a
              href={advisor.whatsapp}
              target="_blank"
              rel="noreferrer"
              style={{ background: colors.whatsapp, borderRadius: 8, padding: '7px 11px', fontFamily: font, fontSize: 11, fontWeight: 700, color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', whiteSpace: 'nowrap' }}
            >
              <WhatsAppIcon size={12} />
              WhatsApp
            </a>
            <button onClick={openMessage} style={{ background: colors.cardBg, border: 'none', borderRadius: 8, padding: '7px 11px', fontFamily: font, fontSize: 11, fontWeight: 700, color: colors.dark, cursor: 'pointer', textTransform: 'uppercase' }}>
              {t('mensaje')}
            </button>
          </div>
        </div>
      </div>

      {/* Idioma / Language */}
      <div style={{ padding: '20px 16px 4px' }}>
        <div style={{ background: 'white', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: font, fontSize: 14, fontWeight: 600, color: colors.dark }}>{lang === 'es' ? 'Idioma' : 'Language'}</div>
            <div style={{ fontFamily: font, fontSize: 11, color: colors.gray400, marginTop: 1 }}>Español / English</div>
          </div>
          <button
            onClick={toggleLang}
            style={{ background: colors.cardBg, border: 'none', borderRadius: 20, padding: '7px 16px', fontFamily: font, fontSize: 12, fontWeight: 800, color: colors.dark, cursor: 'pointer', letterSpacing: 0.5 }}
          >
            {lang === 'es' ? 'ES' : 'EN'} → {t('langToggle')}
          </button>
        </div>
      </div>

      {/* Notificaciones */}
      <div style={{ padding: '20px 16px 4px' }}>
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: 17, color: colors.dark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          {t('notificaciones')}
        </div>
        <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
          {notifRows.map((row, i) => (
            <div
              key={row.key}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: i === notifRows.length - 1 ? undefined : `1px solid ${colors.cardBg}` }}
            >
              <div>
                <div style={{ fontFamily: font, fontSize: 14, fontWeight: 600, color: colors.dark }}>{t(row.titleKey)}</div>
                <div style={{ fontFamily: font, fontSize: 11, color: colors.gray400, marginTop: 1 }}>{t(row.subKey)}</div>
              </div>
              <Toggle on={row.on} onToggle={() => toggleNotif(row.key)} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 28px' }}>
        <button
          onClick={signOut}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1.5px solid #E5E7EB',
            borderRadius: 12,
            padding: 14,
            fontFamily: font,
            fontSize: 14,
            fontWeight: 700,
            color: colors.gray400,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <LogOut size={16} />
          {t('cerrarSesion')}
        </button>
      </div>
    </div>
  );
}

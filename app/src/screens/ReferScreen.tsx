import { ChevronLeft, Link2 } from 'lucide-react';
import { colors, font } from '../theme';
import { useAppState } from '../state/AppStateContext';
import { useLanguage } from '../i18n/LanguageContext';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ReferScreen() {
  const { closeReferScreen, referralCopied, copyReferral, referrals, me } = useAppState();
  const { t, lang } = useLanguage();

  const referralUrl = `ranchpreferred.com/ref/${me?.referralCode ?? ''}`;
  const totalPts = referrals.reduce((sum, r) => sum + r.pts, 0);
  const dateFmt = new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' });
  const whatsappText = encodeURIComponent(
    lang === 'es'
      ? `Oye! Te invito a Ranch Preferred, el programa de puntos de The Ranch Fence Supply. Regístrate aquí: ${referralUrl}`
      : `Hey! Check out Ranch Preferred, The Ranch Fence Supply's points program. Sign up here: ${referralUrl}`,
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: colors.cardBg, zIndex: 40, display: 'flex', flexDirection: 'column', animation: 'slideUp 0.25s ease' }}>
      <div style={{ background: colors.dark, padding: '16px 20px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={closeReferScreen} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <ChevronLeft size={18} color="white" strokeWidth={2.5} />
          </button>
          <div>
            <div style={{ fontFamily: font, fontWeight: 900, fontSize: 24, color: 'white', textTransform: 'uppercase', lineHeight: 1 }}>{t('referirGanar')}</div>
            <div style={{ fontFamily: font, fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{t('referirGanarSub')}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: `linear-gradient(135deg,${colors.orange},${colors.orangeDark})`, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontFamily: font, fontWeight: 900, fontSize: 38, color: 'white', lineHeight: 1, marginBottom: 2, letterSpacing: -1 }}>50</div>
            <div style={{ fontFamily: font, fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('puntos')}</div>
            <div style={{ fontFamily: font, fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 6, lineHeight: 1.4 }}>
              {lang === 'es' ? (
                <>
                  Si su primera compra
                  <br />
                  es mayor de <strong style={{ color: 'white' }}>$2,000</strong>
                </>
              ) : (
                <>
                  If their first purchase
                  <br />
                  is over <strong style={{ color: 'white' }}>$2,000</strong>
                </>
              )}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontFamily: font, fontWeight: 900, fontSize: 38, color: 'white', lineHeight: 1, marginBottom: 2, letterSpacing: -1 }}>10</div>
            <div style={{ fontFamily: font, fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('puntos')}</div>
            <div style={{ fontFamily: font, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6, lineHeight: 1.4 }}>
              {lang === 'es' ? (
                <>
                  Por cualquier primera
                  <br />
                  compra de tu referido
                </>
              ) : (
                <>
                  For any first purchase
                  <br />
                  from your referral
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Share link card */}
        <div style={{ background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 12 }}>
          <div style={{ fontFamily: font, fontWeight: 800, fontSize: 15, color: colors.dark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            {t('tierLinkLabel')}
          </div>
          <div style={{ background: colors.cardBg, borderRadius: 10, padding: '11px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link2 size={14} color={colors.gray400} />
            <span style={{ fontFamily: font, fontSize: 12, color: colors.gray500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{referralUrl}</span>
            <button onClick={copyReferral} style={{ background: colors.orange, border: 'none', borderRadius: 7, padding: '6px 12px', fontFamily: font, fontSize: 11, fontWeight: 700, color: colors.dark, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', minWidth: 68 }}>
              {referralCopied ? t('copiado') : t('copiar')}
            </button>
          </div>
          <a
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: colors.whatsapp, borderRadius: 12, padding: 13, textDecoration: 'none' }}
          >
            <WhatsAppIcon size={18} />
            <span style={{ fontFamily: font, fontSize: 14, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('compartirWhatsApp')}</span>
          </a>
        </div>

        {/* How it works */}
        <div style={{ background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 12 }}>
          <div style={{ fontFamily: font, fontWeight: 800, fontSize: 15, color: colors.dark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
            {t('comoFunciona')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { n: 1, title: t('paso1Titulo'), sub: t('paso1Sub') },
              { n: 2, title: t('paso2Titulo'), sub: t('paso2Sub') },
              {
                n: 3,
                title: t('paso3Titulo'),
                sub: lang === 'es' ? (
                  <>
                    Ganas <strong style={{ color: colors.orange }}>50 pts</strong> si supera $2,000 · <strong style={{ color: colors.dark }}>10 pts</strong> por cualquier compra
                  </>
                ) : (
                  <>
                    You earn <strong style={{ color: colors.orange }}>50 pts</strong> if it's over $2,000 · <strong style={{ color: colors.dark }}>10 pts</strong> for any purchase
                  </>
                ),
              },
            ].map((step) => (
              <div key={step.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 28, height: 28, background: colors.orange, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: font, fontWeight: 900, fontSize: 14, color: 'white' }}>{step.n}</span>
                </div>
                <div style={{ paddingTop: 3 }}>
                  <div style={{ fontFamily: font, fontSize: 13, fontWeight: 700, color: colors.dark }}>{step.title}</div>
                  <div style={{ fontFamily: font, fontSize: 12, color: colors.gray500, marginTop: 1 }}>{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referrals list */}
        <div style={{ background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: font, fontWeight: 800, fontSize: 15, color: colors.dark, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('tusReferidos')}</div>
            <div style={{ background: 'rgba(243,112,33,0.1)', borderRadius: 20, padding: '4px 12px' }}>
              <span style={{ fontFamily: font, fontWeight: 800, fontSize: 13, color: colors.orange }}>
                {referrals.length} {t('referidos').toLowerCase()} · {totalPts} pts
              </span>
            </div>
          </div>
          {referrals.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i === referrals.length - 1 ? undefined : '1px solid #F3F4F6' }}>
              <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#374151,#111111)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: font, fontWeight: 800, fontSize: 14, color: 'white' }}>{initialsOf(r.refereeName)}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: font, fontSize: 13, fontWeight: 700, color: colors.dark }}>{r.refereeName}</div>
                <div style={{ fontFamily: font, fontSize: 11, color: colors.gray400, marginTop: 1 }}>
                  {t('primeraCompra')}: ${r.amount.toLocaleString()} · {dateFmt.format(new Date(r.date))}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: font, fontWeight: 800, fontSize: 15, color: r.qualified ? colors.green : colors.orange }}>+{r.pts} pts</div>
                <div style={{ fontFamily: font, fontSize: 10, color: r.qualified ? colors.green : colors.gray400, marginTop: 1 }}>
                  {r.qualified ? '+$2,000 ✓' : t('compraRegular')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

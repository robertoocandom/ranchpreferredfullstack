import { useEffect, useRef } from 'react';
import { colors, font } from '../theme';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import logoRanch from '../assets/logo-ranch.png';

export function SignInScreen() {
  const { googleClientId, signInDemo, authError } = useAuth();
  const { t } = useLanguage();
  const buttonHost = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!googleClientId) return;
    const tryRender = () => {
      if (!window.google || !buttonHost.current) return false;
      window.google.accounts.id.renderButton(buttonHost.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        width: 280,
      });
      return true;
    };
    if (tryRender()) return;
    const interval = setInterval(() => {
      if (tryRender()) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [googleClientId]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: colors.dark,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 28px',
        textAlign: 'center',
      }}
    >
      <div style={{ background: 'white', borderRadius: 16, padding: '16px 24px', marginBottom: 28 }}>
        <img src={logoRanch} style={{ height: 44, width: 'auto', display: 'block' }} alt="The Ranch Fence Supply" />
      </div>
      <div style={{ fontFamily: font, fontWeight: 900, fontSize: 26, color: 'white', textTransform: 'uppercase', marginBottom: 6 }}>
        {t('signInTitle')}
      </div>
      <div style={{ fontFamily: font, fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 36, maxWidth: 280 }}>
        {t('signInSubtitle')}
      </div>

      {googleClientId && <div ref={buttonHost} style={{ marginBottom: 14 }} />}

      <button
        onClick={() => void signInDemo()}
        style={{
          width: 280,
          background: googleClientId ? 'transparent' : colors.orange,
          border: googleClientId ? '1.5px solid rgba(255,255,255,0.25)' : 'none',
          borderRadius: 99,
          padding: 13,
          fontFamily: font,
          fontSize: 14,
          fontWeight: 700,
          color: googleClientId ? 'rgba(255,255,255,0.75)' : colors.dark,
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: 0.3,
        }}
      >
        {t('signInDemo')}
      </button>

      {authError && (
        <div style={{ fontFamily: font, fontSize: 12, color: '#FCA5A5', marginTop: 16, maxWidth: 280 }}>{authError}</div>
      )}

      <div style={{ fontFamily: font, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 28, maxWidth: 280, lineHeight: 1.5 }}>
        {t('signInLegal')}
      </div>
    </div>
  );
}

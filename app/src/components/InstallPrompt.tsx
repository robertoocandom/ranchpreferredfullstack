import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { colors, font } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'ranch-preferred:install-dismissed';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const { t } = useLanguage();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');

  useEffect(() => {
    if (isStandalone() || dismissed) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    if (isIos()) setIosHint(true);

    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, [dismissed]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  if (dismissed || (!deferred && !iosHint)) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 'calc(78px + env(safe-area-inset-bottom))',
        maxWidth: 406,
        margin: '0 auto',
        background: colors.dark,
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        zIndex: 90,
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ width: 34, height: 34, background: 'rgba(243,112,33,0.15)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Download size={16} color={colors.orange} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: font, fontSize: 13, fontWeight: 700, color: 'white' }}>{t('installTitle')}</div>
        <div style={{ fontFamily: font, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>
          {iosHint && !deferred ? (t('installBody') + ' (Compartir → Agregar a inicio)') : t('installBody')}
        </div>
      </div>
      {deferred && (
        <button
          onClick={async () => {
            await deferred.prompt();
            await deferred.userChoice;
            setDeferred(null);
            dismiss();
          }}
          style={{ background: colors.orange, border: 'none', borderRadius: 8, padding: '7px 12px', fontFamily: font, fontSize: 11, fontWeight: 700, color: colors.dark, cursor: 'pointer', textTransform: 'uppercase', flexShrink: 0 }}
        >
          {t('installBtn')}
        </button>
      )}
      <button onClick={dismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', flexShrink: 0, padding: 4 }}>
        <X size={16} />
      </button>
    </div>
  );
}

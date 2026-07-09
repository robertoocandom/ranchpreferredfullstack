import { Home, QrCode, Award, MapPin, User, ShieldCheck } from 'lucide-react';
import { useAppState, type TabKey } from '../state/AppStateContext';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, font } from '../theme';

const BASE_TABS: Array<{ key: TabKey; icon: typeof Home; labelKey: 'navInicio' | 'navActivar' | 'navPuntos' | 'navTiendas' | 'navCuenta' | 'navAdmin' }> = [
  { key: 'home', icon: Home, labelKey: 'navInicio' },
  { key: 'activate', icon: QrCode, labelKey: 'navActivar' },
  { key: 'points', icon: Award, labelKey: 'navPuntos' },
  { key: 'stores', icon: MapPin, labelKey: 'navTiendas' },
  { key: 'account', icon: User, labelKey: 'navCuenta' },
];

export function BottomNav() {
  const { activeTab, setActiveTab, me } = useAppState();
  const { t } = useLanguage();
  const TABS = me?.isAdmin ? [...BASE_TABS, { key: 'admin' as TabKey, icon: ShieldCheck, labelKey: 'navAdmin' as const }] : BASE_TABS;

  return (
    <nav
      style={{
        height: 70,
        background: colors.dark,
        display: 'flex',
        alignItems: 'stretch',
        flexShrink: 0,
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map(({ key, icon: Icon, labelKey }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              color: active ? colors.orange : '#6B7280',
              borderTop: `2px solid ${active ? colors.orange : 'transparent'}`,
              padding: '8px 0',
            }}
          >
            <Icon size={20} strokeWidth={2} />
            <span style={{ fontFamily: font, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {t(labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { AppStateProvider, useAppState } from './state/AppStateContext';
import { colors } from './theme';
import { SignInScreen } from './screens/SignInScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ActivateScreen } from './screens/ActivateScreen';
import { PointsScreen } from './screens/PointsScreen';
import { StoresScreen } from './screens/StoresScreen';
import { AccountScreen } from './screens/AccountScreen';
import { AdminScreen } from './screens/AdminScreen';
import { ReferScreen } from './screens/ReferScreen';
import { RedeemModal } from './screens/RedeemModal';
import { MessageModal } from './screens/MessageModal';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { InstallPrompt } from './components/InstallPrompt';
import { useLanguage } from './i18n/LanguageContext';

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 430,
        margin: '0 auto',
        height: '100dvh',
        background: colors.cardBg,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
}

function MainApp() {
  const { activeTab, showReferScreen, showRedeemToast, loading, error, refreshAll } = useAppState();
  const { t } = useLanguage();

  if (loading) {
    return (
      <AppShell>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.dark }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Cargando...</span>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'center', background: colors.dark, padding: 32, textAlign: 'center' }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: 'white', fontWeight: 700 }}>{error}</span>
          <button
            onClick={() => void refreshAll()}
            style={{ background: colors.orange, border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: colors.dark, cursor: 'pointer' }}
          >
            Reintentar
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'activate' && <ActivateScreen />}
        {activeTab === 'points' && <PointsScreen />}
        {activeTab === 'stores' && <StoresScreen />}
        {activeTab === 'account' && <AccountScreen />}
        {activeTab === 'admin' && <AdminScreen />}
      </div>

      <BottomNav />

      {showReferScreen && <ReferScreen />}
      <RedeemModal />
      <MessageModal />
      {showRedeemToast && <Toast text={t('canjeExitoso')} />}
      <InstallPrompt />
    </AppShell>
  );
}

function Gate() {
  const { user } = useAuth();
  if (!user) return <SignInScreen />;
  return (
    <AppStateProvider>
      <MainApp />
    </AppStateProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

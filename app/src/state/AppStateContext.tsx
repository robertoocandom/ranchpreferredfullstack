import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError, type HistoryItem, type MeResponse, type RedeemResponse, type RewardDto, type ReferralDto, type StoreDto } from '../api/client';
import { subscribeToPush, unsubscribeFromPush, pushSupported } from '../hooks/usePush';

export type TabKey = 'home' | 'activate' | 'points' | 'stores' | 'account' | 'admin';

interface AppStateValue {
  activeTab: TabKey;
  setActiveTab: (t: TabKey) => void;

  loading: boolean;
  error: string | null;
  me: MeResponse | null;
  currentPoints: number;
  tier: MeResponse['tier'];

  pointsHistory: HistoryItem[];
  rewards: RewardDto[];
  stores: StoreDto[];
  referrals: ReferralDto[];
  refreshAll: () => Promise<void>;

  redeemModal: RedeemResponse | null;
  openRewardRedeem: (rewardId: string) => Promise<void>;
  openCustomRedeem: () => Promise<void>;
  closeRedeemModal: () => void;
  confirmRedeem: () => Promise<void>;

  customRedeemPts: number;
  incCustom: () => void;
  decCustom: () => void;

  showRedeemToast: boolean;

  showReferScreen: boolean;
  openReferScreen: () => void;
  closeReferScreen: () => void;

  referralCopied: boolean;
  copyReferral: () => void;

  showAdvisorMessage: boolean;
  openMessage: () => void;
  closeMessage: () => void;
  sendMessage: () => void;

  notifPromos: boolean;
  notifPuntos: boolean;
  notifTiendas: boolean;
  notifReferidos: boolean;
  toggleNotif: (key: 'notifPromos' | 'notifPuntos' | 'notifTiendas' | 'notifReferidos') => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [pointsHistory, setPointsHistory] = useState<HistoryItem[]>([]);
  const [rewards, setRewards] = useState<RewardDto[]>([]);
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [referrals, setReferrals] = useState<ReferralDto[]>([]);

  const [redeemModal, setRedeemModal] = useState<RedeemResponse | null>(null);
  const [customRedeemPts, setCustomRedeemPts] = useState(100);
  const [showRedeemToast, setShowRedeemToast] = useState(false);
  const [showReferScreen, setShowReferScreen] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [showAdvisorMessage, setShowAdvisorMessage] = useState(false);

  const [notifPromos, setNotifPromos] = useState(true);
  const [notifPuntos, setNotifPuntos] = useState(true);
  const [notifTiendas, setNotifTiendas] = useState(false);
  const [notifReferidos, setNotifReferidos] = useState(true);

  const refreshAll = async () => {
    try {
      const [meRes, historyRes, rewardsRes, storesRes, referralsRes] = await Promise.all([
        api.me(),
        api.pointsHistory(),
        api.rewards(),
        api.stores(),
        api.referrals(),
      ]);
      setMe(meRes);
      setPointsHistory(historyRes);
      setRewards(rewardsRes);
      setStores(storesRes);
      setReferrals(referralsRes);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 0
          ? 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
          : 'Ocurrió un error cargando tu cuenta.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AppStateValue>(() => {
    const notifState = { notifPromos, notifPuntos, notifTiendas, notifReferidos };

    const toggleNotif: AppStateValue['toggleNotif'] = (key) => {
      const setters = {
        notifPromos: setNotifPromos,
        notifPuntos: setNotifPuntos,
        notifTiendas: setNotifTiendas,
        notifReferidos: setNotifReferidos,
      } as const;

      const currentValue = notifState[key];
      const turningOn = !currentValue;
      setters[key]((v) => !v);

      if (!pushSupported()) return;

      if (turningOn) {
        void subscribeToPush();
      } else {
        // Unsubscribe only when ALL are being turned off
        const remaining = Object.entries(notifState)
          .filter(([k]) => k !== key)
          .some(([, v]) => v);
        if (!remaining) void unsubscribeFromPush();
      }
    };

    return {
      activeTab,
      setActiveTab,

      loading,
      error,
      me,
      currentPoints: me?.points ?? 0,
      tier: me?.tier ?? 'BRONCE',

      pointsHistory,
      rewards,
      stores,
      referrals,
      refreshAll,

      redeemModal,
      openRewardRedeem: async (rewardId) => {
        try {
          const res = await api.redeem({ rewardId });
          setRedeemModal(res);
        } catch {
          setError('No se pudo generar el canje. Intenta de nuevo.');
        }
      },
      openCustomRedeem: async () => {
        try {
          const res = await api.redeem({ customPts: customRedeemPts });
          setRedeemModal(res);
        } catch {
          setError('No se pudo generar el canje. Intenta de nuevo.');
        }
      },
      closeRedeemModal: () => setRedeemModal(null),
      confirmRedeem: async () => {
        if (!redeemModal) return;
        try {
          const res = await api.confirmRedeem(redeemModal.jti);
          setMe((prev) => (prev ? { ...prev, points: res.points } : prev));
          setRedeemModal(null);
          setShowRedeemToast(true);
          setTimeout(() => setShowRedeemToast(false), 2500);
          void api.pointsHistory().then(setPointsHistory);
        } catch {
          setError('No se pudo confirmar el canje.');
        }
      },

      customRedeemPts,
      incCustom: () => setCustomRedeemPts((p) => Math.min(p + 100, Math.floor((me?.points ?? 0) / 100) * 100 || 100)),
      decCustom: () => setCustomRedeemPts((p) => Math.max(100, p - 100)),

      showRedeemToast,

      showReferScreen,
      openReferScreen: () => setShowReferScreen(true),
      closeReferScreen: () => setShowReferScreen(false),

      referralCopied,
      copyReferral: () => {
        setReferralCopied(true);
        setTimeout(() => setReferralCopied(false), 2000);
      },

      showAdvisorMessage,
      openMessage: () => setShowAdvisorMessage(true),
      closeMessage: () => setShowAdvisorMessage(false),
      sendMessage: () => setShowAdvisorMessage(false),

      notifPromos,
      notifPuntos,
      notifTiendas,
      notifReferidos,
      toggleNotif,
    };
  }, [
    activeTab,
    loading,
    error,
    me,
    pointsHistory,
    rewards,
    stores,
    referrals,
    redeemModal,
    customRedeemPts,
    showRedeemToast,
    showReferScreen,
    referralCopied,
    showAdvisorMessage,
    notifPromos,
    notifPuntos,
    notifTiendas,
    notifReferidos,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

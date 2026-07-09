import { useEffect, useState } from 'react';
import { LogOut, CheckCircle, XCircle, ScanLine, DollarSign } from 'lucide-react';
import { api, ApiError } from '../api/client';
import { colors, font } from '../theme';

interface CashierSession {
  token: string;
  storeName: string;
}

type ScanResult = {
  purpose: 'ACTIVATE' | 'REDEEM';
  contractorName: string;
  ptsEarned?: number;
  ptsDeducted?: number;
  newBalance: number;
  amountUsd?: number;
  dollars?: number;
  rewardName?: string;
};

interface Props {
  onExit: () => void;
}

export function CashierScreen({ onExit }: Props) {
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [session, setSession] = useState<CashierSession | null>(null);
  const [storeId, setStoreId] = useState('');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');

  const [qrValue, setQrValue] = useState('');
  const [amountUsd, setAmountUsd] = useState('');
  const [needsAmount, setNeedsAmount] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState('');

  useEffect(() => {
    api.cashierStores().then(setStores).catch(() => {});
  }, []);

  const login = async () => {
    setLoginError('');
    try {
      const res = await api.cashierLogin(storeId, pin);
      setSession(res);
    } catch (e) {
      setLoginError(e instanceof ApiError && e.status === 401 ? 'PIN incorrecto' : 'Error de conexión');
    }
  };

  const scan = async (finalAmount?: string) => {
    if (!session || !qrValue.trim()) return;
    setScanError('');
    setScanning(true);
    try {
      const amt = finalAmount ?? amountUsd;
      const res = await api.cashierScan(session.token, qrValue.trim(), amt ? Number(amt) : undefined);

      if (res.purpose === 'ACTIVATE' && !amt) {
        // Backend told us amount is required — show amount input
        setNeedsAmount(true);
        setScanning(false);
        return;
      }

      setResult(res);
      setQrValue('');
      setAmountUsd('');
      setNeedsAmount(false);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'error';
      const friendly: Record<string, string> = {
        qr_already_used: 'QR ya fue usado',
        qr_expired: 'QR expirado',
        qr_not_found: 'QR no encontrado',
        invalid_qr_format: 'Formato de QR inválido',
        insufficient_points: 'Puntos insuficientes',
        amountUsd_required_for_activation: 'Ingresa el monto de la compra',
      };
      if (msg === 'amountUsd_required_for_activation') {
        setNeedsAmount(true);
      } else {
        setScanError(friendly[msg] ?? 'Error al procesar el QR');
      }
    } finally {
      setScanning(false);
    }
  };

  const reset = () => { setResult(null); setScanError(''); setNeedsAmount(false); setAmountUsd(''); };

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div style={{ minHeight: '100dvh', background: colors.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', fontFamily: font }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <button onClick={onExit} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: font, marginBottom: 32, padding: 0 }}>
            ← Volver
          </button>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', margin: '0 0 4px' }}>Modo Cajero</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 28px' }}>Inicia sesión con el PIN de tu tienda</p>

          <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Tienda</label>
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 14px', color: storeId ? 'white' : 'rgba(255,255,255,0.35)', fontSize: 14, fontFamily: font, marginBottom: 14, boxSizing: 'border-box', appearance: 'none' }}
          >
            <option value="">Selecciona una tienda...</option>
            {stores.map((s) => <option key={s.id} value={s.id} style={{ background: '#1a1a1a' }}>{s.name}</option>)}
          </select>

          <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>PIN</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && void login()}
            placeholder="••••"
            style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 20, fontFamily: font, marginBottom: 20, boxSizing: 'border-box', textAlign: 'center', letterSpacing: 8 }}
          />

          {loginError && <p style={{ color: '#fca5a5', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{loginError}</p>}

          <button
            onClick={() => void login()}
            disabled={!storeId || pin.length < 4}
            style={{ width: '100%', background: storeId && pin.length >= 4 ? colors.orange : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: 14, fontFamily: font, fontWeight: 800, fontSize: 15, color: storeId && pin.length >= 4 ? colors.dark : 'rgba(255,255,255,0.3)', cursor: storeId && pin.length >= 4 ? 'pointer' : 'default', textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100dvh', background: colors.dark, display: 'flex', flexDirection: 'column', fontFamily: font }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Modo Cajero</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Tienda {session.storeName}</div>
        </div>
        <button onClick={() => setSession(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 10px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: font }}>
          <LogOut size={13} /> Salir
        </button>
      </div>

      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Result */}
        {result && (
          <div style={{ background: result.purpose === 'ACTIVATE' ? 'rgba(34,197,94,0.12)' : 'rgba(251,146,60,0.12)', border: `1px solid ${result.purpose === 'ACTIVATE' ? '#22c55e44' : '#fb923c44'}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <CheckCircle size={22} color={result.purpose === 'ACTIVATE' ? '#22c55e' : colors.orange} />
              <span style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>
                {result.purpose === 'ACTIVATE' ? '¡Compra registrada!' : '¡Canje confirmado!'}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Contratista: <strong style={{ color: 'white' }}>{result.contractorName}</strong></div>
            {result.purpose === 'ACTIVATE' && (
              <>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Monto: <strong style={{ color: 'white' }}>${result.amountUsd?.toFixed(2)}</strong></div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Puntos acreditados: <strong style={{ color: '#22c55e' }}>+{result.ptsEarned} pts</strong></div>
              </>
            )}
            {result.purpose === 'REDEEM' && (
              <>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Premio: <strong style={{ color: 'white' }}>{result.rewardName}</strong></div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Crédito: <strong style={{ color: colors.orange }}>${result.dollars}</strong></div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Puntos descontados: <strong style={{ color: '#f87171' }}>−{result.ptsDeducted} pts</strong></div>
              </>
            )}
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Nuevo saldo: {result.newBalance} pts</div>
            <button onClick={reset} style={{ marginTop: 14, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer', fontFamily: font }}>
              Nuevo escaneo
            </button>
          </div>
        )}

        {/* Error */}
        {scanError && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid #ef444444', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <XCircle size={18} color='#ef4444' />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>{scanError}</div>
              <button onClick={reset} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: font, padding: 0, marginTop: 4 }}>Intentar de nuevo</button>
            </div>
          </div>
        )}

        {/* Scan form */}
        {!result && (
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <ScanLine size={18} color={colors.orange} />
              <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>Escanear QR del contratista</span>
            </div>

            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Código QR</label>
            <input
              value={qrValue}
              onChange={(e) => { setQrValue(e.target.value); setNeedsAmount(false); setScanError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && void scan()}
              placeholder="RANCHPREFERRED:ACTIVATE:..."
              autoComplete="off"
              style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '11px 13px', color: 'white', fontSize: 13, fontFamily: 'monospace', marginBottom: 12, boxSizing: 'border-box' }}
            />

            {needsAmount && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <DollarSign size={14} color={colors.orange} />
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Monto de la compra (USD)</label>
                </div>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amountUsd}
                  onChange={(e) => setAmountUsd(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void scan(amountUsd)}
                  placeholder="150.00"
                  autoFocus
                  style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.07)', border: `1px solid ${colors.orange}66`, borderRadius: 10, padding: '11px 13px', color: 'white', fontSize: 16, fontFamily: font, marginBottom: 12, boxSizing: 'border-box' }}
                />
              </>
            )}

            <button
              onClick={() => void scan()}
              disabled={!qrValue.trim() || scanning || (needsAmount && !amountUsd)}
              style={{ width: '100%', background: qrValue.trim() && !scanning ? colors.orange : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: 13, fontFamily: font, fontWeight: 800, fontSize: 14, color: qrValue.trim() && !scanning ? colors.dark : 'rgba(255,255,255,0.3)', cursor: qrValue.trim() && !scanning ? 'pointer' : 'default', textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {scanning ? 'Procesando...' : needsAmount ? 'Confirmar Compra' : 'Procesar QR'}
            </button>
          </div>
        )}

        {/* Instructions */}
        {!result && (
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Cómo usar:</strong><br />
              1. El contratista abre su QR en la app<br />
              2. Escanea el QR con cualquier lector y pega el código aquí<br />
              3. Para compras, ingresa el monto total de la compra<br />
              4. Para canjes, solo confirma — el sistema descuenta los puntos
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X } from 'lucide-react';
import { colors, font } from '../theme';
import { useAppState } from '../state/AppStateContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Sheet } from '../components/Sheet';
import { advisor } from '../data/sampleData';

export function MessageModal() {
  const { showAdvisorMessage, closeMessage, sendMessage } = useAppState();
  const { t } = useLanguage();
  const [text, setText] = useState('');

  if (!showAdvisorMessage) return null;

  return (
    <Sheet onDismiss={closeMessage} darkBackdrop={false} zIndex={60}>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: font, fontWeight: 800, fontSize: 20, color: colors.dark }}>{t('mensajeA', { name: advisor.name })}</div>
          <button onClick={closeMessage} style={{ background: colors.cardBg, border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color={colors.gray500} />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('escribeMensaje')}
          style={{ width: '100%', height: 100, border: '1.5px solid #E5E7EB', borderRadius: 12, padding: 12, fontFamily: font, fontSize: 14, color: colors.dark, resize: 'none', outline: 'none', display: 'block' }}
        />
        <button
          onClick={() => {
            sendMessage();
            setText('');
          }}
          style={{ width: '100%', background: colors.orange, border: 'none', borderRadius: 12, padding: 14, fontFamily: font, fontSize: 15, fontWeight: 700, color: colors.dark, cursor: 'pointer', textTransform: 'uppercase', marginTop: 12, letterSpacing: 0.5 }}
        >
          {t('enviarMensaje')}
        </button>
      </div>
    </Sheet>
  );
}

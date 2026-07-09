import { Star } from 'lucide-react';
import { font } from '../theme';
import { tiers, type TierName } from '../data/tiers';
import { useLanguage } from '../i18n/LanguageContext';

export function TierPill({ tier, dark = true }: { tier: TierName; dark?: boolean }) {
  const { lang } = useLanguage();
  const info = tiers.find((t) => t.key === tier)!;
  return (
    <div
      style={{
        border: `1.5px solid ${info.accent}`,
        borderRadius: 20,
        padding: '5px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: dark ? `${info.accent}1f` : `${info.accent}14`,
      }}
    >
      <Star size={11} fill={info.accent} color={info.accent} />
      <span style={{ fontFamily: font, fontWeight: 800, fontSize: 13, color: info.accent, letterSpacing: 1 }}>
        {info.label[lang]}
      </span>
    </div>
  );
}

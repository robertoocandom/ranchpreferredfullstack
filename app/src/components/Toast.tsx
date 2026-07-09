import { CheckCircle2 } from 'lucide-react';
import { font } from '../theme';

export function Toast({ text }: { text: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 84,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 100,
        pointerEvents: 'none',
        animation: 'scaleIn 0.2s ease',
      }}
    >
      <div
        style={{
          background: '#111111',
          border: '1.5px solid #16A34A',
          color: 'white',
          borderRadius: 12,
          padding: '12px 20px',
          fontFamily: font,
          fontSize: 13,
          fontWeight: 700,
          boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          whiteSpace: 'nowrap',
        }}
      >
        <CheckCircle2 size={16} color="#16A34A" />
        {text}
      </div>
    </div>
  );
}

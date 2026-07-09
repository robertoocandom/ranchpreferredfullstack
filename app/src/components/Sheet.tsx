import type { ReactNode } from 'react';

export function Sheet({
  children,
  onDismiss,
  darkBackdrop = true,
  zIndex = 60,
}: {
  children: ReactNode;
  onDismiss?: () => void;
  darkBackdrop?: boolean;
  zIndex?: number;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: darkBackdrop ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex,
        animation: 'fadeUp 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss?.();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          background: 'white',
          borderRadius: '24px 24px 0 0',
          animation: 'slideUp 0.25s ease',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}

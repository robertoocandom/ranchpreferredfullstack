import { colors } from '../theme';

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onToggle();
      }}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: on ? colors.orange : '#D1D5DB',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s',
        display: 'flex',
        alignItems: 'center',
        padding: 3,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          transform: on ? 'translateX(18px)' : 'translateX(0)',
          transition: 'transform 0.2s',
        }}
      />
    </div>
  );
}

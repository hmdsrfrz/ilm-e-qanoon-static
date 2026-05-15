import type { QuickAction } from '@/constants/quickActions';

interface Props {
  action: QuickAction;
  onSelect: (prompt: string) => void;
}

export default function QuickActionCard({ action, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(action.prompt)}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '16px',
        border: '1px solid #2a2a2a',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = '#009942';
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,153,66,0.06)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a';
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
      }}
    >
      {/* Symbol */}
      <div
        className="font-mono"
        style={{ fontSize: '18px', color: '#009942', marginBottom: '10px' }}
      >
        {action.symbol}
      </div>

      {/* Title */}
      <p
        className="font-mono"
        style={{ fontSize: '12px', color: '#F5F0E8', marginBottom: '4px' }}
      >
        {action.title}
      </p>

      {/* Subtitle */}
      <p
        className="font-mono uppercase"
        style={{ fontSize: '9px', color: '#9A8D80', letterSpacing: '0.2em' }}
      >
        {action.subtitle}
      </p>
    </button>
  );
}

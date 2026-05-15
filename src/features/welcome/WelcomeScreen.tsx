import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { CONSTITUTIONAL_QUICK_ACTIONS } from '@/constants/quickActions';
import QuickActionCard from './QuickActionCard';

interface Props {
  onSendMessage?: (prompt: string) => void;
}

export default function WelcomeScreen({ onSendMessage }: Props) {
  const navigate = useNavigate();
  const createSession = useChatStore((s) => s.createSession);

  const handleAction = async (prompt: string) => {
    if (onSendMessage) {
      onSendMessage(prompt);
    } else {
      const sessionId = await createSession(prompt);
      navigate(`/chat/${sessionId}`);
    }
  };

  return (
    /*
      Full height flex column — centers content vertically.
      Max width prevents text from spanning the full screen width.
      Padding keeps content away from edges.
    */
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 48px',
        maxWidth: '860px',        /* content never wider than this */
        margin: '0 auto',         /* Center the content horizontally if container is wide */
      }}
    >

      {/* Status label */}
      <p
        className="font-mono uppercase"
        style={{
          fontSize: '10px',
          color: '#009942',
          letterSpacing: '0.4em',
          marginBottom: '24px',
        }}
      >
        // Constitutional Archive Terminal · Active
      </p>

      {/* Main heading — REDUCED size to fit correctly */}
      <h1
        className="font-display"
        style={{
          fontSize: 'clamp(42px, 5vw, 80px)',   /* reduced from 7vw to 5vw */
          lineHeight: 1.0,
          color: '#F5F0E8',
          marginBottom: '24px',
        }}
      >
        WHAT IS YOUR<br />
        <span style={{ color: '#009942' }}>QUESTION?</span>
      </h1>

      {/* Instruction */}
      <p
        className="font-mono"
        style={{
          fontSize: '12px',
          color: '#9A8D80',
          lineHeight: 1.7,
          marginBottom: '40px',
          maxWidth: '480px',
        }}
      >
        Ask about any article, fundamental right, amendment, or clause.
        Responses cite the exact constitutional text.
      </p>

      {/* Quick action cards — 2 column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          maxWidth: '600px',
        }}
      >
        {CONSTITUTIONAL_QUICK_ACTIONS.map((action) => (
          <QuickActionCard
            key={action.id}
            action={action}
            onSelect={handleAction}
          />
        ))}
      </div>

    </div>
  );
}
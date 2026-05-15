import { useState } from 'react';
import { cn } from '@/lib/cn';

const DOMAIN_LABELS: Record<string, string> = {
  auto:           'Auto-detect',
  constitution:   'Constitution',
  family_law:     'Family Law',
  federal_admin:  'Federal Admin',
  local_govt:     'Local Govt',
  procedural_law: 'Procedural Law',
};

function domainLabel(bucket: string): string {
  return DOMAIN_LABELS[bucket] ?? bucket.replace(/_/g, ' ');
}

interface ChatInputProps {
  onSend:           (message: string) => void;
  disabled?:        boolean;
  loading?:         boolean;
  placeholder?:     string;
  className?:       string;
  domain:           string;
  domains:          string[];
  onDomainChange:   (domain: string) => void;
}

export function ChatInput({
  onSend,
  disabled   = false,
  loading    = false,
  placeholder = 'Ask about any law, ordinance, article, or clause…',
  className,
  domain,
  domains,
  onDomainChange,
}: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const sanitized = value.trim();
    if (sanitized && !disabled && !loading) {
      onSend(sanitized);
      setValue('');
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Input box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          border: '1px solid #2a2a2a',
          backgroundColor: '#0a0a0a',
          transition: 'border-color 0.15s',
        }}
        onFocusCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#009942'; }}
        onBlurCapture={(e)  => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a2a'; }}
      >
        <span
          className="font-mono"
          style={{ color: '#009942', fontSize: '14px', padding: '12px 12px 12px 16px', userSelect: 'none', flexShrink: 0, lineHeight: 1.5 }}
        >
          &gt;
        </span>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (value.trim() && !loading) handleSend();
            }
          }}
          placeholder={placeholder}
          disabled={disabled || loading}
          rows={1}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'IBM Plex Mono, Courier New, monospace',
            fontSize: '13px',
            color: '#F5F0E8',
            padding: '12px 8px',
            lineHeight: 1.5,
            minHeight: '46px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
          }}
        />

        <button
          onClick={handleSend}
          disabled={!value.trim() || loading}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'IBM Plex Mono, Courier New, monospace',
            fontSize: '11px',
            color: loading ? '#9A8D80' : '#009942',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            flexShrink: 0,
            opacity: (!value.trim() || loading) ? 0.3 : 1,
            transition: 'opacity 0.15s, color 0.15s',
          }}
        >
          {loading ? '...' : 'SEND'}
        </button>
      </div>

      {/* Bottom bar — domain selector left, hint right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>

        {/* Domain selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="font-mono" style={{ fontSize: '9px', color: '#9A8D80', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Searching in
          </span>
          <select
            value={domain}
            onChange={(e) => onDomainChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid #2a2a2a',
              color: domain === 'auto' ? '#9A8D80' : '#009942',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '9px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '1px 2px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#009942')}
            onBlur={(e)  => (e.currentTarget.style.borderColor = '#2a2a2a')}
          >
            {domains.map((b) => (
              <option key={b} value={b} style={{ background: '#0a0a0a', color: '#F5F0E8' }}>
                {domainLabel(b)}
              </option>
            ))}
          </select>
        </div>

        <span className="font-mono" style={{ fontSize: '9px', color: '#9A8D80', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          Shift + Enter for new line
        </span>
      </div>
    </div>
  );
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pk: {
          black:          '#0a0a0a',
          paper:          '#F8F4EE',
          green:          '#009942',
          'green-dim':    '#006B2C',
          'green-glow':   'rgba(0,153,66,0.15)',
          ink:            '#1a1a1a',
          muted:          '#9A8D80',
          border:         '#2a2a2a',
          'paper-border': '#D4CFC7',
          red:            '#C0392B',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', '"Courier New"', 'monospace'],
        quote:   ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'ticker':      'ticker 50s linear infinite',
        'blink-cur':   'blinkCursor 1s step-end infinite',
        'fade-line':   'fadeLine 0.7s ease forwards',
        'stamp':       'stamp 0.15s ease-out forwards',
        'pulse-dot':   'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },  // -50% because content is doubled for seamless loop
        },
        blinkCursor: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        fadeLine: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        stamp: {
          '0%':   { transform: 'scale(1.4)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.15' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(0,153,66,0.20)',
        'glow-md': '0 0 24px rgba(0,153,66,0.28)',
        'glow-lg': '0 0 48px rgba(0,153,66,0.20)',
      }
    }
  }
}

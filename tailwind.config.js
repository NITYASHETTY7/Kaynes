/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Surface layers — driven by CSS variables ──
        ink: {
          base: 'rgb(var(--s-base) / <alpha-value>)',
          900:  'rgb(var(--s-900) / <alpha-value>)',
          800:  'rgb(var(--s-800) / <alpha-value>)',
          750:  'rgb(var(--s-750) / <alpha-value>)',
          700:  'rgb(var(--s-700) / <alpha-value>)',
          600:  'rgb(var(--s-600) / <alpha-value>)',
          500:  'rgb(var(--s-500) / <alpha-value>)',
          400:  'rgb(var(--s-400) / <alpha-value>)',
        },
        // ── Neutral text — inverts across modes ──
        slate: {
          50:  'rgb(var(--n-50)  / <alpha-value>)',
          100: 'rgb(var(--n-100) / <alpha-value>)',
          200: 'rgb(var(--n-200) / <alpha-value>)',
          300: 'rgb(var(--n-300) / <alpha-value>)',
          400: 'rgb(var(--n-400) / <alpha-value>)',
          500: 'rgb(var(--n-500) / <alpha-value>)',
          600: 'rgb(var(--n-600) / <alpha-value>)',
          700: 'rgb(var(--n-700) / <alpha-value>)',
        },
        // ── Foreground heading ──
        fg: 'rgb(var(--fg) / <alpha-value>)',
        // ── Brand / semantic accents ──
        argo: {
          orange:  'rgb(var(--aws-orange)  / <alpha-value>)',
          sky:     'rgb(var(--sky-bright)  / <alpha-value>)',
          skyDeep: 'rgb(var(--sky-deep)    / <alpha-value>)',
          violet:  'rgb(var(--violet)      / <alpha-value>)',
          green:   'rgb(var(--emerald)     / <alpha-value>)',
          amber:   'rgb(var(--amber)       / <alpha-value>)',
          red:     'rgb(var(--rose)        / <alpha-value>)',
          // Legacy aliases for backward-compat
          cyan:    'rgb(var(--sky-bright)  / <alpha-value>)',
        },
      },

      fontFamily: {
        sans:    ['Inter',           'system-ui', 'sans-serif'],
        display: ['Outfit',          'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"','ui-monospace', 'monospace'],
      },

      boxShadow: {
        'card':          'var(--shadow-card)',
        'card-hover':    'var(--shadow-card-hover)',
        'glow-orange':   'var(--shadow-glow-orange)',
        'glow-sky':      'var(--shadow-glow-sky)',
        'glow-violet':   '0 0 24px 0 rgb(var(--violet) / 0.2)',
        'glow-emerald':  '0 0 24px 0 rgb(var(--emerald) / 0.2)',
        'glow-red':      '0 0 20px 0 rgb(var(--rose) / 0.25)',
        // Legacy
        'glow-cyan':        'var(--shadow-glow-sky)',
        'glow-cyan-strong': '0 0 30px 0 rgb(var(--sky-bright) / 0.3)',
        'glass-inner':      'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },

      keyframes: {
        pulseRing: {
          '0%':   { boxShadow: '0 0 0 0 rgba(239,68,68,0.5)' },
          '70%':  { boxShadow: '0 0 0 10px rgba(239,68,68,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0)' },
        },
        slideIn: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.8s infinite',
        slideIn:   'slideIn 0.25s ease-out',
        fadeIn:    'fadeIn 0.3s ease-out',
        shimmer:   'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
}

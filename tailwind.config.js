/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces (control-room dark by default; flip to light via CSS vars).
        ink: {
          900: 'rgb(var(--s-900) / <alpha-value>)',
          800: 'rgb(var(--s-800) / <alpha-value>)',
          700: 'rgb(var(--s-700) / <alpha-value>)',
          600: 'rgb(var(--s-600) / <alpha-value>)',
          500: 'rgb(var(--s-500) / <alpha-value>)',
        },
        // Neutral text/labels — themed so they invert in light mode.
        slate: {
          100: 'rgb(var(--n-100) / <alpha-value>)',
          200: 'rgb(var(--n-200) / <alpha-value>)',
          300: 'rgb(var(--n-300) / <alpha-value>)',
          400: 'rgb(var(--n-400) / <alpha-value>)',
          500: 'rgb(var(--n-500) / <alpha-value>)',
          600: 'rgb(var(--n-600) / <alpha-value>)',
          700: 'rgb(var(--n-700) / <alpha-value>)',
        },
        // Primary foreground (headings).
        fg: 'rgb(var(--fg) / <alpha-value>)',
        // Argo / Kaynes brand accents.
        argo: {
          cyan: 'rgb(var(--argo-cyan) / <alpha-value>)',
          violet: 'rgb(var(--argo-violet) / <alpha-value>)',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.5)' },
          '70%': { boxShadow: '0 0 0 10px rgba(239,68,68,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0)' },
        },
        slideIn: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.8s infinite',
        slideIn: 'slideIn 0.25s ease-out',
        fadeIn: 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

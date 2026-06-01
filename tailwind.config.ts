import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — to'q ko'k (navy / slate). Asosiy brend rangi.
        brand: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0a192f',
          950: '#020617',
          DEFAULT: '#0a192f',
        },
        // Accent — neon yashil / laym. CTA va g'olib status uchun.
        accent: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          DEFAULT: '#10b981',
        },
        // Surface — bloklar uchun
        surface: {
          DEFAULT: '#ffffff',
          soft:    '#f8f9fa',
          muted:   '#f1f5f9',
        },
      },
      backgroundImage: {
        'gradient-hero':   'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #ecfdf5 100%)',
        'gradient-brand':  'linear-gradient(135deg, #0a192f 0%, #1e293b 100%)',
        'gradient-accent': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-text-brand': 'linear-gradient(135deg, #0a192f 0%, #475569 100%)',
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 10px 24px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04)',
        'modal':      '0 25px 50px -12px rgba(15, 23, 42, 0.18)',
        'glow-accent':'0 8px 24px rgba(16, 185, 129, 0.25)',
        'glow-brand': '0 8px 24px rgba(10, 25, 47, 0.18)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
